const { z } = require("zod");

const depositAddressesValidator = z.object({
  cmd: z.literal("list_deposit_addresses", {
    error: "cmd must be list_deposit_addresses",
  }),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  coin: z.string().optional(),
  network: z.string().optional(),
  address: z.string().optional(),
  addressIndex: z.coerce.number().int().optional(),
});

module.exports = { depositAddressesValidator };
