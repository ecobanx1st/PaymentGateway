const mongoose = require("mongoose");
const { commission } = require("../../models/commissionModel");

const deleteCommission = async (req, reply) => {
  try {
    const { commissionId } = req.validatedData || {};

    if (!mongoose.Types.ObjectId.isValid(commissionId)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid commissionId",
        result: null,
      });
    }

    const deletedCommission = await commission.findByIdAndDelete(commissionId);

    if (!deletedCommission) {
      return reply.code(404).send({
        success: false,
        message: "Commission not found",
        result: null,
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Commission deleted successfully",
      result: deletedCommission,
    });
  } catch (error) {
    console.error("deleteCommission Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Something Went Wrong",
      result: null,
    });
  }
};

module.exports = { deleteCommission };
