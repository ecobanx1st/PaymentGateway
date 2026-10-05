const mongoose = require("mongoose");

const merchantWithDrawLimit = new mongoose.Schema(
    {
        merchantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Merchants",
            required: true,
            unique: true,
            index: true,
        },

        merchantUsersDailyLimit: {
            type: Number,
            required: true,
            min: 0,
        },

        withdrawalLimit: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "MerchantWithDrawLimit",
    merchantWithDrawLimit
);