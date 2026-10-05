const mongoose = require("mongoose");
const { moveEthToUser, moveErc20TokenToUser } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { Withdrawal } = require("../../models/withdrawalModel");
const MerchantWithDrawLimit = require("../../models/merchantWithDrawLimit");
const { getOrCreateWallet, lockBalance, deductLockedBalance, unlockBalance } = require("../../services/wallet/walletService");
const { createLedgerEntry } = require("../../services/wallet/ledgerService");
const { buildCompletionFields } = require("../../services/withdrawal/completionFields");
const { createNotification } = require("../../services/notification/notificationService");
const { getExchangeRate } = require("../../services/price/priceService");

// Statuses that represent funds committed/consumed for the day.
// REJECTED / FAILED withdrawals release funds and do not consume the limit.
const DAILY_LIMIT_CONSUMING_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"];

// Result status used to signal a withdrawal is waiting for merchant approval.
const STATUS_REQUIRES_MERCHANT_APPROVAL = 2;

const getTodayWindow = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getTodayWithdrawalTotal = async (merchantId, userId, session) => {
  const { start, end } = getTodayWindow();

  const [result] = await Withdrawal.aggregate([
    {
      $match: {
        merchantId,
        userId,
        createdAt: { $gte: start, $lt: end },
        status: { $in: DAILY_LIMIT_CONSUMING_STATUSES },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]).session(session);

  return result?.total ?? 0;
};

const createTransfer = async (req, reply) => {
  try {
  const merchantId = req.user.merchantId;
  const apiKeyId = req.user?.apiKeyId || null;
  const { amount, currency, network, merchant: toMerchant, toaddress, auto_confirm, ipn_url } = req.validatedData || req.body || {};
  console.log("🚀 ~ createTransfer ~ network:", network)
  console.log("🚀 ~ createTransfer ~ currency:", currency)

  if (!amount || !currency || !network) {
    return reply.code(400).send({ success: false, message: "Missing required fields: amount, currency, network" });
  }

  if (!toaddress && !toMerchant) {
    return reply.code(400).send({ success: false, message: "Either merchant or toaddress must be specified" });
  }

  // Make sure we handle both cases properly
  let receiverAddress = null;
  if (toaddress) {
    receiverAddress = toaddress;
  } else if (toMerchant) {
    receiverAddress = toMerchant;
  }

  const networkDoc = await Network.findOne({ networkSymbol: network.toUpperCase() }).lean();
  console.log("🚀 ~ createTransfer ~ networkDoc:", networkDoc)
  if (!networkDoc) {
    return reply.code(404).send({ success: false, message: "Network not found" });
  }

  const asset = await Asset.findOne({ assetSymbol: currency.toUpperCase(), "networks.networkId": networkDoc._id }).lean();
  console.log("🚀 ~ createTransfer ~ asset:", asset)
  if (!asset) {
    return reply.code(404).send({ success: false, message: "Asset not found for this network" });
  }

  if (!asset.withdrawStatus) {
    return reply.code(400).send({ success: false, message: "Transfers are disabled for this asset" });
  }

  // Resolve the network-specific config (contract address for ERC20-style
  // tokens). Falls back to the first entry like requestWithdraw does.
  const assetNetwork =
    asset.networks?.find(
      (item) => String(item?.networkId) === String(networkDoc._id)
    ) || asset.networks?.[0] || null;
  const contractAddress = assetNetwork?.contractAddress || null;

  // ==========================================
  // MERCHANT WITHDRAWAL SETTINGS (same limit source as requestWithdraw logic)
  // ==========================================
  const withdrawLimitSettings = await MerchantWithDrawLimit.findOne({ merchantId }).lean();

  if (!withdrawLimitSettings) {
    return reply.code(400).send({ success: false, message: "Merchant withdrawal limit is not configured." });
  }

  if (
    withdrawLimitSettings.merchantUsersDailyLimit < 0 ||
    withdrawLimitSettings.withdrawalLimit < 0
  ) {
    return reply.code(400).send({ success: false, message: "Withdrawal limits are not configured correctly." });
  }
  const autoLimit = Number(withdrawLimitSettings.withdrawalLimit ?? 0);

  const wallet = await getOrCreateWallet(merchantId, asset._id);
  console.log("🚀 ~ createTransfer ~ wallet:", wallet)
  if (!wallet) {
    return reply.code(500).send({ success: false, message: "Failed to get or create wallet" });
  }

  const withdrawFeePercent = Number(assetNetwork?.withdrawFee ?? 0);
  const minWithdraw = Number(assetNetwork?.minWithdrawAmount ?? 0);
  const networkDecimals = Number.isInteger(assetNetwork?.decimal) ? assetNetwork.decimal : 18;
  const decimals = Math.min(Math.max(networkDecimals, 0), 18);

  // Exact decimal math (same as requestWithdraw) to avoid float dust
  // like 20.003999999999998 in the sweep amount.
  const parseAmountToScaled = (valueStr, d) => {
    const s = String(valueStr).trim();
    if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid amount ${s}`);
    const [intPart, fracPart = ""] = s.split(".");
    const fracPadded = (fracPart + "0".repeat(d)).slice(0, d);
    const extra = fracPart.slice(d);
    let scaled = BigInt((intPart || "0") + fracPadded);
    if (extra && Number(extra[0]) >= 5) scaled += 1n;
    return scaled;
  };
  const scaledToString = (scaled, d) => {
    const negative = scaled < 0n;
    const abs = negative ? -scaled : scaled;
    const str = abs.toString().padStart(d + 1, "0");
    const pos = str.length - d;
    const whole = str.slice(0, pos) || "0";
    const fraction = str.slice(pos).replace(/0+$/, "");
    return (negative ? "-" : "") + (fraction ? `${whole}.${fraction}` : whole);
  };
  const calcFeeScaled = (amountScaled, feePercent) => {
    if (!feePercent) return 0n;
    const feeStr = String(feePercent).trim();
    if (!/^\d+(\.\d+)?$/.test(feeStr)) return 0n;
    const [feeInt, feeFrac = ""] = feeStr.split(".");
    const feeScale = 10n ** BigInt(feeFrac.length);
    const feeIntBig = BigInt((feeInt || "0") + feeFrac);
    const denom = feeScale * 100n;
    return (amountScaled * feeIntBig + denom / 2n) / denom;
  };

  const amountScaled = parseAmountToScaled(amount, decimals);
  const feeScaled = calcFeeScaled(amountScaled, withdrawFeePercent);
  const netScaled = amountScaled - feeScaled;
  const totalScaled = amountScaled;

  const withdrawFee = Number(scaledToString(feeScaled, decimals));
  const netAmount = Number(scaledToString(netScaled, decimals));
  const totalAmount = Number(scaledToString(totalScaled, decimals));
  const sweepAmountStr = scaledToString(netScaled, decimals);
  console.log("🚀 ~ createTransfer ~ totalAmount:", totalAmount)
  console.log("🚀 ~ createTransfer ~ netAmount:", netAmount, "fee:", withdrawFee)

  if (netAmount < minWithdraw) {
    return reply.code(400).send({ success: false, message: `Minimum net withdrawal amount is ${minWithdraw}. With fee of ${withdrawFeePercent}%, you need to withdraw at least ${minWithdraw + withdrawFee}.` });
  }

  // 1. Merchant balance check FIRST (before any sweep).
  if (wallet.free < totalAmount) {
    return reply.code(400).send({
      success: false,
      message: `Insufficient balance. Available: ${wallet.free}, required: ${totalAmount}`,
    });
  }

  // Exchange rate for auto-decision (gracefully handle provider failure)
    let rate = null;
    try {
      rate = await getExchangeRate(currency.toUpperCase(), "USD");
    } catch (rateErr) {
      console.log("createTransfer exchange rate lookup failed:", rateErr.message);
      rate = null;
    }
    const netAmountInUsdt = rate ? netAmount * rate : null;
    console.log("🚀 ~ createTransfer ~ netAmountInUsdt:", netAmountInUsdt)

    let isAutoWithdraw = false;
    if (netAmountInUsdt !== null && Number.isFinite(netAmountInUsdt)) {
      isAutoWithdraw = netAmountInUsdt <= autoLimit;
      console.log("🚀 ~ createTransfer ~ isAutoWithdraw:", isAutoWithdraw, { netAmountInUsdt, autoLimit })
    } else {
      // No rate available (e.g. custom token) -> auto approve.
      isAutoWithdraw = false;
      console.log("🚀 ~ createTransfer ~ isAutoWithdraw (fallback null rate -> auto):", isAutoWithdraw, { amount: Number(amount), autoLimit })
    }
    const requiresMerchantApproval = !isAutoWithdraw;

  const shouldAutoSweep = isAutoWithdraw && !requiresMerchantApproval;
  if (shouldAutoSweep) {
    console.log("🚀 ~ createTransfer ~ auto sweep:", { netAmount: sweepAmountStr, hasContract: !!contractAddress })

    // 1. Create withdrawal in PROCESSING state + move amount to locked synchronously.
    // Locked funds are deducted ONLY when transfer completes, or moved back
    // to free if the sweep fails (same lock/unlock pattern as requestWithdraw).
    let withdrawalDoc;
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      const withdrawId =`wth_${require("crypto").randomBytes(16).toString("hex")}`;
      try {
        const walletForDoc = await getOrCreateWallet(merchantId, asset._id, { session });
        const [created] = await Withdrawal.create([{
          merchantId,
          userId: merchantId,
          apiKeyId,
          walletId: walletForDoc._id,
          networkId: networkDoc._id,
          withdrawId,
          assetId: asset._id,
          amount: Number(amount),
          fee: withdrawFee,
          withdrawFee: withdrawFeePercent,
          netAmount,
          totalAmount,
          toAddress: receiverAddress,
          receiverAddress,
          status: "PROCESSING",
          type: "payOut",
          withdrawFrom: "create_transfer",
          ipnUrl: ipn_url || null,
        }], { session });

        await lockBalance(merchantId, asset._id, totalAmount, {
          merchantId,
          withdrawalId: created._id,
          assetSymbol: currency.toUpperCase(),
          session,
        });

        await session.commitTransaction();
        withdrawalDoc = created;
      } catch (e) {
        await session.abortTransaction();
        throw e;
      } finally {
        session.endSession();
      }
    } catch (createErr) {
      console.error("createTransfer: failed to create PROCESSING withdrawal:", createErr);
      if (createErr.message?.startsWith("Insufficient balance")) {
        return reply.code(400).send({ success: false, message: createErr.message });
      }
      return reply.code(500).send({ success: false, message: "Failed to initiate withdrawal" });
    }

    // 2. Reply immediately — transfer initiated (do NOT wait for sweep).
    reply.code(200).send({
      success: true,
      message: "Withdrawal process initiated",
      result: {
        withdrawal_Id: withdrawalDoc.withdrawId,
        status: "PROCESSING",
        netAmount,
        netAmountInUsdt,
        rate: rate || null,
        isAutoWithdraw: true,
        txHash: null,
      },
    });

    // 3. Background task: sweep WITHOUT waiting, update wallet ONLY when done.
    // Fire-and-forget — do not block reply, do not send second reply.
    setImmediate(async () => {
      let sweepTxHash = null;
      try {
        let body;
        if (contractAddress) {
          body = await moveErc20TokenToUser(
            {
              toAddress: receiverAddress,
              amount: sweepAmountStr,
              contractAddress,
              decimals,
            }
          );
          console.log("withdrawTransferERC20:", body)
        } else {
          body = await moveEthToUser(
            {
              toAddress: receiverAddress,
              amount: sweepAmountStr,
            }
          );
          console.log("withdrawTransfer:", body)
        }

        const explicitFail = body && (body.status === false || body.success === false);
        if (explicitFail) {
          throw new Error(body?.message || body?.error || "Admin wallet sweep returned failure");
        }
        sweepTxHash = body?.txHash || body?.transactionHash || body?.hash || body?.data?.txHash || body?.data?.transactionHash || null;
        console.log("Sweep completed, updating wallet:", { withdrawId: withdrawalDoc._id, sweepTxHash });

        // Locked -> completed: status update + deduct locked in one transaction.
        // deductLockedBalance also writes the WITHDRAWAL_SUCCESS ledger entry.
        const MAX_SWEEP_RETRIES = 3;
        let completed = false;
        for (let attempt = 0; attempt < MAX_SWEEP_RETRIES && !completed; attempt++) {
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            try {
            await Withdrawal.findByIdAndUpdate(
              withdrawalDoc._id,
              {
                $set: await buildCompletionFields({
                  sweepBody: body,
                  sweepTxHash,
                  networkId: withdrawalDoc.networkId,
                }),
              },
              { session }
            );
            } catch (error) {
              console.error("createTransfer: failed to update withdrawal:", error);
              throw error;
            }
            try {
            await deductLockedBalance(merchantId, asset._id, totalAmount, {
              merchantId,
              withdrawalId: withdrawalDoc._id,
              assetSymbol: currency.toUpperCase(),
              session,
            });
            } catch (error) {
              console.error("createTransfer: failed to deduct locked balance:", error);
              throw error;
            }

            await session.commitTransaction();
            completed = true;

            try {
              await createNotification({
                user_id: merchantId,
                role: "user",
                title: "Transfer Completed",
                description: `Your transfer of ${amount} ${currency.toUpperCase()} has been completed successfully.${sweepTxHash ? ` Tx: ${sweepTxHash}` : ''}`,
                type: "withdraw",
                status: "success",
              });
            } catch (notifErr) {
              console.error("Transfer completed notification failed (non-blocking):", notifErr.message);
            }
          } catch (txErr) {
            await session.abortTransaction();
            const isTransient = txErr.code === 112 || txErr.errorLabels?.includes?.('TransientTransactionError') || txErr.errorLabels?.has?.('TransientTransactionError');
            if (isTransient && attempt < MAX_SWEEP_RETRIES - 1) {
              await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
              continue;
            }
            console.error("createTransfer wallet update after sweep failed:", txErr);
            try {
              await Withdrawal.findByIdAndUpdate(withdrawalDoc._id, { $set: { status: "FAILED", failureReason: txErr.message } });
            } catch (markErr) {
              console.error("createTransfer: failed to mark FAILED after wallet error:", markErr);
            }
            break;
          } finally {
            session.endSession();
          }
        }
      } catch (sweepError) {
        console.error("createTransfer admin wallet sweep failed (background):", {
          message: sweepError.message,
        });
        const upstreamMsg = sweepError.message;
        // Sweep never moved funds: mark FAILED and move locked amount back to free.
        let failSession;
        try {
          failSession = await mongoose.startSession();
          failSession.startTransaction();
        } catch (sessErr) {
          console.error("createTransfer background failSession start error:", sessErr);
          return;
        }
        try {
          try {
          await Withdrawal.findByIdAndUpdate(withdrawalDoc._id, { $set: { status: "FAILED", failureReason: upstreamMsg } }, { session: failSession });
          } catch (error) {
            console.error("createTransfer: failed to update withdrawal:", error);
          }
          try {
          await unlockBalance(merchantId, asset._id, totalAmount, {
            merchantId,
            withdrawalId: withdrawalDoc._id,
            assetSymbol: currency.toUpperCase(),
            session: failSession,
          });
        } catch (error) {
          console.error("createTransfer: failed to unlock balance:", error);
        }
          await failSession.commitTransaction();
        } catch (markErr) {
          await failSession.abortTransaction();
          console.error("createTransfer: failed to mark FAILED after sweep error:", markErr);
        } finally {
          failSession.endSession();
        }
        try {
          await createNotification({
            user_id: merchantId,
            role: "user",
            title: "Transfer Failed",
            description: `Transfer of ${amount} ${currency.toUpperCase()} failed: ${upstreamMsg}`,
            type: "withdraw",
            status: "failed",
          });
        } catch (notifErr) {
          console.error("createTransfer: failed to create notification:", notifErr);
        }
      }
    });

    return reply; // Already sent above: return reply so Fastify does not send again
  }

  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // const todayTotal = await getTodayWithdrawalTotal(merchantId, merchantId, session);

      // Daily limit check disabled (same as before).
      let  withdrawal;
      const withdrawId =`wth_${require("crypto").randomBytes(16).toString("hex")}`;

      try {
        [withdrawal] = await Withdrawal.create([{
          merchantId,
          userId: merchantId,
          apiKeyId,
          networkId: networkDoc._id,
          assetId: asset._id,
          amount: Number(amount),
          fee: withdrawFee,
          withdrawFee: withdrawFeePercent,
          withdrawId,
          netAmount,
          totalAmount,
          toAddress: receiverAddress,
          receiverAddress,
          status: "PENDING",
          type: "payOut",
          withdrawFrom: "create_transfer",
          approvalLevel: requiresMerchantApproval ? "MERCHANT" : undefined,
          ipnUrl: ipn_url || null,
        }], { session });
      } catch (error) {
        console.log("create Withdraw Failed", error);
        try { await session.abortTransaction(); } catch {}
        return reply.code(500).send({ success: false, message: "Create Withdraw Failed" });
      }
      await lockBalance(merchantId, asset._id, totalAmount, {
        merchantId,
        withdrawalId: withdrawal._id,
        assetSymbol: currency.toUpperCase(),
        session,
      });
    try {
      await createLedgerEntry({
        merchantId,
        withdrawalId: withdrawal._id,
        assetSymbol: currency.toUpperCase(),
        type: "WITHDRAWAL_REQUEST",
        amount: Number(amount),
        balanceBefore: wallet.free + totalAmount,
        balanceAfter: wallet.free,
        lockedBefore: wallet.locked - totalAmount,
        lockedAfter: wallet.locked,
        description: `Transfer of ${amount} ${currency.toUpperCase()} to ${receiverAddress}`,
        session,
      });
    } catch (error) {
      console.log("create Ledger Entry Failed", error);
      try { await session.abortTransaction(); } catch {}
      return reply.code(500).send({ success: false, message: "Create Ledger Entry Failed" });
    }
    try {
      await session.commitTransaction();
    } catch (error) {
      console.log("commit Transaction Failed", error);
      throw error;
    }
      if (requiresMerchantApproval) {
        return reply.code(200).send({
          success: true,
          message: "Withdrawal requires merchant approval.",
          result: {
            withdrawal_Id: withdrawal.withdrawId,
            status: STATUS_REQUIRES_MERCHANT_APPROVAL,
            netAmount,
            netAmountInUsdt,
            rate,
            isAutoWithdraw,
          },
        });
      }

      const noEmail = auto_confirm == 1;

      return reply.code(200).send({
        success: true,
        result: {
          withdrawal_Id: withdrawal._id.toString(),
          status: noEmail ? 1 : 0,
          netAmount,
          netAmountInUsdt,
          rate,
          isAutoWithdraw,
        },
      });
    } catch (error) {
      console.log("commit Transaction Failed", error)
      await session.abortTransaction();
      if (error.code === 112 || error.errorLabels?.has?.('TransientTransactionError')) {
        console.warn(`createTransfer write conflict (attempt ${attempt + 1}/${MAX_RETRIES}), retrying...`);
        continue;
      }
      console.error("createTransfer error:", error);
      if (error.message?.startsWith("Insufficient balance")) {
        return reply.code(400).send({ success: false, message: error.message });
      }
      return reply.code(500).send({ success: false, message: "Internal server error" });
    } finally {
      session.endSession();
    }
  }

  return reply.code(500).send({ success: false, message: "Transaction failed after retries" });
  } catch (outerErr) {
    console.error("createTransfer outer error:", outerErr);
    if (reply.raw?.headersSent || reply.sent) return;
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = { createTransfer };