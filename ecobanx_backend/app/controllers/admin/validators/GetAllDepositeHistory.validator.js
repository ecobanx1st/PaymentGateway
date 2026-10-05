const { z } = require("zod");

const GetAllDepositeHistoryValidator = z.object({
  address: z
    .string({ required_error: "address is required" })
    .min(1, "address is required"),
  amount: z.coerce
    .number({ required_error: "amount is required", invalid_type_error: "amount must be a number" })
    .positive("amount must be greater than 0"),
  coin: z
    .record(
      z.string().min(1),
      z.object({
        decimal: z.coerce
          .number({ invalid_type_error: "decimal must be a number" })
          .optional(),
        symbol: z.string({ invalid_type_error: "symbol must be a string" }).optional(),
      })
    )
    .optional(),
  txId: z
    .string({ required_error: "txId is required" })
    .min(1, "txId is required"),
  from: z
    .string({ required_error: "from is required" })
    .min(1, "from is required"),
  contractAddress: z
    .string({ required_error: "contractAddress is required" })
    .min(1, "contractAddress is required"),
  network: z
    .string({ required_error: "network is required" })
    .min(1, "network is required")
    .toUpperCase(),
});

module.exports = { GetAllDepositeHistoryValidator };
