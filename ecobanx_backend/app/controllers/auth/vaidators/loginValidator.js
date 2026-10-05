const { z } = require("zod");

const loginValidator = z.object({

  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password is required" })
    .trim()
    .min(1, "Password is required"),


  otp: z
    .string({ required_error: "Otp is required", invalid_type_error: "Otp is required" })
    .trim()
    .min(1, "Otp is required")
    .optional(),

})

module.exports = { loginValidator };