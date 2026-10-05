const { z } = require('zod');

const disable2FAValidator = z.object({
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password is required" })
    .trim()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

module.exports = { disable2FAValidator };
