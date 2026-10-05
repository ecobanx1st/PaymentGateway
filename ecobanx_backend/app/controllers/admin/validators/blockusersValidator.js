const { z } = require("zod");

const blockusersValidator = z.object({
    id: z
        .string({ required_error: "User ID is required" })
        .trim()
        .min(5, "User ID must be valid"),
});

module.exports = { blockusersValidator };