const mongoose = require("mongoose");

const LEDGER_TYPES = [
  "WITHDRAWAL_REQUEST",
  "WITHDRAWAL_FEE",
  "BALANCE_LOCK",
  "BALANCE_UNLOCK",
  "WITHDRAWAL_SUCCESS",
  "WITHDRAWAL_REJECTION_REFUND",
  "WITHDRAWAL_FAILED_REFUND",
  "DEPOSIT",
  "ADJUSTMENT",
];

const ledgerSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdrawal",
      default: null,
    },
    assetSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: LEDGER_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    lockedBefore: {
      type: Number,
      default: 0,
    },
    lockedAfter: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

ledgerSchema.index({ merchantId: 1, createdAt: -1 });
ledgerSchema.index({ withdrawalId: 1 });
ledgerSchema.index({ type: 1 });

const Ledger = mongoose.model("Ledger", ledgerSchema);

module.exports = { Ledger, LEDGER_TYPES };
