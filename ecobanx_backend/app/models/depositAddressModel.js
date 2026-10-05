const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const depositAddressSchema = new mongoose.Schema(
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
    coin: {
      type: String,
      required: true,
      uppercase: true,
    },
    network: {
      type: String,
      required: true,
      uppercase: true,
    },
    isAddressLive: {
      type: String,
      default: true,
    },
    networkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
      default: null,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    encryptedPrivateKey: {
      type: String,
      required: true,
    },
    walletIndex: {
      type: Number,
      required: true,
    },
    addressIndex: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "failed"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

depositAddressSchema.plugin(mongoosePaginate);

const DepositAddress = mongoose.model("DepositAddress", depositAddressSchema);

module.exports = { DepositAddress };
