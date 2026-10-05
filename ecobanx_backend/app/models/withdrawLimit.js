const mongoose = require("mongoose");

const withdrawLimitSchema = new mongoose.Schema(
    {
        withdrawalFee: {
            type: Number,
            required: true,
            min: 0,
        },
    }

)

module.exports = mongoose.model("WithdrawLimit", withdrawLimitSchema);