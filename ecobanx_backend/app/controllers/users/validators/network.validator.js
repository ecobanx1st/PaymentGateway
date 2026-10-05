const { z } = require("zod");

const getUserNetworksValidator = z.object({
  search: z
    .string({ invalid_type_error: "Search must be a string" })
    .optional()
    .default(""),
});

module.exports = { getUserNetworksValidator };
