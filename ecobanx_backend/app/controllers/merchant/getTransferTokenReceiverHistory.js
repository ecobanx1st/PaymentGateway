const { DepositHistory } = require("../../models/depositHistoryModel");

const getTransferToReceiverHistory = async (req, reply) => {
  try {
    const {
      address,
      page = "1",
      limit = "10",
      search,
      network,
      type,
      startDate,
      endDate,
    } = req.validatedData || req.body || {};

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (address) {
      filter.address = address;
    }

    if (network) {
      filter.network = network.toUpperCase();
    }


    if (search) {
      const searchRegex = { $regex: search, $options: "i" };

      filter.$or = [
        { txId: searchRegex },
        { from: searchRegex },
        { contractAddress: searchRegex },
        { symbol: searchRegex },
        { network: searchRegex },
        { address: searchRegex },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const result = await DepositHistory.paginate(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
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
    console.error("getTransferToReceiverHistory error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getTransferToReceiverHistory };