const { z } = require("zod");

const confirmTransactionValidator = z.object({
  cmd: z.literal("confirm_transaction", {
    error: "cmd must be confirm_transaction",
  }),
  txn_id: z
    .string({ required_error: "txn_id is required" })
    .min(1, "txn_id is required"),
  received_amount: z
    .number({ invalid_type_error: "received_amount must be a number" })
    .nonnegative("received_amount must not be negative")
    .optional(),
  merchant_id: z
    .string({ invalid_type_error: "merchant_id must be a string" })
    .min(1, "merchant_id must not be empty")
    .optional(),
});

module.exports = { confirmTransactionValidator };
