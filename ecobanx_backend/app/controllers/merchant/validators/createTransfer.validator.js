const { z } = require("zod");

const createTransferValidator = z.object({
  cmd: z.literal("create_transfer", {
    error: "cmd must be create_transfer",
  }),
  amount: z.coerce
    .number({ required_error: "amount is required", invalid_type_error: "amount must be a number" })
    .positive("amount must be greater than 0"),
  currency: z
    .string({ required_error: "currency is required" })
    .min(1, "currency is required")
    .toUpperCase(),
  network: z
    .string({ required_error: "network is required" })
    .min(1, "network is required")
    .toUpperCase(),
  merchant: z.string({ invalid_type_error: "merchant must be a string" }).optional(),
  toaddress: z.string({ invalid_type_error: "toaddress must be a string" }).optional(),
  auto_confirm: z
    .union([z.number(), z.string()], { invalid_type_error: "auto_confirm must be a number or string" })
    .optional(),
  ipn_url: z.string({ invalid_type_error: "ipn_url must be a string" }).optional(),
});

module.exports = { createTransferValidator };
