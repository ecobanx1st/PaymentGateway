const { z } = require("zod");

const getDepositAddressValidator = z
  .object({
    cmd: z.literal("get_deposit_address", {
      error: "cmd must be get_deposit_address",
    }),
    coin: z.union(
      [
        z
          .string({ invalid_type_error: "coin must be a string or array" })
          .min(1, "coin is required"),
        z.array(
          z
            .string({ invalid_type_error: "coin items must be strings" })
            .min(1, "coin items must not be empty")
        ),
      ],
      { required_error: "coin is required" }
    ),
    network: z
      .string({ required_error: "network is required" })
      .min(1, "network is required")
      .toUpperCase(),
    txn_id: z
      .string({ invalid_type_error: "txn_id must be a string" })
      .min(1, "txn_id must not be empty")
      .optional(),
  });

module.exports = { getDepositAddressValidator };
