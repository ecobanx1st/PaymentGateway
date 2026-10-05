const { MerchantApiHistory } = require("../../models/merchantApiHistoryModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const getApiHistory = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId || req.user._id || req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const filter = { merchantId };

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    if (req.query.search) {
      const search = req.query.search;
      filter.$or = [
        { endpoint: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { method: { $regex: search, $options: "i" } },
      ];
      // Match API key name -> filter by its key ids.
      const matchedKeys = await MerchantApiKey.find({
        keyName: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        filter.$or.push({ apiKeyId: { $in: matchedKeys.map((k) => k._id) } });
      }
    }

    if (req.query.endpoint) {
      filter.endpoint = { $regex: req.query.endpoint, $options: "i" };
    }

    if (req.query.success !== undefined) {
      filter.success = req.query.success === "true";
    }

    if (req.query.responseStatus) {
      filter.responseStatus = parseInt(req.query.responseStatus, 10);
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-_id endpoint method requestBody responseStatus success message ip createdAt apiKeyId",
      populate: [{ path: "apiKeyId", select: "keyName" }],
      lean: true,
    };

    const result = await MerchantApiHistory.paginate(filter, options);

    result.docs.forEach((r) => {
      r.apiKeyName = r.apiKeyId?.keyName || null;
      delete r.apiKeyId;
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
    console.error("getApiHistory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getApiHistory };
