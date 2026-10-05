const { z } = require("zod");

const getWithdrawalInfoValidator = z.object({
  cmd: z.literal("get_withdrawal_info", {
    error: "cmd must be get_withdrawal_info",
  }),
  withdrawal_Id: z
    .string({ required_error: "withdrawal_Id is required" })
    .min(1, "withdrawal_Id is required"),
});

module.exports = { getWithdrawalInfoValidator };
