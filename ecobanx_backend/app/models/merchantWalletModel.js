const mongoose = require("mongoose");

const merchantWalletSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
    index: true,
  },
  walletIndex: {
    type: Number,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  coin: {
    type: String,
    required: true,
    uppercase: true,
    default: "ETH",
  },
  network: {
    type: String,
    required: true,
    uppercase: true,
    default: "ERC20",
  },
  encryptedPrivateKey: {
    type: String,
    required: true,
  },
  derivationPath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "DISABLED"],
    default: "ACTIVE",
  },
}, { timestamps: true });

merchantWalletSchema.index({ merchantId: 1, coin: 1, network: 1 }, { unique: true });

const MerchantWallet = mongoose.model("MerchantWallet", merchantWalletSchema);

module.exports = { MerchantWallet };
