const { Transaction } = require("../../models/transactionModel");

const depositTransactionHistory = async (req, reply) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status.toLowerCase();
    }

    if (req.query.merchantId) {
      filter.merchantId = req.query.merchantId;
    }

    if (req.query.search) {
      filter.$or = [
        { txnId: { $regex: req.query.search, $options: "i" } },
        { address: { $regex: req.query.search, $options: "i" } },
        { txnHash: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const result = await Transaction.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "merchantId", select: "fullName email" },
      ],
      lean: true,
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
    console.error("Get all deposits error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const depositTransactionHistoryById = async (req, reply) => {
  try {
     const _id = req.params.id || req.validatedData?.txid || req.body?.txid;

    const deposit = await Transaction.findOne({ _id })
      .populate("merchantId", "fullName email")
      .lean();


    if (!deposit) {
      return reply.code(404).send({ success: false, message: "Deposit not found" });
    }

    return reply.code(200).send({
      success: true,
      data: deposit,
      message: "Deposit fetched successfully",
    });
  } catch (error) {
    console.error("Get deposit detail error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  depositTransactionHistory,
  depositTransactionHistoryById
};