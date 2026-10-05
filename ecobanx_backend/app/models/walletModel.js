const mongoose = require('mongoose');


const walletSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },

    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
        required: true,
        index: true,
    },

    free: {
        type: Number,
        default: 0,
        min: 0,
    },

    locked: {
        type: Number,
        default: 0,
        min: 0,
    },

    total: {
        type: Number,
        default: 0,
    },
}, { timestamps: true })


walletSchema.index({ userId: 1, assetId: 1 }, { unique: true });

const Wallets = mongoose.model("wallet", walletSchema);

module.exports = { Wallets };
