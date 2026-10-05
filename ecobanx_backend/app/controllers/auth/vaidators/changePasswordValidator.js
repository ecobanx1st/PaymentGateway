const { z } = require("zod");

const changePasswordValidator = z
  .object({
    oldPassword: z
      .string({ required_error: "Old password is required", invalid_type_error: "Old password is required" })
      .trim()
      .min(1, "Old password is required"),

    newPassword: z
      .string({ required_error: "New password is required", invalid_type_error: "New password is required" })
      .trim()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password must not exceed 100 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New password must contain at least one special character"),

    confirmPassword: z
      .string({ required_error: "Confirm password is required", invalid_type_error: "Confirm password is required" })
      .trim()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });

module.exports = { changePasswordValidator };
