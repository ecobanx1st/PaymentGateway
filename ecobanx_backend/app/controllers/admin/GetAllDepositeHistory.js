const { DepositHistory } = require("../../models/depositHistoryModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");

const GetAllDepositeHistory = async (req, reply) => {
  try {
    const {
      address,
      page = "1",
      limit = "10",
      search,
      network,
      status,
      type,
      buttonType,
      fromDate,
      toDate,
      startDate,
      endDate,
    } = req.query || {};

    const filter = {};

    // Deposit type: deposit / payIn
    if (type) {
      const t = String(type).trim();
      if (t.toLowerCase() !== "all") {
        filter.type = t;
      }
    }

    // Wallet address
    if (address) {
      filter.address = address;
    }

    // Network
    if (network) {
      filter.network = network.toUpperCase();
    }

    // Status (stored lowercase: pending / confirmed / failed)
    if (status) {
      const s = String(status).trim().toLowerCase();
      if (s !== "all") {
        filter.status = s;
      }
    }

    // Button type: simple / advanced (stored lowercase)
    if (buttonType) {
      const b = String(buttonType).trim().toLowerCase();
      if (b && b !== "all") {
        filter.buttonType = b;
      }
    }

    // Search
    if (search?.trim()) {
      const safeSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { txId: searchRegex },
        { reference: searchRegex },
        { symbol: searchRegex },
        { address: searchRegex },
        { from: searchRegex },
        { contractAddress: searchRegex },
        { network: searchRegex },
      ];

      // API key name -> filter by its key ids.
      const matchedKeys = await MerchantApiKey.find({ keyName: searchRegex })
        .select("_id")
        .lean();
      if (matchedKeys.length > 0) {
        filter.$or.push({ apiKeyId: { $in: matchedKeys.map((k) => k._id) } });
      }
    }

    // From date / To date
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        filter.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = end;
      }
    }

    // --------------------------------
    // Date filter → NO PAGINATION
    // --------------------------------
    if (startDate || endDate) {
      const deposits = await DepositHistory.find(filter)
        .sort({ createdAt: -1 })
        .populate("merchantId", "fullName email companyName accountType")
        .populate("userId", "fullName email companyName accountType")
        .populate("apiKeyId", "keyName")
        .lean();

      deposits.forEach((d) => {
        d.apiKeyName = d.apiKeyId?.keyName || null;
        delete d.apiKeyId;
      });

      return reply.code(200).send({
        success: true,
        data: {
          deposits,
          total: deposits.length,
        },
      });
    }

    // --------------------------------
    // Normal listing → PAGINATION
    // --------------------------------
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, Number(limit) || 10)
    );

    const result = await DepositHistory.paginate(filter, {
      page: pageNum,
      limit: limitNum,
      sort: { createdAt: -1 },
      populate: [
        { path: "merchantId", select: "fullName email companyName accountType" },
        { path: "userId", select: "fullName email companyName accountType" },
        { path: "apiKeyId", select: "keyName" },
      ],
      lean: true,
    });

    result.docs.forEach((d) => {
      d.apiKeyName = d.apiKeyId?.keyName || null;
      delete d.apiKeyId;
    });

    return reply.code(200).send({
      success: true,
      data: {
        deposits: result.docs,
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
    console.error("GetAllDepositeHistory error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { GetAllDepositeHistory };