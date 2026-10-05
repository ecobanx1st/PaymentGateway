const { IpnHistory } = require("../../models/ipnHistoryModel");
const { Transaction } = require("../../models/transactionModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const getIpnHistory = async (req, reply) => {
  try {
    const body = req.validatedData || req.body || {};
    const page = parseInt(body.page, 10) || 1;
    const limit = parseInt(body.limit, 10) || 10;

    const filter = {};

    if (body.merchantId) {
      filter.merchantId = body.merchantId;
    }

    if (body.search) {
      const search = body.search;
      filter.$or = [
        { txnId: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
        { error: { $regex: search, $options: "i" } },
      ];
      // API key name -> transactions created with that key -> their IPNs.
      const matchedKeys = await MerchantApiKey.find({
        keyName: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        const keyTxns = await Transaction.find({
          apiKeyId: { $in: matchedKeys.map((k) => k._id) },
        })
          .select("_id")
          .lean();
        if (keyTxns.length > 0) {
          filter.$or.push({
            transactionId: { $in: keyTxns.map((t) => t._id) },
          });
        }
      }
    }

    if (body.success !== undefined && body.success !== "") {
      filter.success = body.success === true || body.success === "true";
    }

    if (body.from || body.to) {
      filter.createdAt = {};
      if (body.from) filter.createdAt.$gte = new Date(body.from);
      if (body.to) filter.createdAt.$lte = new Date(body.to);
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "merchantId", select: "fullName email" },
        {
          path: "transactionId",
          select: "txnId amount currency1 currency2 status apiKeyId",
          populate: { path: "apiKeyId", select: "keyName" },
        },
      ],
      lean: true,
    };

    const result = await IpnHistory.paginate(filter, options);

    result.docs.forEach((item) => {
      item.apiKeyName = item.transactionId?.apiKeyId?.keyName || null;
      if (item.transactionId) delete item.transactionId.apiKeyId;
    });

    return reply.code(200).send({
      success: true,
      data: {
        records: result.docs,
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
    console.error("getIpnHistory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getIpnHistory };
