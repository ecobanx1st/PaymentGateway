const { z } = require("zod");

const generateQrCodeValidator = z.object({
  cmd: z.literal("generate_qr_code", {
    error: "cmd must be generate_qr_code",
  }),

  asset: z
    .string({ required_error: "asset is required" })
    .min(1, "asset is required"),

  network: z
    .string({ required_error: "network is required" })
    .min(1, "network is required"),
});

module.exports = { generateQrCodeValidator };