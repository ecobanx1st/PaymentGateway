const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ipnHistorySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
      index: true,
    },
    txnId: {
      type: String,
      default: null,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    success: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: null,
    },
    responseBody: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

ipnHistorySchema.index({ merchantId: 1, createdAt: -1 });

ipnHistorySchema.plugin(mongoosePaginate);

const IpnHistory = mongoose.model("IpnHistory", ipnHistorySchema);

module.exports = { IpnHistory };
