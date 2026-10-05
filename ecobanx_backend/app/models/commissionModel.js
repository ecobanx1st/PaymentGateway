const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true,
        },

        buyCommission: {
            type: Number,
            required: true,
            min: 0,
        },
        sellCommission: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true })

commissionSchema.index({ type: 1 }, { unique: true, name: "idx_commission_type" });

const commission = mongoose.model("commission", commissionSchema);

module.exports = { commission };