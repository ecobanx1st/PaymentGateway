const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { API_KEY_PERMISSIONS, DEFAULT_API_KEY_PERMISSIONS } = require("../constants/apiKeyPermissions");

const permissionSchema = new mongoose.Schema(
  Object.fromEntries(
    API_KEY_PERMISSIONS.map((key) => [key, { type: Boolean, default: false }])
  ),
  { _id: false }
);

const merchantApiKeySchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  keyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  secretKeyEncrypted: {
    type: String,
    required: true,
  },
  permissions: {
    type: permissionSchema,
    default: () => ({ ...DEFAULT_API_KEY_PERMISSIONS }),
  },
  ipRestrictions: {
    mode: {
      type: String,
      enum: ["WHITELIST", "BLACKLIST"],
      default: "WHITELIST",
    },

    ips: {
      type: [String],
      default: [],
    },
  },
  status: {
    type: String,
    enum: ["ACTIVE", "REVOKED"],
    default: "ACTIVE",
    index: true,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  lastUsedIp: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

merchantApiKeySchema.index({ merchantId: 1, status: 1 });
merchantApiKeySchema.index({ publicKey: 1, status: 1 });

merchantApiKeySchema.plugin(mongoosePaginate);

const MerchantApiKey = mongoose.model("MerchantApiKey", merchantApiKeySchema);

module.exports = { MerchantApiKey };
