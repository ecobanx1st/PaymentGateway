const { z } = require("zod");

const balancesValidator = z.object({
  cmd: z.literal("get_balances", {
    error: "cmd must be get_balances",
  }),
  coin: z
    .string({ invalid_type_error: "coin must be a string" })
    .min(1, "coin must not be empty")
    .toUpperCase()
    .optional(),
});

module.exports = { balancesValidator };
