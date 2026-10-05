const { z } = require("zod");

const createWalletAddressValidator = z.object({
  assetSymbol: z
    .string({ required_error: "Asset symbol is required" })
    .min(1, "Asset symbol is required")
    .toUpperCase(),
  networkSymbol: z
    .string({ required_error: "Network symbol is required" })
    .min(1, "Network symbol is required")
    .toUpperCase(),
});

module.exports = { createWalletAddressValidator };
