const { commission } = require('../../models/commissionModel');




const addCommission = async (req, reply) => {
    try {
        const { type, buyCommission, sellCommission } = req.validatedData || {};

        if (!type || buyCommission === undefined || sellCommission === undefined) {
            return reply.status(400).send({
                success: false,
                message: "type, buyCommission and sellCommission are required",
                result: null
            });
        }

        const newCommission = new commission({
            type,
            buyCommission,
            sellCommission,
        });

        await newCommission.save();

        return reply.status(201).send({ success: true, message: "Commission added successfully", data: newCommission });
    } catch (error) {
        console.error("Error adding commission:", error);
        return reply.status(500).send({ success: false, message: "Internal server error", result: null });
    }
};

module.exports = { addCommission }; 
