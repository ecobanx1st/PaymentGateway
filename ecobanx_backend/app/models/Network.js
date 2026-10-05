const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const networkSchema = new mongoose.Schema(
  {
    networkName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    networkSymbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    chainId: {
      type: String,
      trim: true,
    },
    rpcUrl: {
      type: String,
      // required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true
      // enum: ["EVM", "SOL", "XRP", "TRON", "BTC", ""],
    },
    status: {
      type: Boolean,
      default: true,
    },
    depositEnabled: {
      type: Boolean,
      default: true,
    },
    withdrawEnabled: {
      type: Boolean,
      default: true,
    },
    withdrawFee: {
      type: Number,
      default: 0,
    },
    explorerUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

networkSchema.plugin(mongoosePaginate);

const Network = mongoose.model("Network", networkSchema);

module.exports = { Network };
