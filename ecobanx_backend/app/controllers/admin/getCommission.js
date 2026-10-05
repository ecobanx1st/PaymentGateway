const { commission } = require('../../models/commissionModel');

const getCommission = async (req, reply) => {
    try {
        const commissions = await commission.find({});
        return reply.status(200).send({ success: true, message: "Commissions retrieved successfully", data: commissions });
    } catch (error) {
        console.error("Error retrieving commissions:", error);
        return reply.status(500).send({ success: false, message: "Internal server error", result: null });
    }
};

module.exports = { getCommission };