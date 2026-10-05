const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const supportTicketCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pagination plugin
supportTicketCategorySchema.plugin(mongoosePaginate);

const SupportTicketCategory = mongoose.model(
  "SupportTicketCategory",
  supportTicketCategorySchema
);

module.exports = { SupportTicketCategory };