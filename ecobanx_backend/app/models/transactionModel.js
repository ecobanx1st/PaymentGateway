const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const transactionSchema = new mongoose.Schema({
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
  txnId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  amountInCurrency2: {
    type: Number,
    required: true,
  },
  // Canonical buyer payment amount as an exact decimal string (no float loss).
  // amountInCurrency2 above is kept for existing numeric consumers.
  cryptoAmount: {
    type: String,
    default: null,
  },
  currency1: {
    type: String,
    required: true,
    uppercase: true,
  },
  currency2: {
    type: String,
    required: true,
    uppercase: true,
  },
  network: {
    type: String,
    uppercase: true,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  destTag: {
    type: String,
    default: null,
  },
  buyerEmail: {
    type: String,
    default: null,
  },
  buyerFirstname: {
    type: String,
    default: null,
  },
  buyerLastname: {
    type: String,
    default: null,
  },
  buyerName: {
    type: String,
    default: null,
  },
  fullName: {
    type: String,
    default: null,
  },
  itemName: {
    type: String,
    default: null,
  },
  itemNumber: {
    type: String,
    default: null,
  },
  invoice: {
    type: String,
    default: null,
  },
  custom: {
    type: String,
    default: null,
  },
  ipnUrl: {
    type: String,
    default: null,
  },
  successUrl: {
    type: String,
    default: null,
  },
  cancelUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["created", "pending", "confirmed", "completed", "failed", "expired", "cancelled"],
    default: "pending",
    index: true,
  },
  type: {
    type: String,
    enum: ["payin", "payout"],
    default: "payin",
    required: true,
    index: true,
  },
  paymentType: {
    type: String,
    enum: ["INVOICE"],
    default: null,
    index: true,
  },
  confirmsNeeded: {
    type: Number,
    default: 12,
  },
  timeout: {
    type: Number,
  },
  exchangeRate: {
    type: String,
    default: null,
  },
  marketRate: {
    type: String,
    default: null,
  },
  quoteCreatedAt: {
    type: Date,
    default: null,
  },
  quoteExpiresAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  checkoutUrl: {
    type: String,
    default: null,
  },
  qrcodeUrl: {
    type: String,
    default: null,
  },
  statusUrl: {
    type: String,
    default: null,
  },
  receivedAmount: {
    type: Number,
    default: null,
  },
  txnHash: {
    type: String,
    default: null,
  },
  confirmations: {
    type: Number,
    default: 0,
  },
  buttonType: {
    type: String,
    enum: ["simple", "advanced"],
    default: null,
    index: true,
  },
  item_name: {
    type: String,
    default: null,
  },
  item_description: {
    type: String,
    default: null,
  },
  item_quantity: {
    type: Number,
    default: null,
  },
  tax_amount: {
    type: Number,
    default: null,
  },
  shipping_cost: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

transactionSchema.plugin(mongoosePaginate);

transactionSchema.index({ merchantId: 1, createdAt: -1 });
transactionSchema.index({ merchantId: 1, status: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };
