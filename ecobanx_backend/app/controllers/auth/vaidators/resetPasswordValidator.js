const { z } = require("zod");

const resetPasswordValidator = z.object({
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  otp: z
    .string({ required_error: "OTP is required", invalid_type_error: "OTP is required" })
    .trim()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits"),

  newPassword: z
    .string({ required_error: "New password is required", invalid_type_error: "New password is required" })
    .trim()
    .min(1, "New password is required")
    .min(6, "Password must be at least 6 characters"),
});

module.exports = { resetPasswordValidator };