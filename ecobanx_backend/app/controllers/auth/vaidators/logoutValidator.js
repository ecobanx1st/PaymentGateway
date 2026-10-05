const { z } = require("zod");

const logoutValidator = z.object({
    unique_id: z
        .string({ required_error: "Session ID is required" })
        .trim()
        .min(1, "Session ID is required"),
});

module.exports = { logoutValidator };
