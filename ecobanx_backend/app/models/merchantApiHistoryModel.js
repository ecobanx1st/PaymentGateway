const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const merchantApiHistorySchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MerchantApiKey",
    default: null,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  responseStatus: {
    type: Number,
    default: null,
  },
  success: {
    type: Boolean,
    default: null,
  },
  message: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
}, { timestamps: true });

merchantApiHistorySchema.index({ merchantId: 1, createdAt: -1 });
merchantApiHistorySchema.index({ createdAt: -1 });

merchantApiHistorySchema.plugin(mongoosePaginate);

const MerchantApiHistory = mongoose.model("MerchantApiHistory", merchantApiHistorySchema);

module.exports = { MerchantApiHistory };
