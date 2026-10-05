const { z } = require("zod");

const getAuthorizedTokenValidator = z
  .object({
    publickey: z
      .string({ invalid_type_error: "publickey must be a string" })
      .min(1, "publickey is required")
      .optional(),
    privatekey: z
      .string({ invalid_type_error: "privatekey must be a string" })
      .min(1, "privatekey is required")
      .optional(),
    txn_id: z
      .string({ invalid_type_error: "txn_id must be a string" })
      .min(1, "txn_id is required")
      .optional(),
  })
  .refine((data) => (data.publickey && data.privatekey) || data.txn_id, {
    message: "Provide publickey+privatekey ",
    path: ["publickey"],
  });

module.exports = { getAuthorizedTokenValidator };