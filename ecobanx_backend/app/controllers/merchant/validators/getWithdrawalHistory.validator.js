const { z } = require("zod");

const getWithdrawalHistoryValidator = z.object({
  cmd: z.literal("get_withdrawal_history", {
    error: "cmd must be get_withdrawal_history",
  }),
  search: z.string({ invalid_type_error: "search must be a string" }).optional(),
  from: z.string({ invalid_type_error: "from must be a string" }).optional(),
  to: z.string({ invalid_type_error: "to must be a string" }).optional(),
  status: z.string({ invalid_type_error: "status must be a string" }).optional(),
  start: z.coerce
    .number({ invalid_type_error: "start must be a number" })
    .int("start must be an integer")
    .nonnegative("start must not be negative")
    .optional(),
  limit: z.coerce
    .number({ invalid_type_error: "limit must be a number" })
    .int("limit must be an integer")
    .positive("limit must be greater than 0")
    .optional(),
});

module.exports = { getWithdrawalHistoryValidator };
