const { z } = require("zod");

const getBalancesValidator = z.object({
  coin: z
    .string({ invalid_type_error: "coin must be a string" })
    .min(1, "coin must not be empty")
    .toUpperCase()
    .optional(),
});

module.exports = { getBalancesValidator };
