const { z } = require("zod");

const adminLoginValidator = z.object({
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password is required" })
    .trim()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),


    twoFactorCode: z
    .string()
    .trim()
    .length(6, "2FA code must be 6 digits")
    .optional(),
});




module.exports = {
  adminLoginValidator,
};
