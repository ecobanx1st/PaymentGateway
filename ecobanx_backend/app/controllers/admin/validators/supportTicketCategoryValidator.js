const { z } = require("zod");

const createCategoryValidator = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),
  isActive: z.boolean().optional().default(true),
});

const updateCategoryValidator = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createCategoryValidator, updateCategoryValidator };
