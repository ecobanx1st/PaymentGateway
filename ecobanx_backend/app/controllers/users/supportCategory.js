const { SupportTicketCategory } = require("../../models/supportTicketCategoryModel");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");

const supportCategory = async (req, reply) => {
    try {
        const { search } = req.query || {};
        const filter = { isActive: true };

        if (search && String(search).trim()) {
            filter.name = {
                $regex: escapeRegex(String(search).trim()),
                $options: "i",
            };
        }

        const categories = await SupportTicketCategory.find(filter).sort({ createdAt: -1 });

        return reply.code(200).send({
            success: true,
            message: "Support ticket categories fetched successfully.",
            data: categories,
        });
    } catch (error) {
        console.error("Support Category Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Something went wrong while fetching support ticket categories.",
            error: error.message,
        });
    }
};

module.exports = { supportCategory };