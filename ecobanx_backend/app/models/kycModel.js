const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    middleName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    nationality: {
      type: String,
      required: true,
    },

    countryOfResidence: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    address: {
      addressLine1: {
        type: String,
        required: true,
      },

      addressLine2: String,

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },
    },

    identity: {
      documentType: {
        type: String,
        enum: ["Passport", "National ID", "Driving License"],
        required: true,
      },

      documentNumber: {
        type: String,
        required: true,
      },

      issueDate: Date,

      expiryDate: Date,

      frontImage: {
        type: String,
        required: true,
      },

      backImage: String,
    },

    selfieImage: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: String,

    adminNotes: String,

    rejectedFields: [
      {
        type: String,
      },
    ],

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },

    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

kycSchema.index({ status: 1 });
kycSchema.index({ createdAt: -1 });

kycSchema.plugin(mongoosePaginate);

const KYC = mongoose.model("KYC", kycSchema);

module.exports = { KYC };