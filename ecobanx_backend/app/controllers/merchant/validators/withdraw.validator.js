const { z } = require("zod");

const requestWithdrawValidator = z.object({
  assetSymbol: z
    .string({ required_error: "Asset symbol is required" })
    .min(1, "Asset symbol is required")
    .toUpperCase(),
  networkSymbol: z
    .string({ required_error: "Network symbol is required" })
    .min(1, "Network symbol is required")
    .toUpperCase(),
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" }),
  // .min(0.01, "Amount must be at least 0.01")

  receiverAddress: z
    .string({ required_error: "Receiver address is required" })
    .min(1, "Receiver address is required"),
  withdraw2faCode: z
    .string({ required_error: "2FA code is required" })
    .regex(/^\d{6}$/, "2FA code must be a 6-digit number"),
});

module.exports = { requestWithdrawValidator };
