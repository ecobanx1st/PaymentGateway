const mongoose = require("mongoose");
const { Transaction } = require("../../models/transactionModel");
const { sendIpnNotification } = require("../../services/ipn/ipnService");
const { emitPaymentConfirmed } = require("../../socket/paymentSocketHandler");

const confirmTransaction = async (req, reply) => {
  try {
    const merchantId = req.user?.merchantId || req.validatedData?.merchant_id || req.body?.merchant_id;
    const { cmd, txn_id, received_amount } = req.validatedData || req.body || {};

    if (cmd !== "confirm_transaction") {
      return reply.code(400).send({ success: false, message: "Invalid cmd" });
    }

    if (!txn_id) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: txn_id",
      });
    }

    if (!merchantId) {
      return reply.code(401).send({
        success: false,
        message: "Merchant authentication required",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(txn_id)
      ? { _id: txn_id, merchantId }
      : { txnId: txn_id, merchantId };

    const transaction = await Transaction.findOne(query).lean();
    if (!transaction) {
      return reply.code(404).send({
        success: false,
        message: "Transaction not found for this merchant",
      });
    }

    if (transaction.status === "confirmed") {
      return reply.code(200).send({
        success: true,
        message: "Transaction already confirmed",
        result: {
          txn_id: transaction.txnId,
          status: "confirmed",
        },
      });
    }

    const update = { status: "confirmed" };
    if (received_amount != null) {
      update.receivedAmount = received_amount;
    } else {
      update.receivedAmount = transaction.amount;
    }

    await Transaction.updateOne({ _id: transaction._id }, update);

    const confirmationPayload = {
      merchant_id: merchantId,
      transaction_id: transaction._id.toString(),
      txn_id: transaction.txnId,
      amount: transaction.amount,
      received_amount: update.receivedAmount,
      currency1: transaction.currency1,
      currency2: transaction.currency2,
      network: transaction.network,
      address: transaction.address,
      status: "confirmed",
      timestamp: new Date().toISOString(),
    };

    await emitPaymentConfirmed(transaction.txnId, confirmationPayload);

    if (transaction.ipnUrl) {
      await sendIpnNotification(transaction.ipnUrl, confirmationPayload);
    }

    return reply.code(200).send({
      success: true,
      message: "Transaction confirmed",
      result: {
        txn_id: transaction.txnId,
        amount: transaction.amount,
        receivedAmount: update.receivedAmount,
        status: "confirmed",
      },
    });
  } catch (error) {
    console.error("confirmTransaction error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { confirmTransaction };
