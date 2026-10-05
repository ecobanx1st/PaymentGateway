const { z } = require("zod");

const digitsOnlyRegex = /^\d+$/;

const getAllKybValidator = z.object({
  page: z
    .string({ invalid_type_error: "Page must be a string" })
    .regex(digitsOnlyRegex, "Page must be a positive number")
    .optional()
    .default("1"),

  limit: z
    .string({ invalid_type_error: "Limit must be a string" })
    .regex(digitsOnlyRegex, "Limit must be a positive number")
    .optional()
    .default("10"),

  search: z
    .string({ invalid_type_error: "Search must be a string" })
    .optional()
    .default(""),

  status: z
    .enum([
      "all",
      "Pending",
      "Submitted",
      "Approved",
      "Rejected",
    ])
    .optional()
    .default("all"),

  fromDate: z
    .string({ invalid_type_error: "From date must be a string" })
    .optional(),

  toDate: z
    .string({ invalid_type_error: "To date must be a string" })
    .optional(),
});
const rejectKybValidator = z.object({
  rejectionReason: z
    .string({ required_error: "Rejection reason is required" })
    .trim()
    .min(1, "Rejection reason is required"),
  adminNotes: z.string().trim().optional(),

});

module.exports = {
  getAllKybValidator,
  rejectKybValidator,
};
