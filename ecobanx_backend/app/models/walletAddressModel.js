const mongoose = require("mongoose");

const walletAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    hexAddress: {
      type: String,
      trim: true,
      default: null,
    },
    publicKey: {
      type: String,
      trim: true,
      default: null,
    },
    privateKey: {
      type: String,
      required: true,
      select: false,
    },
    networkType: {
      type: String,
      required: true,
      enum: ["EVM", "SOL", "TRX"],
    },
  },
  { timestamps: true }
);


const WalletAddress = mongoose.model("WalletAddress", walletAddressSchema);

module.exports = { WalletAddress };