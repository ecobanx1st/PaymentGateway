const { z } = require("zod");

const getTxInfoValidator = z.object({
  cmd: z.literal("get_tx_info", {
    error: "cmd must be get_tx_info",
  }),
  txid: z
    .string({ required_error: "txid is required" })
    .min(1, "txid is required"),
});

module.exports = { getTxInfoValidator };
