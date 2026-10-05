const { z } = require("zod");

const currencyCode = (label) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z
      .string({ error: `${label} is required` })
      .regex(/^[A-Z0-9]{2,10}$/, `${label} must be a valid currency code`)
  );

const priceConvertValidator = z.object({
  amount: z.preprocess(
    (v) => (typeof v === "number" ? String(v) : v),
    z
      .string({ error: "amount is required" })
      .trim()
      .regex(/^\d+(\.\d+)?$/, "amount must be a positive decimal number")
      .refine((v) => /[1-9]/.test(v.replace(".", "")), "amount must be greater than 0")
  ),
  currency1: currencyCode("currency1"),
  currency2: currencyCode("currency2"),
});

module.exports = { priceConvertValidator };
