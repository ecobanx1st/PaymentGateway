const mongoose = require("mongoose");
const { commission } = require("../../models/commissionModel");

const updateCommission = async (req, reply) => {
  try {
    const { commissionId, type, buyCommission, sellCommission } = req.validatedData || {};

    if (!mongoose.Types.ObjectId.isValid(commissionId)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid commissionId",
        result: null,
      });
    }

    const updatedCommission = await commission.findByIdAndUpdate(
      commissionId,
      { type, buyCommission, sellCommission },
      { new: true, runValidators: true }
    );

    if (!updatedCommission) {
      return reply.code(404).send({
        success: false,
        message: "Commission not found",
        result: null,
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Commission updated successfully",
      data: updatedCommission,
    });
  } catch (error) {
    console.error("updateCommission Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Something Went Wrong",
      result: null,
    });
  }
};

module.exports = { updateCommission };
