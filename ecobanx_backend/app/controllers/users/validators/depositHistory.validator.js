const { z } = require("zod");

const getDepositHistoryValidator = z.object({
  type: z
    .string({ invalid_type_error: "type must be a string" }),
  search: z.string().optional(),
  network: z.string().optional(),
  status: z.string().optional(),
  buttonType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { getDepositHistoryValidator };
