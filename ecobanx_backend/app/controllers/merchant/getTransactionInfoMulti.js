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
  expired: "Cancelled / Timed Out",
  cancelled: "Cancelled / Timed Out",
};

const getTransactionInfoMulti = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId || req.user._id;
    const data = req.validatedData || req.body || {};
    const { cmd, search, from, to } = data;
    const page = data.page || 1;
    const limit = data.limit || 10;


    const filter = { merchantId };

    if (search) {
      filter.txnId = { $regex: search, $options: "i" };
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    };

    const result = await Transaction.paginate(filter, options);

    // Fallback for rows created before txnHash was persisted:
    // batch-lookup DepositHistory.txId by payment address.
    const missingAddrs = [...new Set(result.docs.filter((d) => !d.txnHash && d.address).map((d) => String(d.address).toLowerCase()))];
    let hashByAddr = {};
    if (missingAddrs.length) {
      const deps = await DepositHistory.find({ address: { $in: missingAddrs.map((a) => new RegExp(`^${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) } })
        .select("address txId")
        .sort({ createdAt: -1 })
        .lean();
      for (const d of deps) {
        const k = String(d.address || "").toLowerCase();
        if (k && !hashByAddr[k]) hashByAddr[k] = d.txId;
      }
    }

    const transactions = result.docs.map((tx, index) => {
    const transactionHash = tx.txnHash || hashByAddr[String(tx.address || "").toLowerCase()] || null;
    return {
      id: (result.page - 1) * result.limit + index + 1,
      time_created: Math.floor(tx.createdAt.getTime() / 1000),
      coin: tx.currency2,
      network: tx.network,
      order_id: tx.txnId,
      transaction_hash: transactionHash,
      // transaction_url: transactionHash ? `https://etherscan.io/tx/${transactionHash}` : null,
      payment_address: tx.address,
      received_amount: tx.receivedAmount ?? 0,
      currency1: tx.currency1,
      currency2: tx.currency2,
      amount1: tx.amount.toFixed(8),
      amount2: tx.amountInCurrency2.toFixed(8),
      item_name: tx.itemName || "",
      status: STATUS_MAP[tx.status] || -1,
      status_text: STATUS_TEXT[tx.status] || "Unknown",
    };
    });

    return reply.code(200).send({
      success: true,
      result: transactions,
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
    console.error("getTransactionInfoMulti error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getTransactionInfoMulti };
