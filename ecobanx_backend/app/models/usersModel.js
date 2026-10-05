const mongoose = require("mongoose");
const { string } = require("zod");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      required: true,
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
    // businessName: {
    //   type: String,
    // },
    password: {
      type: String,
      required: true,
      select: false,
    },
    forgotPasswordOtp: {
      type: Number,
    },
    lastForgotPasswordOtpSentAt: {
      type: Date,
    },
    accountverifyStatus: {
      type: Boolean,
      default: true,
    },
    profile_picture: {
      type: String,
      default: null,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
    },

    otpauth_url: {
      type: String,
      default: "",
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    forgotPasswordOtpExpiresAt: {
      type: Date,
    },

    // for auto lock setting with out any activities in app
    lockTimeoutMinutes: {
      type: Number,
      enum: [1, 5, 15, 30],
      default: 5
    },


    background_picture: {
      type: String,
      default: null,
    },
    phoneCountryCode: {
      type: String,
    },
    phone: {
      type: String,
    },
    dob: {
      type: String,
    },

    gender: {
      type: String,
    },
    country: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    ip: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedLoginAt: {
      type: Date,
      default: null,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },
    refreshTokenExpiresAt: {
      type: Date,
      default: null,
    },
    lastLoginTime: {
      type: Date,
      default: null,
    },

    blockstatus: {
      type: Boolean,
      default: false,
    },
    walletStatus: {
      type: Boolean,
      default: false
    },
    userUniqueId: {
      type: String,
      default: null,
      unique: true,
  },
},
  { timestamps: true },
);

userSchema.plugin(mongoosePaginate);

// Unique lookups — partial so null/missing values don't collide
userSchema.index(
  { email: 1 },
  {
    name: "idx_users_email",
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);
userSchema.index(
  { phone: 1 },
  {
    name: "idx_users_phone_unique",
    unique: true,
    partialFilterExpression: { phone: { $type: "string" } },
  },
);


const Users = mongoose.model("users", userSchema);

module.exports = { Users };
