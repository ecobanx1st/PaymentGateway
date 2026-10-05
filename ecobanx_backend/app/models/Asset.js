const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const assetSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    assetSymbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    networks: [
      {
        _id: false,
        networkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Network",
          required: true,
        },
        contractAddress: {
          type: String,
          trim: true,
          default: null,
        },
        withdrawFee: {
          type: Number,
          default: 0,
        },
        minWithdrawAmount: {
          type: Number,
          default: 0,
        },
        maxWithdrawAmount: {
          type: Number,
          default: 0,
        },
        minDepositAmount: {
          type: Number,
          default: 0,
        },
        maxDepositAmount: {
          type: Number,
          default: 0,
        },
        decimal: {
          type: Number,
          default: 18,
        },
      },
    ],
    image: {
      type: String
    },
    depositStatus: {
      type: Boolean,
      default: true,
    },
    withdrawStatus: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

assetSchema.plugin(mongoosePaginate);

assetSchema.index({ assetName: 1, assetSymbol: 1, "networks.networkId": 1 });

const Asset = mongoose.model("Asset", assetSchema);

module.exports = { Asset };
