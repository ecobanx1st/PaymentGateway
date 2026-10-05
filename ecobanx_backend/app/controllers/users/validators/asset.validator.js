const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const getUserAssetsValidator = z.object({
  search: z
    .string({ invalid_type_error: "Search must be a string" })
    .optional()
    .default(""),
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

module.exports = { getUserAssetsValidator };
