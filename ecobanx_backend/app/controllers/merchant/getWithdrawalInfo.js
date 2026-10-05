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

const getWithdrawalInfo = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId;
    const { cmd, withdrawal_Id } = req.validatedData || req.body || {};

    if (cmd !== "get_withdrawal_info") {
      return reply.code(400).send({ success: false, message: "Invalid cmd" });
    }

    if (!withdrawal_Id) {
      return reply.code(400).send({ success: false, message: "Missing required field: withdrawal_Id" });
    }

    const withdrawal = await Withdrawal.findOne({ withdrawId: withdrawal_Id, merchantId })
      .populate("assetId", "assetSymbol")
      .populate("networkId", "networkSymbol")
      .lean();

    if (!withdrawal) {
      return reply.code(404).send({ success: false, message: "Withdrawal not found" });
    }

    const coin = withdrawal.assetId?.assetSymbol || "ETH";
    const network = withdrawal.networkId?.networkSymbol || "ERC20";

    return reply.code(200).send({
      success: true,
      result: {
        time_created: Math.floor(withdrawal.createdAt.getTime() / 1000),
        coin,
        network,
        amount: withdrawal.amount.toFixed(8),
        fee: (withdrawal.fee || 0).toFixed(8),
        credit_amount: (withdrawal.netAmount || withdrawal.amount - (withdrawal.fee || 0)).toFixed(8),
        // send_address: withdrawal.fromAddress || "",
        destination_address: withdrawal.receiverAddress || withdrawal.toAddress || "",
        transactionHash: withdrawal.transactionHash || withdrawal.txHash || null,
        status: String(STATUS_MAP[withdrawal.status] ?? -1),
        status_text: STATUS_TEXT[withdrawal.status] || "Unknown",
        ipn_url: withdrawal.ipnUrl || null,
      },
    });
  } catch (error) {
    console.error("getWithdrawalInfo error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getWithdrawalInfo };
