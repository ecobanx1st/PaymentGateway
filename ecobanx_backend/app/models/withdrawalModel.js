const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const WITHDRAWAL_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"];

const withdrawalSchema = new mongoose.Schema(
  {
    merchantId: {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    walletAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletAddress",
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
    },

    statusUrl: {
      type: String,
      default: null,
    },
    networkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    withdrawFee: {
      type: Number,
      default: 0,
    },
    withdrawId: {
      type: String,
      default: null,  
    },
    netAmount: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    toAddress: {
      type: String,
      trim: true,
    },
    fromAddress: {
      type: String,
      trim: true,
    },
    receiverAddress: {
      type: String,
      required: true,
      trim: true,
    },
    txHash: {
      type: String,
      default: null,
      trim: true,
    },
    transactionHash: {
      type: String,
      default: null,
      trim: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    gasFee: {
      type: Number,
      default: null,
    },
    explorerUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: WITHDRAWAL_STATUSES,
      default: "PENDING",
    },
    type: {
      type: String,
      enum: ["withdraw", "payOut"],
      default: "withdraw",
    },
    withdrawFrom: {
      type: String,
      enum: ["request_withdraw", "create_transfer"],
      default: null,
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    approvalLevel: {
      type: String,
      enum: ["ADMIN", "MERCHANT"],
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    ipnUrl: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { timestamps: true }
);

withdrawalSchema.index({ merchantId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ adminId: 1 });

withdrawalSchema.plugin(mongoosePaginate);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

module.exports = { Withdrawal, WITHDRAWAL_STATUSES };
