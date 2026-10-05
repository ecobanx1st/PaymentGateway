const { z } = require("zod");

const usersDepositValidator = z.object({
  buyerEmail: z
    .string({ required_error: "buyerEmail is required" })
    .trim()
    .min(1, "buyerEmail is required")
    .email("Invalid buyer email address")
    .transform((value) => value.toLowerCase()),
  coin: z
    .string({ required_error: "coin is required" })
    .trim()
    .min(1, "coin is required")
    .toUpperCase(),
  network: z
    .string({ required_error: "network is required" })
    .trim()
    .min(1, "network is required")
    .toUpperCase(),
  amount: z.coerce
    .number({
      required_error: "amount is required",
      invalid_type_error: "amount must be a number",
    })
    .finite("amount must be a finite number")
    .positive("amount must be greater than 0"),
  address: z
    .string({ required_error: "address is required" })
    .trim()
    .min(1, "address is required"),
  txHash: z
    .string({ required_error: "txHash is required" })
    .trim()
    .min(1, "txHash is required"),
  from: z
    .string({ required_error: "from is required" })
    .trim()
    .min(1, "from is required"),
  contractAddress: z
    .string({ invalid_type_error: "contractAddress must be a string" })
    .trim()
    .optional(),
});

module.exports = { usersDepositValidator };