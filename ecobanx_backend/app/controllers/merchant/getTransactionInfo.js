const { Transaction } = require("../../models/transactionModel");
const { DepositHistory } = require("../../models/depositHistoryModel");

const STATUS_MAP = {
  pending: -1,
  paid: 1,
  underpaid: 2,
  confirmed: 100,
  expired: -2,
  cancelled: -3,
};

const STATUS_TEXT = {
  pending: "Pending payment",
  paid: "Payment received, awaiting confirmations",
  underpaid: "Payment received but amount is less than expected",
  confirmed: "Payment completed successfully",
  expired: "Transaction expired",
  cancelled: "Transaction cancelled",
};

const getTransactionInfo = async (req, reply) => {
  try {
    const merchantId = req.user?.merchantId || req.user?._id || req.user?.id;
    const txnId =  req.body?.txid;

    const tx = await Transaction.findOne({ txnId, merchantId }).lean();
    console.log("🚀 ~ getTransactionInfo ~ tx:", tx)

    if (!tx) {
      return reply.code(404).send({
        success: false,
        message: "Transaction not found....",
      });
    }

    // Fallback for rows created before txnHash was persisted:
    // on-chain hash lives in DepositHistory.txId keyed by payment address.
    let transactionHash = tx.txnHash || null;
    if (!transactionHash && tx.address) {
      const dep = await DepositHistory.findOne({
        address: { $regex: `^${tx.address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      })
        .select("txId")
        .sort({ createdAt: -1 })
        .lean();
      if (dep?.txId) transactionHash = dep.txId;
    }

    return reply.code(200).send({
      success: true,
      result: {
        txn_id: tx.txnId,
        time_created: Math.floor(tx.createdAt.getTime() / 1000),
        coin: tx.currency2,
        network: tx.network,
        payment_address: tx.address,
        currency1: tx.currency1,
        currency2: tx.currency2,
        amount1: tx.amount,
        amount2: tx.amountInCurrency2.toFixed(8),
        item_name: tx.itemName || "",
        item_number: tx.itemNumber || "",
        invoice: tx.invoice || "",
        custom: tx.custom || "",
        ipn_url: tx.ipnUrl || "",
        received_amount: tx.receivedAmount ?? 0,
        confirms_needed: tx.confirmsNeeded,
        confirmations: tx.confirmations,
        transaction_hash: transactionHash,
        status: STATUS_MAP[tx.status] || -1,
        status_text: STATUS_TEXT[tx.status] || "Unknown",
      },
    });
  } catch (error) {
    console.error("getTransactionInfo error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getTransactionInfo };
