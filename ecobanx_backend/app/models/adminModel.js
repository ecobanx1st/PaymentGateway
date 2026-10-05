const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    unique_id: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    verifyStatus: {
        type: Boolean,
        default: true,
    },
    profile_picture: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    country: {
        type: String
    },
    role: {
        type: String,
        default: "admin",
    },
    phone:{
              type: String,
  
    },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      twoFactorSecret: {
        type: String,
      },
      otpauth_url: {
        type: String,
      },
    
    // Refresh token management
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
}, { timestamps: true });

const Admins = mongoose.model("admins", adminSchema);

module.exports = { Admins };
