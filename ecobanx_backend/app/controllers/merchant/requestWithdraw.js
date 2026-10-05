const mongoose = require("mongoose");
const { Asset } = require("../../models/Asset");
const { Network } = require("../../models/Network");
const { WalletAddress } = require("../../models/walletAddressModel");
const { Withdrawal } = require("../../models/withdrawalModel");
const { Wallets } = require("../../models/walletModel");
const { Users } = require("../../models/usersModel");
const { KYB } = require("../../models/kybModel");
const { moveEthToUser, moveErc20TokenToUser } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { KYC } = require("../../models/kycModel");

const { getOrCreateWallet, lockBalance, deductLockedBalance, unlockBalance } = require("../../services/wallet/walletService");
const { createLedgerEntry } = 
require("../../services/wallet/ledgerService");
const { buildCompletionFields } =
require("../../services/withdrawal/completionFields");
const { createNotification } = require("../../services/notification/notificationService");
const withdrawLimitSchema = require("../../models/withdrawLimit");
const { getExchangeRate } = require("../../services/price/priceService");
const twoFactorService = require("../../services/twofactor/twoFactorService");

const requestWithdraw = async (req, reply) => {
  // 1. Check body — req.validatedData is set by zodValidate middleware
  const validatedData = req.validatedData || req.body;
  if (!validatedData || !validatedData.assetSymbol || !validatedData.networkSymbol || validatedData.amount == null || !validatedData.receiverAddress || !validatedData.withdraw2faCode) {
    return reply.code(400).send({ success: false, message: "Missing required fields: assetSymbol, networkSymbol, amount, receiverAddress, withdraw2faCode" });
  }

  const {
    assetSymbol,
    networkSymbol,
    amount,
    receiverAddress,
    withdraw2faCode,
  } = validatedData;
  const merchantId = req.user._id || req.user.id;

  console.log(receiverAddress, 'receiverAddress');

  try {
    const selfDepositAddressExists = await WalletAddress.exists({
      userId: merchantId,
      address: receiverAddress,
    });

    if (selfDepositAddressExists) {
      return reply.code(400).send({ success: false, message: "Cannot withdraw to your own deposit address." });
    }

    const network = await Network.findOne({ networkSymbol }).lean();
    if (!network) {
      return reply.code(404).send({ success: false, message: "Network not found" });
    }

    const asset = await Asset.findOne({ assetSymbol, "networks.networkId": network._id }).lean();

    if (!asset) {
      return reply.code(404).send({ success: false, message: "Asset not found for this network" });
    }

    // Resolve network-specific config correctly (match by networkId, not first entry)
    const assetNetwork =
      asset?.networks?.find((item) => String(item?.networkId) === String(network._id)) ||
      asset?.networks?.[0] ||
      null;
    const contractAddress = assetNetwork?.contractAddress || null;

    console.log("contractAddress", contractAddress)

    if (!asset.withdrawStatus) {
      return reply.code(400).send({ success: false, message: "Withdrawals are disabled for this asset" });
    }

    const walletAddress = await WalletAddress.findOne({
      userId: merchantId,
    }).lean();

    if (!walletAddress) {
      return reply.code(404).send({
        success: false,
        message: "No wallet address found for this asset and network. Create one first.",
      });
    }

    const withdrawLimit = await withdrawLimitSchema
      .findOne()
      .select("-_id -__v")
      .lean();

    if (!withdrawLimit) {
      return reply.code(400).send({ success: false, message: "Withdrawal limit not configured." });
    }

    // ============================================================
    // GET USER / MERCHANT
    // ============================================================

    const merchant = await Users.findById(merchantId).lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "User not found.",
      });
    }

    if (!merchant.accountverifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "User account is not verified.",
      });
    }

    // ============================================================
    // KYC / KYB VERIFICATION
    // ============================================================

    if (merchant.accountType === "individual") {
      const kyc = await KYC.findOne({
        userId: merchantId,
      }).lean();

      if (!kyc) {
        return reply.code(400).send({
          success: false,
          message:
            "Please complete your KYC verification before requesting a withdrawal.",
        });
      }

      if (kyc.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is pending admin approval. Please wait until your KYC is approved before requesting a withdrawal.",
        });
      }

      if (kyc.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification was rejected. Please resubmit your KYC for approval before requesting a withdrawal.",
        });
      }

      if (kyc.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else if (merchant.accountType === "business") {
      const kyb = await KYB.findOne({
        userId: merchantId,
      }).lean();

      if (!kyb) {
        return reply.code(400).send({
          success: false,
          message:
            "Please complete your KYB verification before requesting a withdrawal.",
        });
      }

      if (kyb.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is pending admin approval. Please wait until your KYB is approved before requesting a withdrawal.",
        });
      }

      if (kyb.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification was rejected. Please resubmit your KYB for approval before requesting a withdrawal.",
        });
      }

      if (kyb.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        message: "Invalid account type.",
      });
    }

    // ============================================================
    // 2FA CHECK
    // ============================================================

    if (!merchant.twoFactorEnabled) {
      return reply.code(400).send({
        success: false,
        message: "Two-factor authentication must be enabled.",
      });
    }

    if (!merchant.twoFactorSecret) {
      return reply.code(400).send({
        success: false,
        message: "Two-factor authentication is not configured.",
      });
    }

    const isValid2FA = twoFactorService.verifyToken(
      merchant.twoFactorSecret,
      withdraw2faCode
    );

    if (!isValid2FA) {
      return reply.code(400).send({
        success: false,
        message: "Invalid 2FA code.",
      });
    }

    // ============================================================
    // FEE / LIMIT / AUTO-WITHDRAW CHECK (body + isAutoPay)
    // ============================================================
    const autoLimit = Number(withdrawLimit.withdrawalFee ?? 0);
    // Use network-specific fee, not networks[0] blindly — resolved via assetNetwork
    const networkWithdrawFeePercent = Number(assetNetwork?.withdrawFee ?? 0);
    const minWithdraw = Number(assetNetwork?.minWithdrawAmount ?? 0);
    const networkDecimals = Number.isInteger(assetNetwork?.decimal) ? assetNetwork.decimal : 18;
    const decimals = Math.min(Math.max(networkDecimals, 0), 18);

    // --- Exact decimal math to avoid JS binary float errors (e.g., 0.00009900000000000001, 1.959999999999999964) ---
    // All amounts are handled as strings scaled to `decimals` via BigInt, so sweep amount never has spurious floating digits
    const parseAmountToScaled = (valueStr, d) => {
      const s = String(valueStr).trim();
      if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid amount ${s}`);
      const [intPart, fracPart = ""] = s.split(".");
      const fracPadded = (fracPart + "0".repeat(d)).slice(0, d);
      const extra = fracPart.slice(d);
      let scaled = BigInt((intPart || "0") + fracPadded);
      // round if amount had more decimals than `d`
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
    const calcFeeScaled = (amountScaled, feePercent, d) => {
      if (!feePercent) return 0n;
      const feeStr = String(feePercent).trim();
      if (!/^\d+(\.\d+)?$/.test(feeStr)) return 0n;
      const [feeInt, feeFrac = ""] = feeStr.split(".");
      const feeDecimals = feeFrac.length;
      const feeScale = 10n ** BigInt(feeDecimals);
      const feeIntBig = BigInt((feeInt || "0") + feeFrac);
      // fee = amountScaled * feePercent / 100  ->  amountScaled * feeIntBig / (feeScale*100)
      const denom = feeScale * 100n;
      // rounded: (a*b + denom/2)/denom
      return (amountScaled * feeIntBig + denom / 2n) / denom;
    };

    const amountStr = String(amount).trim();
    const amountScaled = parseAmountToScaled(amountStr, decimals);
    const feeScaled = calcFeeScaled(amountScaled, networkWithdrawFeePercent, decimals);
    const netScaled = amountScaled - feeScaled;
    // const totalScaled = amountScaled + feeScaled;
    const totalScaled = amountScaled;

    const feeAmountStr = scaledToString(feeScaled, decimals);
    const netAmountStr = scaledToString(netScaled, decimals);
    const totalAmountStr = scaledToString(totalScaled, decimals);
    const sweepAmountStr = netAmountStr; // human-readable, correctly rounded to `decimals` and trimmed

    const feeAmount = Number(feeAmountStr);
    const netAmount = Number(netAmountStr);
    const totalAmount = Number(totalAmountStr);

    // Keep raw vars for logging parity (now exact)
    const feeAmountRaw = feeAmount;
    const totalAmountRaw = totalAmount;
    const netAmountRaw = netAmount;

    console.log("🚀 ~ requestWithdraw ~ netAmount:", netAmount, "sweepAmountStr:", sweepAmountStr, "decimals:", decimals)
    console.log("🚀 ~ requestWithdraw ~ feeAmount:", feeAmount)
    console.log("🚀 ~ requestWithdraw ~ totalAmount:", totalAmount)

    if (netAmount < minWithdraw) {
      return reply.code(400).send({ success: false, message: `Minimum net withdrawal amount is ${minWithdraw}. With fee of ${networkWithdrawFeePercent}%, you need to withdraw at least ${minWithdraw + feeAmount}.` });
    }

    // Exchange rate for auto-decision (gracefully handle provider failure)
    let rate = null;
    try {
      rate = await getExchangeRate(assetSymbol, "USD");
    } catch (rateErr) {
      console.log("requestWithdraw exchange rate lookup failed:", rateErr.message);
      rate = null;
    }
    const netAmountInUsdt = rate ? netAmount * rate : null;
    console.log("🚀 ~ requestWithdraw ~ netAmountInUsdt:", netAmountInUsdt)

    let isAutoWithdraw = false;
    if (netAmountInUsdt !== null && Number.isFinite(netAmountInUsdt)) {
      isAutoWithdraw = netAmountInUsdt <= autoLimit;
      console.log("🚀 ~ requestWithdraw ~ isAutoWithdraw:", isAutoWithdraw)
    } else {
      isAutoWithdraw = Number(amount) <= autoLimit;
      console.log("🚀 ~ requestWithdraw ~ isAutoWithdraw (fallback):", isAutoWithdraw)
    }

    // Pre-check wallet balance before calling external sweep — avoids sweep when funds insufficient
    const walletForCheck = await getOrCreateWallet(merchantId, asset._id);
    if (walletForCheck.free < totalAmount) {
      return reply.code(400).send({
        success: false,
        message: `Insufficient balance. Available: ${walletForCheck.free}, required: ${totalAmount}`,
      });
    }

    // ============================================================
    // BRANCH: Auto withdraw (Auto Pay) → sweep then wallet update
    // ============================================================
    if (isAutoWithdraw) {
      console.log("loggged", { isAutoWithdraw, netAmount, contractAddress: !!contractAddress });

      // 1. Create withdrawal in PROCESSING state + move amount to locked synchronously.
      // Locked funds are deducted ONLY when the sweep completes, or moved back
      // to free if the sweep fails (same lock/unlock pattern as createTransfer).
      let withdrawalDoc;
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const wallet = await getOrCreateWallet(merchantId, asset._id, { session });
          const [created] = await Withdrawal.create([{
            merchantId,
            userId: merchantId,
            walletAddressId: walletAddress._id,
            walletId: wallet._id,
            networkId: network._id || "",
            assetId: asset._id,
            amount,
            fee: feeAmount,
            withdrawFee: networkWithdrawFeePercent,
            netAmount,
            totalAmount,
            toAddress: receiverAddress,
            fromAddress: walletAddress.address,
            receiverAddress,
            status: "PROCESSING",
            withdrawFrom: "request_withdraw",
          }], { session });

          await lockBalance(merchantId, asset._id, totalAmount, {
            merchantId,
            withdrawalId: created._id,
            assetSymbol,
            session,
          });

          await session.commitTransaction();
          withdrawalDoc = created;
        } catch (e) {
          await session.abortTransaction();
          // throw e;
        } finally {
          session.endSession();
        }
      } catch (createErr) {
        console.error("Failed to create PROCESSING withdrawal:", createErr);
        if (createErr.message?.startsWith("Insufficient balance")) {
          return reply.code(400).send({ success: false, message: createErr.message });
        }
        return reply.code(500).send({ success: false, message: "Failed to initiate withdrawal" });
      }

      // 2. Reply immediately — transfer initiated (do NOT wait for sweep)
      reply.code(200).send({
        success: true,
        message: "Withdrawal process initiated",
        data: {
          withdrawId: withdrawalDoc._id,
          status: "PROCESSING",
          amount,
          fee: feeAmount,
          totalAmount,
          netAmount,
          assetSymbol,
          networkSymbol,
          receiverAddress,
          rate: rate || null,
          netAmountInUsdt: netAmountInUsdt,
          isAutoWithdraw: true,
        },
      });

      // 3. Background task: call admin sweep WITHOUT timeout, on completed update wallet + notification + history
      // Fire-and-forget — do not block reply, do not send second reply
      setImmediate(async () => {
        let sweepTxHash = null;
        let sweepResponseData = null;
        try {
          let body;
          if (!contractAddress) {
            body = await moveEthToUser({
              toAddress: receiverAddress,
              amount: sweepAmountStr
            });
            console.log("withdrawTransferERC20:", body);
          } else {
            body = await moveErc20TokenToUser({
              toAddress: receiverAddress,
              amount: sweepAmountStr,
              contractAddress,
              decimals: decimals
            });
            console.log("withdrawTransfer:", body);
          }

          const explicitFail = body && (body.status === false || body.success === false);
          if (explicitFail) {
            throw new Error(body?.message || body?.error || "Admin wallet sweep returned failure");
          }

          sweepResponseData = body;
          sweepTxHash = body?.txHash || body?.transactionHash || body?.hash || body?.data?.txHash || body?.data?.transactionHash || null;
          console.log("Sweep completed, updating wallet:", { withdrawId: withdrawalDoc._id, sweepTxHash });

          // Wallet + ledger + status update — ONLY when transfer completed
          const MAX_RETRIES = 3;
          let completed = false;
          for (let attempt = 0; attempt < MAX_RETRIES && !completed; attempt++) {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
              const wallet = await getOrCreateWallet(merchantId, asset._id, { session });

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

              // Locked -> completed (writes the WITHDRAWAL_SUCCESS ledger entry).
              await deductLockedBalance(merchantId, asset._id, totalAmount, {
                merchantId,
                withdrawalId: withdrawalDoc._id,
                assetSymbol,
                session,
              });

              if (feeAmount > 0) {
                await createLedgerEntry({
                  merchantId,
                  withdrawalId: withdrawalDoc._id,
                  assetSymbol,
                  type: "WITHDRAWAL_FEE",
                  amount: feeAmount,
                  balanceBefore: wallet.free,
                  balanceAfter: wallet.free,
                  lockedBefore: wallet.locked - totalAmount,
                  lockedAfter: wallet.locked - totalAmount,
                  description: `Withdrawal fee deducted for auto-withdrawal`,
                  session,
                });
              }

              await session.commitTransaction();
              completed = true;

              try {
                await createNotification({
                  user_id: merchantId,
                  role: "user",
                  title: "Withdrawal Completed",
                  description: `Your withdrawal of ${amount} ${assetSymbol} has been completed successfully.${sweepTxHash ? ` Tx: ${sweepTxHash}` : ''}`,
                  type: "withdraw",
                  status: "success",
                });
              } catch (notifErr) {
                console.error("Withdrawal completed notification failed (non-blocking):", notifErr.message);
              }

            } catch (txErr) {
              await session.abortTransaction();
              const isTransient = txErr.code === 112 || txErr.errorLabels?.includes('TransientTransactionError') || txErr.errorLabels?.has?.('TransientTransactionError');
              if (isTransient && attempt < MAX_RETRIES - 1) {
                await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
                continue;
              }
              console.error("Wallet update after sweep failed:", txErr);
              // Mark withdrawal as FAILED if wallet update fails permanently
              try {
                await Withdrawal.findByIdAndUpdate(withdrawalDoc._id, { $set: { status: "FAILED", failureReason: txErr.message } });
                try {
                  await createNotification({
                    user_id: merchantId,
                    role: "user",
                    title: "Withdrawal Failed",
                    description: `Withdrawal of ${amount} ${assetSymbol} failed after transfer: ${txErr.message}`,
                    type: "withdraw",
                    status: "failed",
                  });
                } catch (notifErr) {
                  console.error("Withdrawal failed notification failed (non-blocking):", notifErr.message);
                }
              } catch (markErr) {
                console.error("Failed to mark withdrawal FAILED:", markErr);
              }
              break;
            } finally {
              session.endSession();
            }
          }
        } catch (sweepError) {
          console.error("Admin wallet sweep failed (background):", {
            message: sweepError.message,
          });
          const upstreamMsg = sweepError.message;
          // Sweep never moved funds: mark FAILED and move locked amount back to free.
          let failSession;
          try {
            failSession = await mongoose.startSession();
            failSession.startTransaction();
          } catch (sessErr) {
            console.error("requestWithdraw background failSession start error:", sessErr);
            return;
          }
          try {
            try {
              await Withdrawal.findByIdAndUpdate(withdrawalDoc._id, { $set: { status: "FAILED", failureReason: upstreamMsg } }, { session: failSession });
            } catch (error) {
              console.error("requestWithdraw: failed to update withdrawal:", error);
            }
            try {
              await unlockBalance(merchantId, asset._id, totalAmount, {
                merchantId,
                withdrawalId: withdrawalDoc._id,
                assetSymbol,
                session: failSession,
              });
            } catch (error) {
              console.error("requestWithdraw: failed to unlock balance:", error);
            }
            await failSession.commitTransaction();
          } catch (markErr) {
            await failSession.abortTransaction();
            console.error("Failed to mark withdrawal FAILED after sweep error:", markErr);
          } finally {
            failSession.endSession();
          }
          try {
            await createNotification({
                user_id: merchantId,
                role: "user",
                title: "Withdrawal Failed",
                description: `Withdrawal of ${amount} ${assetSymbol} failed: ${upstreamMsg}`,
                type: "withdraw",
                status: "failed",
              });
            } catch (notifErr) {
              console.error("Withdrawal failed notification failed (non-blocking):", notifErr.message);
            }
        }
      });

      return reply; // Already sent above: return reply so Fastify does not send again
    }

    // ============================================================
    // BRANCH: Manual (non-auto) — no sweep, lock balance, PENDING
    // ============================================================
    console.log("Skipping admin sweep — isAutoWithdraw=false, creating PENDING withdrawal for manual approval");

    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const session = await mongoose.startSession();
      session.startTransaction();
      const wallet = await getOrCreateWallet(merchantId, asset._id, { session });
      try {
        const [withdrawal] = await Withdrawal.create([{
          merchantId,
          userId: merchantId,
          walletAddressId: walletAddress._id,
          walletId: wallet._id,
          networkId: network._id || "",
          assetId: asset._id,
          amount,
          fee: feeAmount,
          withdrawFee: networkWithdrawFeePercent,
          netAmount,
          totalAmount,
          toAddress: receiverAddress,
          fromAddress: walletAddress.address,
          receiverAddress,
          status: "PENDING",
          withdrawFrom: "request_withdraw",
        }], { session });

        await lockBalance(merchantId, asset._id, totalAmount, {
          merchantId,
          withdrawalId: withdrawal._id,
          assetSymbol,
          session,
        });

        await createLedgerEntry({
          merchantId,
          withdrawalId: withdrawal._id,
          assetSymbol,
          type: "WITHDRAWAL_REQUEST",
          amount,
          balanceBefore: wallet.free,
          balanceAfter: wallet.free,
          lockedBefore: wallet.locked,
          lockedAfter: wallet.locked + totalAmount,
          description: `Withdrawal request for ${amount} ${assetSymbol} (pending approval)`,
          session,
        });

        await session.commitTransaction();

        try {
          await createNotification({
            user_id: merchantId,
            role: "user",
            title: "Withdrawal Submitted",
            description: `Withdrawal of ${amount} ${assetSymbol} has been submitted and is pending approval.`,
            type: "withdraw",
            status: "info",
          });
        } catch (notifErr) {
          console.error("Withdrawal notification failed (non-blocking):", notifErr.message);
        }

        return reply.code(200).send({
          success: true,
          message: "Withdrawal request submitted successfully.",
          data: {
            withdrawId: withdrawal._id,
            status: "PENDING",
            amount,
            fee: feeAmount,
            totalAmount,
            netAmount,
            assetSymbol,
            networkSymbol,
            receiverAddress,
            rate: rate || null,
            netAmountInUsdt: netAmountInUsdt,
            isAutoWithdraw: false,
          },
        });
      } catch (error) {
        await session.abortTransaction();
        const isTransient = error.code === 112 || error.errorLabels?.includes('TransientTransactionError') || error.errorLabels?.has?.('TransientTransactionError');
        if (isTransient && attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
          continue;
        }
        console.error("Withdrawal request error:", error);
        if (error.message && error.message.startsWith("Insufficient balance")) {
          return reply.code(400).send({ success: false, message: error.message });
        }
        return reply.code(500).send({ success: false, message: "Internal server error" });
      } finally {
        session.endSession();
      }
    }

    return reply.code(500).send({ success: false, message: "Transaction failed after retries" });

  } catch (error) {
    console.error("requestWithdraw unhandled error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};



module.exports = requestWithdraw;
