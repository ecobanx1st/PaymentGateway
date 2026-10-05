const { z } = require("zod");

const getTxInfoMultiValidator = z.object({
  cmd: z.literal("get_tx_info_multi", {
    error: "cmd must be get_tx_info_multi",
  }),
  search: z.string({ invalid_type_error: "search must be a string" }).optional(),
  from: z.string({ invalid_type_error: "from must be a string" }).optional(),
  to: z.string({ invalid_type_error: "to must be a string" }).optional(),
  page: z.coerce
    .number({ invalid_type_error: "page must be a number" })
    .int("page must be an integer")
    .positive("page must be greater than 0")
    .optional(),
  limit: z.coerce
    .number({ invalid_type_error: "limit must be a number" })
    .int("limit must be an integer")
    .positive("limit must be greater than 0")
    .optional(),
});

module.exports = { getTxInfoMultiValidator };
