const mongoose = require("mongoose");

const adminStaffSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        default: "staff",
    },
    roleType: {
        type: String,
    },
    permissions: [{
        type: String,
    }],
    status: {
        type: String,
        default: "active",
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

const AdminStaff = mongoose.model("adminstaffs", adminStaffSchema);

module.exports = { AdminStaff, AdminStaffs: AdminStaff };
