const { z } = require("zod");

const getTransferTokenReceiverHistoryValidator = z.object({

  address: z
    .string({ invalid_type_error: "address must be a string" })
    .min(1, "address must not be empty")
    .optional(),

  page: z
    .string({ invalid_type_error: "page must be a string" })
    .default("1")
    .optional(),

  limit: z
    .string({ invalid_type_error: "limit must be a string" })
    .default("10")
    .optional(),

  search: z
    .string({ invalid_type_error: "search must be a string" })
    .optional(),

  network: z
    .string({ invalid_type_error: "network must be a string" })
    .min(1, "network must not be empty")
    .toUpperCase()
    .optional(),

  startDate: z
    .string({ invalid_type_error: "startDate must be a string" })
    .optional(),

  endDate: z
    .string({ invalid_type_error: "endDate must be a string" })
    .optional(),

  type: z
    .enum(["payIn", "deposit"], {
      invalid_type_error: "type must be payIn or deposit",
      error: "type must be payIn or deposit",
    })
    .optional(),
});

module.exports = { getTransferTokenReceiverHistoryValidator };