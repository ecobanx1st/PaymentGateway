const { z } = require('zod');

const verify2FAValidator = z.object({
  twoFactorCode: z
    .string({ required_error: "2FA code is required", invalid_type_error: "2FA code is required" })
    .trim()
    .min(1, "2FA code is required")
    .length(6, "2FA code must be 6 digits"),
});

module.exports = { verify2FAValidator };
