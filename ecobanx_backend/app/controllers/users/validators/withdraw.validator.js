const { z } = require("zod");

const withdrawValidator = z.object({
  assetSymbol: z
    .string({ required_error: "Asset symbol is required" })
    .min(1, "Asset symbol is required")
    .toUpperCase(),
  networkSymbol: z
    .string({ required_error: "Network symbol is required" })
    .min(1, "Network symbol is required")
    .toUpperCase(),
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  toAddress: z
    .string({ required_error: "Destination address is required" })
    .min(1, "Destination address is required")
    .optional(),
  receiverAddress: z
    .string()
    .min(1, "Receiver address is required")
    .optional(),
}).refine(
  (data) => data.toAddress || data.receiverAddress,
  { message: "Either toAddress or receiverAddress is required" }
);

module.exports = { withdrawValidator };
