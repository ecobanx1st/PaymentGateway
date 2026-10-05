const { Withdrawal } = require("../../models/withdrawalModel");
const { Network } = require("../../models/Network");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const getWithdrawals = async (req, reply) => {
  try {
    const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = { merchantId };

    // Tab-style statuses (Pending/Approved/Rejected/All) map to DB groups.
    // Exact DB statuses still work for backward compatibility.
    if (req.query.status) {
      const s = String(req.query.status).trim().toUpperCase();
      if (s === "ALL") {
        // no status filter
      } else if (s === "PENDING") {
        filter.status = "PENDING";
      } else if (s === "APPROVED" || s === "COMPLETED") {
        filter.status = { $in: ["APPROVED", "COMPLETED"] };
      } else if (["REJECTED", "FAILED", "CANCELLED"].includes(s)) {
        filter.status = { $in: ["REJECTED", "FAILED"] };
      } else {
        filter.status = s;
      }
    }

    if (req.query.type) {
      const type = String(req.query.type);
      if (["withdraw", "payOut"].includes(type)) {
        filter.type = type;
      }
    }

    if (req.query.withdrawFrom) {
      const withdrawFrom = String(req.query.withdrawFrom);
      if (["request_withdraw", "create_transfer"].includes(withdrawFrom)) {
        filter.withdrawFrom = withdrawFrom;
      }
    }

    // Free-text search: ids, hashes, addresses, API key name.
    if (req.query.search && String(req.query.search).trim()) {
      const rx = { $regex: String(req.query.search).trim(), $options: "i" };
      filter.$or = [
        { withdrawId: rx },
        { txHash: rx },
        { transactionHash: rx },
        { receiverAddress: rx },
        { toAddress: rx },
        { fromAddress: rx },
      ];
      // Match API key name -> filter by its key ids.
      const matchedKeys = await MerchantApiKey.find({ keyName: rx })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        filter.$or.push({ apiKeyId: { $in: matchedKeys.map((k) => k._id) } });
      }
    }

    // Network/method filter: UI sends network name ("Sepolia") or symbol.
    if (req.query.method && String(req.query.method).trim()) {
      const m = String(req.query.method).trim();
      const net = await Network.findOne({
        $or: [{ networkName: m }, { networkSymbol: m.toUpperCase() }],
      })
        .select("_id")
        .lean();
      if (net) {
        filter.networkId = net._id;
      } else {
        filter.networkId = null; // no network matches -> empty result
      }
    }

    // Date range filter on creation date.
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        const d = new Date(req.query.from);
        if (!Number.isNaN(d.getTime())) filter.createdAt.$gte = d;
      }
      if (req.query.to) {
        const d = new Date(req.query.to);
        if (!Number.isNaN(d.getTime())) filter.createdAt.$lte = d;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const result = await Withdrawal.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "networkId", select: "networkName networkSymbol" },
        { path: "assetId", select: "assetName assetSymbol" },
        { path: "apiKeyId", select: "keyName" },
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
    console.error("Get withdrawals error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const getWithdrawalById = async (req, reply) => {
  try {
    const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;
    const { id } = req.params;

    const withdrawal = await Withdrawal.findOne({ _id: id, merchantId })
      .populate("networkId", "networkName networkSymbol")
      .populate("assetId", "assetName assetSymbol")
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
    console.error("Get withdrawal by ID error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = { getWithdrawals, getWithdrawalById };
