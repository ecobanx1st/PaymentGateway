const mongoose = require("mongoose");
const { moveEthToUser, moveErc20TokenToUser } = require("../../services/evmBalanceUpdate/evmBalanceUpdate");
const { Withdrawal } = require("../../models/withdrawalModel");
const { Asset } = require("../../models/Asset");
const { Users } = require("../../models/usersModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");
const { deductLockedBalance, unlockBalance } = require("../../services/wallet/walletService");
const { buildCompletionFields } = require("../../services/withdrawal/completionFields");
const { createNotification } = require("../../services/notification/notificationService");

const getAllWithdrawals = async (req, reply) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const {
      search,
      status,
      type,
      merchantId,
      assetId,
      networkId,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    // -----------------------------
    // Type filter: Withdraw (request_withdraw) / Payout (create_transfer)
    // -----------------------------
    if (type) {
      const t = String(type).trim().toLowerCase();
      if (t !== "all") {
        if (t === "payout") {
          filter.type = "payOut";
        } else if (t === "withdraw") {
          filter.type = "withdraw";
        }
      }
    }

    // -----------------------------
    // Status filter
    // -----------------------------
    if (status) {
      filter.status = status.toUpperCase();
    }

    // -----------------------------
    // Merchant filter
    // -----------------------------
    if (merchantId) {
      filter.merchantId = merchantId;
    }

    // -----------------------------
    // Asset filter
    // -----------------------------
    if (assetId) {
      filter.assetId = assetId;
    }

    // -----------------------------
    // Network filter
    // -----------------------------
    if (networkId) {
      filter.networkId = networkId;
    }

    // -----------------------------
    // Search
    // Asset
    // Network
    // Receiver Address
    // From Address
    // Amount
    // -----------------------------
    if (search?.trim()) {
      const searchValue = search.trim();

      const safeSearch = searchValue.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(safeSearch, "i");

      // Find matching assets
      const matchingAssets = await Asset.find({
        $or: [
          { assetName: searchRegex },
          { assetSymbol: searchRegex },
        ],
      }).select("_id");

      const assetIds = matchingAssets.map((asset) => asset._id);

      // Find matching networks
      const matchingNetworks = await mongoose.model("Network").find({
        $or: [
          { networkName: searchRegex },
          { networkSymbol: searchRegex },
        ],
      }).select("_id");

      const networkIds = matchingNetworks.map(
        (network) => network._id
      );

      // Search conditions
      const searchConditions = [
        // Receiver address
        {
          receiverAddress: searchRegex,
        },

        // From address
        {
          fromAddress: searchRegex,
        },
      ];

      // Merchant name / email
      const matchingMerchants = await Users.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { companyName: searchRegex },
        ],
      }).select("_id");

      if (matchingMerchants.length > 0) {
        searchConditions.push({
          merchantId: {
            $in: matchingMerchants.map((merchant) => merchant._id),
          },
        });
      }

      // Asset
      if (assetIds.length > 0) {
        searchConditions.push({
          assetId: { $in: assetIds },
        });
      }

      // Network
      if (networkIds.length > 0) {
        searchConditions.push({
          networkId: { $in: networkIds },
        });
      }

      // Amount
      if (!isNaN(Number(searchValue))) {
        searchConditions.push({
          amount: Number(searchValue),
        });
      }

      // API key name
      const matchingKeys = await MerchantApiKey.find({
        keyName: searchRegex,
      }).select("_id");

      if (matchingKeys.length > 0) {
        searchConditions.push({
          apiKeyId: { $in: matchingKeys.map((key) => key._id) },
        });
      }

      filter.$or = searchConditions;
    }

    // -----------------------------
    // Date filter
    // -----------------------------
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // -----------------------------
    // Pagination
    // -----------------------------
    const result = await Withdrawal.paginate(filter, {
      page,
      limit,
      sort: {
        createdAt: -1,
      },
      populate: [
        {
          path: "merchantId",
          select: "fullName email companyName accountType",
        },
        {
          path: "networkId",
          select: "networkName networkSymbol",
        },
        {
          path: "assetId",
          select: "assetName assetSymbol",
        },
        {
          path: "adminId",
          select: "fullName email",
        },
        {
          path: "apiKeyId",
          select: "keyName",
        },
      ],
      lean: true,
    });

    result.docs.forEach((w) => {
      w.apiKeyName = w.apiKeyId?.keyName || null;
      delete w.apiKeyId;
    });

    return reply.code(200).send({
      success: true,
      data: {
        withdrawals: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      },
    });

  } catch (error) {
    console.error("Get all withdrawals error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const getWithdrawalDetail = async (req, reply) => {
  console.log("sdghsdoihgsdoihg")
  try {
    const { withdrawId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawId)
      .populate("merchantId", "fullName email companyName accountType")
      .populate("userId", "fullName email companyName accountType")
      .populate("networkId", "networkName networkSymbol")
      .populate("assetId", "assetName assetSymbol")
      .populate("adminId", "fullName email")
      .populate("apiKeyId", "keyName")
      .lean();

    if (!withdrawal) {
      return reply.code(404).send({ success: false, message: "Withdrawal not found" });
    }

    withdrawal.apiKeyName = withdrawal.apiKeyId?.keyName || null;
    delete withdrawal.apiKeyId;

    return reply.code(200).send({
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    console.error("Get withdrawal detail error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const approveWithdrawal = async (req, reply) => {
  try {
  const { withdrawId } = req.params;
  const adminId = req.user._id || req.user.id;

  // --- Fetch and validate withdrawal first (no sweep yet) ---
  const withdrawal = await Withdrawal.findById(withdrawId);
  if (!withdrawal) {
    return reply.code(404).send({ success: false, message: "Withdrawal not found" });
  }

  if (withdrawal.status !== "PENDING") {
    return reply.code(400).send({ success: false, message: `Cannot approve withdrawal with status ${withdrawal.status}` });
  }

  const asset = await Asset.findById(withdrawal.assetId).lean();
  if (!asset) {
    return reply.code(404).send({ success: false, message: "Asset not found" });
  }

  // Resolve network-specific config (same as requestWithdraw)
  const assetNetwork =
    asset?.networks?.find((item) => String(item?.networkId) === String(withdrawal.networkId)) ||
    asset?.networks?.[0] ||
    null;
  const contractAddress = assetNetwork?.contractAddress || null;
  const networkDecimals = Number.isInteger(assetNetwork?.decimal) ? assetNetwork.decimal : 18;
  const decimals = Math.min(Math.max(networkDecimals, 0), 18);

  // --- Exact decimal math for sweep amount (avoid 0.00009900000000000001 / 1.959999999999999964) ---
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
    const feeDecimals = feeFrac.length;
    const feeScale = 10n ** BigInt(feeDecimals);
    const feeIntBig = BigInt((feeInt || "0") + feeFrac);
    const denom = feeScale * 100n;
    return (amountScaled * feeIntBig + denom / 2n) / denom;
  };

  // Recompute netAmount from stored amount + network fee to avoid trusting buggy stored netAmount
  const amountStr = String(withdrawal.amount).trim();
  let sweepAmountStr;
  try {
    const amountScaled = parseAmountToScaled(amountStr, decimals);
    const feePercent = Number(assetNetwork?.withdrawFee ?? 0);
    const feeScaled = calcFeeScaled(amountScaled, feePercent);
    const netScaled = amountScaled - feeScaled;
    sweepAmountStr = scaledToString(netScaled, decimals);
  } catch (e) {
    // Fallback to stored netAmount if recompute fails
    const rawNet = withdrawal.netAmount != null ? String(withdrawal.netAmount) : amountStr;
    sweepAmountStr = rawNet;
  }
  // Guard against undefined / NaN amount (cron shows undefined)
  if (!sweepAmountStr || sweepAmountStr === "undefined" || sweepAmountStr === "NaN" || sweepAmountStr === "" || Number(sweepAmountStr) !== Number(sweepAmountStr)) {
    console.error("Invalid sweepAmountStr in approveWithdrawal, fallback", { amountStr, sweepAmountStr, decimals, withdrawalId });
    sweepAmountStr = String(withdrawal.netAmount ?? withdrawal.amount).trim();
    if (sweepAmountStr === "undefined" || sweepAmountStr === "null" || sweepAmountStr === "") sweepAmountStr = String(withdrawal.amount).trim();
  }

  const receiverAddress = withdrawal.receiverAddress || withdrawal.toAddress;
  if (!receiverAddress) {
    return reply.code(400).send({ success: false, message: "Withdrawal receiver address missing" });
  }

  // --- Mark PROCESSING and instantly reply (sweep happens in background) ---
  console.log("loggged", { contractAddress: !!contractAddress, sweepAmountStr, decimals, withdrawId });

  // Update to PROCESSING synchronously before reply
  try {
    const initSession = await mongoose.startSession();
    initSession.startTransaction();
    try {
      const w = await Withdrawal.findById(withdrawId).session(initSession);
      if (!w || w.status !== "PENDING") {
        await initSession.abortTransaction();
        return reply.code(400).send({ success: false, message: `Cannot approve withdrawal with status ${w ? w.status : "NOT_FOUND"}` });
      }
      w.status = "PROCESSING";
      w.adminId = adminId;
      await w.save({ session: initSession });
      await initSession.commitTransaction();
    } catch (e) {
      await initSession.abortTransaction();
      throw e;
    } finally {
      initSession.endSession();
    }
  } catch (initErr) {
    console.error("Failed to mark PROCESSING:", initErr);
    return reply.code(500).send({ success: false, message: "Failed to initiate approval" });
  }

  // Instant reply — process initiated (do NOT wait for sweep)
  reply.code(200).send({
    success: true,
    message: "WITHDRAWL INITIAED SUCCESFULLY",
    data: {
      withdrawId: withdrawal._id,
      status: "PROCESSING",
    },
  });

  // Background: ADMIN TO USER sweep — only on success deduct locked balance & notify
  setImmediate(async () => {
    let sweepTxHash = null;
    let sweepBody = null;
    try {
      let body;
      if (!contractAddress) {
        console.log("withdrawTransferERC20 -> eth-move-to-user", { toAddress: receiverAddress, amount: sweepAmountStr });
        body = await moveEthToUser({
          toAddress: receiverAddress,
          amount: sweepAmountStr,
        });
        console.log("withdrawTransferERC20:", body);
      } else {
        console.log("withdrawTransfer -> erc20-token-move-to-user", { toAddress: receiverAddress, amount: sweepAmountStr, contractAddress, decimals });
        body = await moveErc20TokenToUser({
          toAddress: receiverAddress,
          amount: sweepAmountStr,
          contractAddress,
          decimals,
        });
        console.log("withdrawTransfer:", body);
      }

      sweepBody = body;
      const explicitFail = body && (body.status === false || body.success === false);
      if (explicitFail) {
        throw new Error(body?.message || body?.error || "Admin wallet sweep returned failure");
      }
      sweepTxHash = body?.txHash || body?.transactionHash || body?.hash || body?.data?.txHash || body?.data?.transactionHash || null;
      console.log("Approve sweep completed, updating wallet:", { withdrawId, sweepTxHash });
    } catch (sweepError) {
      console.error("Admin wallet sweep failed (approveWithdrawal background):", {
        message: sweepError.message,
      });
      const upstreamMsg = sweepError.message || "Admin wallet sweep failed";
      // Sweep never moved funds: mark FAILED and revert locked amount
      // back to the user's free balance.
      let failSession;
      try {
        failSession = await mongoose.startSession();
        failSession.startTransaction();
      } catch (sessErr) {
        console.error("approveWithdrawal background failSession start error:", sessErr);
        return;
      }
      try {
        try {
          await Withdrawal.findByIdAndUpdate(withdrawId, { $set: { status: "FAILED", failureReason: upstreamMsg } }, { session: failSession });
        } catch (error) {
          console.error("approveWithdrawal: failed to update withdrawal:", error);
        }
        try {
          await unlockBalance(withdrawal.merchantId, withdrawal.assetId, withdrawal.totalAmount, {
            merchantId: withdrawal.merchantId,
            withdrawalId: withdrawal._id,
            assetSymbol: asset?.assetSymbol,
            session: failSession,
          });
        } catch (error) {
          console.error("approveWithdrawal: failed to unlock balance:", error);
        }
        await failSession.commitTransaction();
      } catch (error) {
        await failSession.abortTransaction();
        console.error("Failed to mark FAILED after sweep error:", error);
      } finally {
        failSession.endSession();
      }
      try {
        try {
          await createNotification({
            user_id: withdrawal.userId || withdrawal.merchantId,
            role: "user",
            title: "Withdrawal Failed",
            description: `Your withdrawal of ${withdrawal.amount} ${asset?.assetSymbol || ""} failed: ${upstreamMsg}`,
            type: "withdraw",
            status: "failed",
            referenceId: withdrawal._id,
          });
        } catch (notifErr) {
          console.error("approveWithdrawal: failed to create notification:", notifErr);
        }
      } catch (error) {
        console.error("Failed to mark FAILED after sweep error:", error);
      }
      return;
    }

    // Sweep succeeded → deduct locked balance & mark COMPLETED in transaction
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sessErr) {
      console.error("approveWithdrawal background session start error:", sessErr);
      return;
    }
    try {
      const withdrawalInTx = await Withdrawal.findById(withdrawId).session(session);
      if (!withdrawalInTx) {
        await session.abortTransaction();
        console.error("Withdrawal not found after sweep:", withdrawId);
        return;
      }
      if (withdrawalInTx.status !== "PROCESSING") {
        await session.abortTransaction();
        console.log(`Withdrawal ${withdrawId} status is ${withdrawalInTx.status}, skipping COMPLETED update`);
        return;
      }

      withdrawalInTx.status = "COMPLETED";
      withdrawalInTx.approvedAt = new Date();
      if (sweepTxHash) {
        withdrawalInTx.txHash = sweepTxHash;
        withdrawalInTx.transactionHash = sweepTxHash;
      }
      Object.assign(
        withdrawalInTx,
        await buildCompletionFields({
          sweepBody,
          sweepTxHash,
          networkId: withdrawalInTx.networkId,
        })
      );
      try {
        await withdrawalInTx.save({ session });
      } catch (saveErr) {
        console.error("approveWithdrawal: failed to save withdrawal:", saveErr);
        throw saveErr;
      }
      try {
        await deductLockedBalance(withdrawalInTx.merchantId, withdrawalInTx.assetId, withdrawalInTx.totalAmount, {
          merchantId: withdrawalInTx.merchantId,
          withdrawalId: withdrawalInTx._id,
          assetSymbol: asset?.assetSymbol,
          session,
        });
      } catch (balanceErr) {
        console.error("approveWithdrawal: failed to deduct locked balance:", balanceErr);
        throw balanceErr;
      }
      try {
        await session.commitTransaction();
      } catch (commitErr) {
        console.error("approveWithdrawal: failed to commit transaction:", commitErr);
      }
      try {
        await createNotification({
          user_id: withdrawalInTx.userId || withdrawalInTx.merchantId,
          role: "user",
          title: "Withdrawal Approved",
          description: `Your withdrawal of ${withdrawalInTx.amount} ${asset?.assetSymbol || ""} has been approved and completed.${sweepTxHash ? ` Tx: ${sweepTxHash}` : ""}`,
          type: "withdraw",
          status: "success",
          referenceId: withdrawalInTx._id,
        });
      } catch (notifErr) {
        console.error("Withdrawal approved notification failed (non-blocking):", notifErr.message);
      }
    } catch (error) {
      await session.abortTransaction();
      console.error("Approve withdrawal error (after sweep background):", error);
      try {
        await Withdrawal.findByIdAndUpdate(withdrawId, { $set: { status: "FAILED", failureReason: error.message } });
      } catch (markErr) {
        console.error("Failed to mark FAILED after sweep error:", markErr);
      }
    } finally {
      session.endSession();
    }
  });

  return reply; // Already sent above: return reply so Fastify does not send again
  } catch (outerErr) {
    console.error("approveWithdrawal outer error:", outerErr);
    if (reply.raw?.headersSent || reply.sent) return;
    return reply.code(500).send({ success: false, message: "Approve withdrawal failed" });
  }
};



const rejectWithdrawal = async (req, reply) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawId } = req.params;
    const { reason } = req.body || {};
    const adminId = req.user._id || req.user.id;

    const withdrawal = await Withdrawal.findById(withdrawId).session(session);
    if (!withdrawal) {
      await session.abortTransaction();
      return reply.code(404).send({ success: false, message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "PENDING") {
      await session.abortTransaction();
      return reply.code(400).send({ success: false, message: `Cannot reject withdrawal with status ${withdrawal.status}` });
    }

    const asset = await Asset.findById(withdrawal.assetId).session(session).lean();

    withdrawal.status = "REJECTED";
    withdrawal.adminId = adminId;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = reason || null;
    await withdrawal.save({ session });

    await unlockBalance(withdrawal.merchantId, withdrawal.assetId, withdrawal.totalAmount, {
      merchantId: withdrawal.merchantId,
      withdrawalId: withdrawal._id,
      assetSymbol: asset?.assetSymbol,
      session,
    });

    await session.commitTransaction();

    await createNotification({
      user_id: withdrawal.userId || withdrawal.merchantId,
      role: "user",
      title: "Withdrawal Rejected",
      description: `Your withdrawal of ${withdrawal.amount} ${asset?.assetSymbol || ""} was rejected. Reason: ${reason || "No reason provided"}`,
      type: "withdraw",
      status: "failed",
      referenceId: withdrawal._id,
    });

    return reply.code(200).send({
      success: true,
      message: "Withdrawal rejected successfully.",
      data: {
        withdrawId: withdrawal._id,
        status: "REJECTED",
        rejectionReason: reason || null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Reject withdrawal error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllWithdrawals,
  getWithdrawalDetail,
  approveWithdrawal,
  rejectWithdrawal,
};
