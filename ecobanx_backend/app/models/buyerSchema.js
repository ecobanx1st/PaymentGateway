const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema(
    {
        merchantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
            index: true,
        },

        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            required: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        firstname: {
            type: String,
            required: true,
            trim: true,
        },

        lastname: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = { Buyer };