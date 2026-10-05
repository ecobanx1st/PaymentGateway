const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String
    },

    accountType: {
        type: String,
        // required: true,
        enum: ["individual", "business"],
    },
    companyName: {
        type: String,
        required: function () {
            return this.accountType === "business";
        },
        trim: true,
    },

    companyWebsite: {
        type: String,
        required: function () {
            return this.accountType === "business";
        },
        trim: true,
    },


    businessName: {
        type: String,
    },
    phoneCountryCode: {
        type: String,
    },
    // isGoogleLogin: {
    //     type: Boolean,
    //     default: false
    // },
    // isTelegramLogin: {
    //     type: Boolean,
    //     default: false
    // },
    country: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    accountverifyStatus: {
        type: Boolean,
        default: false,
    },
    emailOtp: {
        type: Number,
    }, smsOtp: {
        type: Number,
    },

    // Used to calculate resend countdown
    lastEmailOtpSentAt: {
        type: Date,
        default: null,
    },
    emailOtpExpiresAt: {
        type: Date,
        default: null,
    },
    password: {
        type: String,
        select: false
    },
}, { timestamps: true });

userSchema.index({ email: 1 }, { name: "idx_stage_email" });

const Users = mongoose.model("stageusers", userSchema);

module.exports = { Users };
