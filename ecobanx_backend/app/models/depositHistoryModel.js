const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const DEPOSIT_STATUS = ["pending", "confirmed", "failed", "expired"];

const depositHistorySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MerchantApiKey",
      default: null,
      index: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      default: null,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    receivedAmount: {
      type: Number,
      default: 0,
    },
    txId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
      lowercase: true,
    },
    from: {
      type: String,
      default: null,
      trim: true,
    },
    contractAddress: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    network: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    symbol: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },
    decimal: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: DEPOSIT_STATUS,
      default: "confirmed",
      index: true,
    },
    type: {
      type: String,
      enum: ["payIn", "deposit"],
      required: true,
      default: "deposit",
      index: true,
    },
    buttonType: {
      type: String,
      enum: ["simple", "advanced"],
      default: null,
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["INVOICE"],
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

depositHistorySchema.index({ address: 1, createdAt: -1 });
depositHistorySchema.index({ network: 1, status: 1 });

depositHistorySchema.plugin(mongoosePaginate);

const DepositHistory = mongoose.model("DepositHistory", depositHistorySchema);

module.exports = { DepositHistory, DEPOSIT_STATUS };
