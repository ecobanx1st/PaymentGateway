const { Withdrawal } = require("../../models/withdrawalModel");

const STATUS_MAP = {
  PENDING: 1,
  APPROVED: 1,
  PROCESSING: 1,
  COMPLETED: 2,
  REJECTED: -1,
  FAILED: -1,
};

const STATUS_TEXT = {
  PENDING: "Pending",
  APPROVED: "Pending",
  PROCESSING: "Pending",
  COMPLETED: "Complete",
  REJECTED: "Cancelled",
  FAILED: "Cancelled",
};

const getWithdrawalHistory = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId;
    const data = req.validatedData || req.body || {};
    const { cmd, search, from, to, status } = data;
    const limit = Math.min(Math.max(data.limit || 25, 1), 100);
    const start = data.start || 0;
    const page = Math.floor(start / limit) + 1;

    if (cmd !== "get_withdrawal_history") {
      return reply.code(400).send({ success: false, message: "Invalid cmd" });
    }

    const filter = { merchantId };

    if (search) {
      filter.$or = [
        { withdrawId: { $regex: search, $options: "i" } },
        { txHash: { $regex: search, $options: "i" } },
        { transactionHash: { $regex: search, $options: "i" } },
        { receiverAddress: { $regex: search, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (status) {
      const upper = status.toUpperCase();
      if (["PENDING", "APPROVED", "PROCESSING"].includes(upper)) {
        filter.status = { $in: ["PENDING", "APPROVED", "PROCESSING"] };
      } else if (upper === "COMPLETED") {
        filter.status = "COMPLETED";
      } else if (["REJECTED", "FAILED", "CANCELLED"].includes(upper)) {
        filter.status = { $in: ["REJECTED", "FAILED"] };
      }
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "assetId", select: "assetSymbol" },
        { path: "networkId", select: "networkSymbol" },
      ],
      lean: true,
    };

    const result = await Withdrawal.paginate(filter, options);

    const withdrawals = result.docs.map((w) => {
      const coin = w.assetId?.assetSymbol || "ETH";
      const networkSymbol = w.networkId?.networkSymbol || "ERC20";

      return {
        withdrawal_Id: w.withdrawId,
        time_created: Math.floor(w.createdAt.getTime() / 1000),
        status: STATUS_MAP[w.status] ?? -1,
        status_text: STATUS_TEXT[w.status] || "Unknown",
        coin,
        network: networkSymbol,
        // amount: Math.round(w.amount * 1e8),
        amount: w.amount.toFixed(8),
        // send_address: w.fromAddress || "",
        destination_address: w.receiverAddress || w.toAddress || "",
        transactionHash: w.txHash || w.transactionHash || null,
        fee: w.fee || 0,
      };
    });
    console.log("🚀 ~ getWithdrawalHistory ~ withdrawals:", withdrawals)

    return reply.code(200).send({
      success: true,
      result: withdrawals,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("getWithdrawalHistory error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getWithdrawalHistory };
