const { z } = require("zod");

const forgotPasswordValidator = z.object({
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

module.exports = { forgotPasswordValidator };