const { z } = require("zod");

const validate2FALoginValidator = z.object({
    userId: z
        .string({ required_error: "User ID is required", invalid_type_error: "User ID is required" })
        .trim()
        .min(1, "User ID is required"),

    token: z
        .string({ required_error: "2FA token is required", invalid_type_error: "2FA token is required" })
        .trim()
        .min(1, "2FA token is required")
        .length(6, "2FA token must be exactly 6 digits")
        .regex(/^\d{6}$/, "2FA token must contain only numbers"),
});

module.exports = { validate2FALoginValidator };
