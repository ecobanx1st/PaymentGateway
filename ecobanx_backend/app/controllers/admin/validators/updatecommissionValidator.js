const { z } = require("zod");

const updatecommissionValidator = z.object({
    commissionId: z
        .string({ required_error: "Commission ID is required" })
        .trim()
        .min(1, "Commission ID is required"),
    type: z
        .string()
        .trim()
        .optional(),
    buyCommission: z
        .number()
        .optional(),
    sellCommission: z
        .number()
        .optional(),
});

module.exports = { updatecommissionValidator };
