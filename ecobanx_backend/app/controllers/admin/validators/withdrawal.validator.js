const { z } = require("zod");

const getAllWithdrawalsValidator = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z.string().optional(),
  merchantId: z.string().optional(),
  assetId: z.string().optional(),
  networkId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const rejectWithdrawalValidator = z.object({
  reason: z
    .string({ required_error: "Rejection reason is required" })
    .trim()
    .min(1, "Rejection reason is required"),
});

const markAsCompletedValidator = z.object({
  blockNumber: z.number().optional(),
  gasFee: z.number().optional(),
  explorerUrl: z.string().url().optional().or(z.literal("")),
});

module.exports = {
  getAllWithdrawalsValidator,
  rejectWithdrawalValidator,
  markAsCompletedValidator,
};
