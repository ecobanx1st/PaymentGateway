const { z } = require("zod");

const addcommissionValidator = z.object({
    type: z
        .string({ required_error: "Type is required" })
        .trim()
        .min(1, "Type is required"),
    buyCommission: z
        .number({ required_error: "Buy commission is required" }),
    sellCommission: z
        .number({ required_error: "Sell commission is required" }),
});

module.exports = { addcommissionValidator };
