const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const beneficialOwnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    dateOfBirth: Date,

    nationality: String,

    ownershipPercentage: Number,

    documentType: String,

    beneficialOwnerDocumentImage: String,
  },
  { _id: false }
);

const kybSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    legalBusinessName: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
    },

    taxId: String,

    companyType: {
      type: String,
      enum: [
        "Private Limited",
        "Public Limited",
        "LLC",
        "Partnership",
        "Sole Proprietorship",
        "NGO",
        "Government",
        "Other",
      ],
      required: true,
    },

    industry: {
      type: String,
      required: true,
    },

    incorporationDate: {
      type: Date,
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

    businessEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    businessPhone: String,

    website: String,

    documents: {
      incorporationCertificate: {
        type: String,
        required: true,
      },

      taxCertificate: String,

      addressProof: String,
    },

    beneficialOwners: [beneficialOwnerSchema],

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: String,

    adminNotes: String,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admins",
    },

    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
kybSchema.index({ status: 1 });
kybSchema.index({ createdAt: -1 });

// Pagination plugin
kybSchema.plugin(mongoosePaginate);

const KYB = mongoose.model("KYB", kybSchema);

module.exports = { KYB };