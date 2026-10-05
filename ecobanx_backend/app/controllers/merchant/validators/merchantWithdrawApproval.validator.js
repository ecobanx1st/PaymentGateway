const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const merchantWithdrawApprovalValidator = z
  .object({
    withdrawalId: z
      .string({
        required_error: "withdrawalId is required",
        invalid_type_error: "withdrawalId must be a string",
      })
      .trim()
      .min(1, "withdrawalId is required")
      .regex(objectIdRegex, "withdrawalId must be a valid transaction id"),
    action: z.enum(["approve", "reject"], {
      required_error: "action is required",
      invalid_type_error: "action must be approve or reject",
    }),
    reason: z
      .string({ invalid_type_error: "reason must be a string" })
      .trim()
      .min(1, "reason is required")
      .max(500, "reason must not exceed 500 characters")
      .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), {
        message: "reason contains invalid characters",
      })
      .optional(),
  })
  .refine(
    (data) => data.action !== "reject" || (data.reason && data.reason.length > 0),
    {
      message: "reason is required when action is reject",
      path: ["reason"],
    }
  );

module.exports = { merchantWithdrawApprovalValidator };

const rejectMerchantWithdrawalValidator = z
  .object({
    reason: z
      .string({
        required_error: "reason is required",
        invalid_type_error: "reason must be a string",
      })
      .trim()
      .min(1, "reason is required")
      .max(500, "reason must not exceed 500 characters")
      .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), {
        message: "reason contains invalid characters",
      }),
  });

module.exports = { merchantWithdrawApprovalValidator, rejectMerchantWithdrawalValidator };