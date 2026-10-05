const { Withdrawal } = require("../../models/withdrawalModel");
const { Network } = require("../../models/Network");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const getPendingPayouts = async (req, reply) => {
  try {
    const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = {
      merchantId,
      type: "payOut",
      withdrawFrom: "create_transfer",
    };

    // Status tab: Pending (default) / Approved / Rejected / All.
    const tab = String(req.query.status || "Pending").trim().toUpperCase();
    if (tab === "ALL") {
      // no status filter
    } else if (tab === "PENDING") {
      filter.status = "PENDING";
    } else if (tab === "APPROVED" || tab === "COMPLETED") {
      filter.status = { $in: ["APPROVED", "COMPLETED"] };
    } else if (["REJECTED", "FAILED", "CANCELLED"].includes(tab)) {
      filter.status = { $in: ["REJECTED", "FAILED"] };
    } else {
      filter.status = tab;
    }

    if (req.query.search && String(req.query.search).trim()) {
      const rx = { $regex: String(req.query.search).trim(), $options: "i" };
      filter.$or = [
        { withdrawId: rx },
        { txHash: rx },
        { transactionHash: rx },
        { receiverAddress: rx },
        { toAddress: rx },
      ];
      // Match API key name -> filter by its key ids.
      const matchedKeys = await MerchantApiKey.find({ keyName: rx })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        filter.$or.push({ apiKeyId: { $in: matchedKeys.map((k) => k._id) } });
      }
    }
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
        filter.networkId = null; 
      }
    }

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
    console.error("Get pending payouts error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = { getPendingPayouts };
