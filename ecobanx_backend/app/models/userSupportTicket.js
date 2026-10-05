const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
      default: null,
    },
    senderType: {
      type: String,
      enum: ["user", "admin", "system"],
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const userSupportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [50, "Title cannot exceed 50 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    // Existing category (selected from dropdown)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicketCategory",
      default: null,
    },

    // New field when "Other" is selected
    customCategory: {
      type: String,
      trim: true,
      default: null,
      minlength: [10, "Custom category must be at least 10 characters"],
      maxlength: [25, "Custom category cannot exceed 25 characters"],
    },

    // priority: {
    //   type: String,
    //   enum: {
    //     values: ["Low", "Medium", "High"],
    //     message: "Invalid priority",
    //   },
    //   default: "Medium",
    // },

    status: {
      type: String,
      enum: {
        values: ["Open", "Closed"],
        message: "Invalid status",
      },
      default: "Open",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },

    messages: [supportMessageSchema],
  },
  { timestamps: true }
);

userSupportSchema.index({ userId: 1, createdAt: -1 }, { name: "idx_ticket_user_created" });
userSupportSchema.index({ status: 1, createdAt: -1 }, { name: "idx_ticket_status_created" });
userSupportSchema.index({ category: 1 }, { name: "idx_ticket_category" });
userSupportSchema.index({ assignedTo: 1 }, { name: "idx_ticket_assigned" });

const SupportTicket = mongoose.model("SupportTicket", userSupportSchema);

module.exports = { SupportTicket };