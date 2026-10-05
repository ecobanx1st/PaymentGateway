const { z } = require("zod");

const deletecommissionValidator = z.object({
    commissionId: z
        .string({ required_error: "Commission ID is required" })
        .trim()
        .min(1, "Commission ID is required"),
});

module.exports = { deletecommissionValidator };
