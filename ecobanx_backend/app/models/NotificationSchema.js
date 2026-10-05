const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const NotificationCategory = {
    ONBOARDING: "ONBOARDING",
    SECURITY: "SECURITY",
    SUPPORT: "SUPPORT",
    SYSTEM: "MAINTENANCE_ALERT",
    TRANSACTION: "TRANSACTION",
};

const notificationSchema = new Schema(
    {
        user_id: {
            type: ObjectId,
            ref: "users",
            default: null,
            index: true,
        },

        admin_id: {
            type: ObjectId,
            ref: "admins",
            default: null,
            index: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "deposit",
                "payIn",
                "payOut",
                "withdraw",
                "register",
                "login",
                "security",
                "support",
                "general",
                "subscription",
                "referral",
                "SYSTEM",
                "ADMIN",
            ],
            default: "general",
            index: true,
        },

        category: {
            type: String,
            enum: Object.values(NotificationCategory),
            default: NotificationCategory.SYSTEM,
            index: true,
        },

        status: {
            type: String,
            enum: ["info", "success", "failed", "ACTIVE"],
            default: "ACTIVE",
        },

        referenceId: {
            type: ObjectId,
            default: null,
            index: true,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        seen: {
            type: Boolean,
            default: false,
            index: true,
        },

        createdBy: {
            type: ObjectId,
            ref: "admins",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index(
    { user_id: 1, isRead: 1, createdAt: -1 },
    { name: "idx_user_read_createdAt" }
);
notificationSchema.plugin(mongoosePaginate);
notificationSchema.index(
    { admin_id: 1, isRead: 1, createdAt: -1 },
    { name: "idx_admin_read_createdAt" }
);

notificationSchema.index(
    { role: 1, status: 1, createdAt: -1 },
    { name: "idx_role_status_createdAt" }
);

notificationSchema.index(
    { category: 1, createdAt: -1 },
    { name: "idx_category_createdAt" }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema,
    "notifications"
);

module.exports = {
    Notification,
    NotificationCategory,
};