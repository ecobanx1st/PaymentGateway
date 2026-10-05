const { z } = require("zod");

const updateAdminDetailsValidator = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional(),
  country: z
    .string()
    .trim()
    .max(100, "Country cannot exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .max(20, "Phone cannot exceed 20 characters")
    .optional(),
  profile_picture: z
    .string()
    .trim()
    .optional(),
});

module.exports = { updateAdminDetailsValidator };
