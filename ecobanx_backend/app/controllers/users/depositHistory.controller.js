const { DepositHistory } = require("../../models/depositHistoryModel");
const { Transaction } = require("../../models/transactionModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const getDepositHistory = async (req, reply) => {

  try {
    const userId = req.user._id || req.user.id;
    console.log("🚀 ~ getDepositHistory ~ userId:", userId)

    const data = req.validatedData || req.query || {};
    const { search, network, from, to, type, status, buttonType } = data;
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 10;

    const filter = { userId };

    if (network) {
      filter.network = network.toUpperCase();
    }
    if (type) {
      filter.type = type;
    }
    if (status) {
      const s = String(status).trim().toLowerCase();
      if (s !== "all") {
        filter.status = s;
      }
    }
    if (buttonType) {
      const b = String(buttonType).trim().toLowerCase();
      if (b && b !== "all") {
        filter.buttonType = b;
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { txId: searchRegex },
        { from: searchRegex },
        { contractAddress: searchRegex },
        { symbol: searchRegex },
        { address: searchRegex },
      ];
      // Match API key name -> filter by its key ids.
      const matchedKeys = await MerchantApiKey.find({ keyName: searchRegex })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        filter.$or.push({ apiKeyId: { $in: matchedKeys.map((k) => k._id) } });
      }
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await DepositHistory.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-__v -merchantId -userId -walletId -id -walletId",
      populate: [{ path: "apiKeyId", select: "keyName" }],
      lean: true,
    });
    // console.log(result, "RESTUKT")
    const txIds = [...new Set(result.docs.map((d) => d.txId).filter(Boolean))];
    const scopeIds = [...new Set(result.docs.map((d) => String(d.merchantId || d.userId || "")).filter(Boolean))];
    const txByHash = new Map();
    const txByAddress = new Map();
    if (txIds.length > 0 && scopeIds.length > 0) {
      const txns = await Transaction.find({
        merchantId: { $in: scopeIds },
        $or: [{ txnHash: { $in: txIds } }, { address: { $in: result.docs.map((d) => d.address).filter(Boolean) } }],
      })
        .populate("apiKeyId", "keyName")
        .lean();
      for (const tx of txns) {
        if (tx.txnHash && !txByHash.has(tx.txnHash)) txByHash.set(tx.txnHash, tx);
        if (tx.address) txByAddress.set(`${String(tx.merchantId)}|${String(tx.address).toLowerCase()}`, tx);
      }
    }
    const deposits = result.docs.map((d) => {
      const transaction =
        (d.txId && txByHash.get(d.txId)) ||
        txByAddress.get(`${String(d.merchantId || d.userId || "")}|${String(d.address || "").toLowerCase()}`) ||
        null;
      if (transaction) {
        transaction.apiKeyName = transaction.apiKeyId?.keyName || null;
        delete transaction.apiKeyId;
      }
      const { apiKeyId, ...rest } = d;
      return {
        ...rest,
        apiKeyName: apiKeyId?.keyName || null,
        transaction,
      };
    });

    return reply.code(200).send({
      success: true,
      data: {
        deposits,
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
    console.error("getDepositHistory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const getDepositHistoryById = async (req, reply) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const deposit = await DepositHistory.findOne({ _id: id, userId })
      .populate("apiKeyId", "keyName")
      .lean();
    if (!deposit) {
      return reply.code(404).send({
        success: false,
        message: "Deposit not found",
      });
    }

    const merchantScope = deposit.merchantId || deposit.userId || userId;
    let transaction = null;
    if (deposit.txId) {
      transaction = await Transaction.findOne({
        txnHash: deposit.txId,
        merchantId: merchantScope,
      }).select(" -_id -merchantId -destTag -confirmsNeeded -timeout -exchangeRate -marketRate -quoteCreatedAt -quoteExpiresAt -expiresAt -statusUrl").populate("apiKeyId", "keyName").lean();
    }
    if (!transaction && deposit.address) {
      transaction = await Transaction.findOne({
        merchantId: merchantScope,
        address: deposit.address,
      })
        .sort({ createdAt: -1 })
        .populate("apiKeyId", "keyName")
        .lean();
    }
    if (transaction) {
      transaction.apiKeyName = transaction.apiKeyId?.keyName || null;
      delete transaction.apiKeyId;
    }

    // Keep the existing response shape (no mongo internals) + transaction.
    const { _id, merchantId, userId: depositUserId, walletId, apiKeyId, __v, ...data } = deposit;

    return reply.code(200).send({
      success: true,
      data: {
        ...data,
        apiKeyName: apiKeyId?.keyName || null,
        transaction,
      },
    });
  } catch (error) {
    console.error("getDepositHistoryById error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDepositHistory,
  getDepositHistoryById,
};
