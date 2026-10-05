const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const merchantSettingsSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,
    index: true,
  },

  ipnSecret: {
    type: String,
    required: true,
  },
  ipnUrl: {
    type: String,
  },
  depositCoin: {
    type: String,
  },
  logEmail: {
    type: String,
  },
  newpayment: {
    type: Boolean,
  },
  fundreceive: {
    type: Boolean,
  },
  fundsend: {
    type: Boolean,
  },
  depositreceived: {
    type: Boolean,
  },
}, { timestamps: true });

merchantSettingsSchema.plugin(mongoosePaginate);

const MerchantSettings = mongoose.model("MerchantSettings", merchantSettingsSchema);

module.exports = { MerchantSettings };
