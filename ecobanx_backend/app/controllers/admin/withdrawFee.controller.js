const withdrawLimitSchema = require("../../models/withdrawLimit");

const updateWithdrawLimit = async (req, reply) => {
    try {
        const { withdrawalFee } = req.body;

        const feeConfig = await withdrawLimitSchema.findOneAndUpdate(
            {},
            { withdrawalFee },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).select("-_id -__v");

        return reply.code(200).send({
            success: true,
            message: "Withdrawal fee saved successfully.",
            data: feeConfig,
        });
    } catch (error) {
        console.error("Save/Update withdrawal fee error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal server error.",
        });
    }
};

const getWithdrawLimit = async (req, reply) => {
    try {
        const withdrawFee = await withdrawLimitSchema.findOne().select("-_id -__v");
        if (!withdrawFee) {
            return reply.code(404).send({ success: false, message: "Withdrawal fee not found" });
        }
        return reply.code(200).send({ success: true, message: "Withdrawal fee fetched successfully", result: withdrawFee });
    } catch (error) {
        console.error("Get withdrawal fee error:", error);
        return reply.code(500).send({ success: false, message: "Internal server error" });
    }
};

module.exports = { updateWithdrawLimit, getWithdrawLimit };