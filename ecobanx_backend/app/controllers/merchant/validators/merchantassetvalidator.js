const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const merchantassetvalidator = z.object({
    assetSymbol: z
        .string({ invalid_type_error: "Asset symbol must be a string" })
        .trim()
        .optional(),

    networkId: z
        .string({ invalid_type_error: "Network ID must be a string" })
        .regex(objectIdRegex, "Invalid Network ID")
        .optional(),

    depositStatus: z
        .string({ invalid_type_error: "Deposit status must be a string" })
        .optional(),

    withdrawStatus: z
        .string({ invalid_type_error: "Withdraw status must be a string" })
        .optional(),
});

module.exports = { merchantassetvalidator };
