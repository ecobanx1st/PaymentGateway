const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const buttonMakerSchema = new mongoose.Schema(
    {
        merchantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Merchant",
            required: true,
            index: true,
        },
        itemName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        amountInCurrency: {
            type: Number,
            required: true,
            min: 0,
        },
        fiatName: {
            type: String,
            required: true,
            trim: true,
        },
        requestAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        receivedAmount: {
            type: Number,
            default: 0,
        },
        assetSymbol: {
            type: String,
            required: true,
            trim: true,
        },
        assetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },
        NetworkName: {
            type: String,
            required: false,
            trim: true,
            default: null,
        },
        network: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Network",
            required: false,
        },
        itemDescription: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null,
        },
        itemNumber: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null,
        },
        invoice: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null,
        },
        //for advanced
        itemQuantity: {
            type: Number,
            min: 1,
            default: null,
        },
        //for advanced
        editQuantity: {
            type: Boolean,
            default: false,
        },
        taxAmount: {
            type: Number,
            min: 0,
            default: null,
        },
        shippingCost: {
            type: Number,
            min: 0,
            default: null,
        },
        //for advanced
        additionalShippingCost: {
            type: Number,
            min: 0,
            default: null,
        },

        successUrl: {
            type: String,
            required: true,
            trim: true,
        },

        cancelUrl: {
            type: String,
            required: true,
            trim: true,
        },

        ipnUrl: {
            type: String,
            required: true,
            trim: true,
        },

        buttonType: {
            type: String,
            enum: ["Simple", "Advanced"],
            required: true,
        },

        amountReceivedStatus: {
            type: String,
            enum:["pending", "Confirmed", "Failed"],
            default: "pending",
            index: true,
        },
        BuyerDetails: {
            email: {
                type: String,
                required: false,
                trim: true,
            },
            firstname: {
                type: String,
                required: false,
                trim: true,
            },
            lastname: {
                type: String,
                required: false,
            }
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

buttonMakerSchema.index({
    merchantId: 1,
    createdAt: -1,
});

buttonMakerSchema.index({
    merchantId: 1,
    amountReceived: 1,
});

buttonMakerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ButtonMaker", buttonMakerSchema);