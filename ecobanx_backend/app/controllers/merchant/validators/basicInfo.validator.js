const { z } = require("zod");

const basicInfoValidator = z.object({
  cmd: z.literal("get_basic_info", {
    error: "cmd must be get_basic_info",
  }),
});

module.exports = { basicInfoValidator };
