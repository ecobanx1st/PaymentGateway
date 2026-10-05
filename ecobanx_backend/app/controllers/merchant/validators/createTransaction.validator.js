const { z } = require("zod");

// Plain decimal (no sign, no exponent). Sign/exponent handled by normalizeAmount.
const DECIMAL_REGEX = /^\d+(\.\d+)?$/;

// Max 24 significant digits overall, max 12 fractional digits for the
// original pricing amount. Keeps values exact and DB-safe.
const MAX_SIGNIFICANT_DIGITS = 24;
const MAX_FRACTION_DIGITS = 12;

// Converts string/number input into a plain decimal string without any
// floating-point arithmetic (expands JS exponent notation digit-by-digit).
const normalizeAmount = (value) => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    value = String(value);
  }
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const expMatch = /^(\d)(?:\.(\d+))?[eE]([+-]?\d+)$/.exec(trimmed);
  if (expMatch) {
    const digits = expMatch[1] + (expMatch[2] || "");
    const pointIndex = 1 + Number(expMatch[3]);
    if (pointIndex <= 0) {
      return "0." + "0".repeat(-pointIndex) + digits;
    }
    if (pointIndex >= digits.length) {
      return digits + "0".repeat(pointIndex - digits.length);
    }
    return digits.slice(0, pointIndex) + "." + digits.slice(pointIndex);
  }

  return trimmed;
};

const hasNonZeroDigit = (value) => /[1-9]/.test(value.replace(".", ""));

const amountSchema = z.preprocess(
  normalizeAmount,
  z
    .string({ error: "amount is required" })
    .regex(DECIMAL_REGEX, "amount must be a positive decimal number")
    .refine(hasNonZeroDigit, "amount must be greater than 0")
    .refine((v) => v.replace(".", "").length <= MAX_SIGNIFICANT_DIGITS, "amount has too many digits")
    .refine(
      (v) => (v.split(".")[1] || "").length <= MAX_FRACTION_DIGITS,
      "amount supports at most 12 decimal places"
    )
);

const currencySchema = (label) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z
      .string({ error: `${label} is required` })
      .regex(/^[A-Z0-9]{2,10}$/, `${label} must be a valid currency code`)
  );

// Network symbols are stored uppercase in the Network collection, so the
// client value is normalized to uppercase before the enum check ("coin" -> "COIN").
const networkSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
  z.string({
    error: "network must be a string",
  }).min(1, {
    error: "network cannot be empty",
  })
);

const requiredString = (label, max = 256) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} must not be empty`)
    .max(max, `${label} must not exceed ${max} characters`);

const optionalString = (label, max = 512) =>
  z.preprocess(
    // Empty string means "not provided" (button HTML always sends every field).
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string({ error: `${label} must be a string` })
      .trim()
      .min(1, `${label} must not be empty`)
      .max(max, `${label} must not exceed ${max} characters`)
      .optional()
  );

  const optionalNumber = (label, max = 512) =>
  z.preprocess(
    // Empty string means "not provided" (button HTML always sends every field).
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string({ error: `${label} must be a string` })
      .trim()
      .min(1, `${label} must not be empty`)
      .max(max, `${label} must not exceed ${max} characters`)
      .optional()
  );

const httpUrlSchema = (label) =>
  z.preprocess(
    // Empty string means "not provided" (button HTML always sends every field).
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string({ error: `${label} is required` })
      .trim()
      .min(1, `${label} must not be empty`)
      .url(`${label} must be a valid URL`)
      .refine((v) => /^https?:\/\//i.test(v), `${label} must use http or https`)
      .optional()
  );

const createTransactionValidator = z.object({
  cmd: z.literal("create_transaction", { error: "cmd must be create_transaction" }),

  // Original merchant price in currency1 (fixed-price payment)
  amount: amountSchema,

  currency1: currencySchema("currency1"),

  // Crypto currency + network the buyer will actually pay with
  currency2: currencySchema("currency2"),
  network: networkSchema,

  buyer_email: z
    .string({ error: "buyer_email is required" })
    .trim()
    .min(1, "buyer_email must not be empty")
    .max(254, "buyer_email must not exceed 254 characters")
    .email("Invalid buyer email address"),
  buyer_firstname: requiredString("buyer_firstname", 128),
  buyer_lastname: requiredString("buyer_lastname", 128),

  ipn_url: z
    .string({ error: "ipn_url is required" })
    .trim()
    .min(1, "ipn_url must not be empty")
    .url("ipn_url must be a valid URL")
    .refine((v) => /^https?:\/\//i.test(v), "ipn_url must use http or https"),

  // Optional fields
  full_name: optionalString("full_name", 256),
  buyer_name: optionalString("buyer_name", 256),
  address: optionalString("address", 128),
  item_name: optionalString("item_name"),
  item_number: optionalString("item_number"),
  item_description: optionalString("item_description"),
  invoice: optionalString("invoice"),
  custom: optionalString("custom"),
  success_url: httpUrlSchema("success_url"),
  cancel_url: httpUrlSchema("cancel_url"),
  buttonType: z.enum(["simple", "advanced"], {
    error: "buttonType must be simple or advanced",
  })
  .optional(),
  itemDescription: optionalString("itemDescription"),
  itemNumber: optionalString("itemNumber"),
  item_quantity: optionalNumber("item_quantity"),
  tax_amount: optionalNumber("tax_amount"),
  shipping_cost: optionalNumber("shipping_cost"),
});

const createInvoiceTransactionValidator = z.object({
  cmd: z.literal("create_transaction", { error: "cmd must be create_transaction" }).optional(),
  amount: amountSchema,
  currency1: currencySchema("currency1"),
  currency2: currencySchema("currency2"),
  network: networkSchema,
  buyer_email: z
    .string({ error: "buyer_email must be a string" })
    .trim()
    .max(254, "buyer_email must not exceed 254 characters")
    .email("Invalid buyer email address")
    .optional(),
  buyer_firstname: optionalString("buyer_firstname", 128),
  buyer_lastname: optionalString("buyer_lastname", 128),
  ipn_url: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z
        .string()
        .trim()
        .url("ipn_url must be a valid URL")
        .refine((v) => /^https?:\/\//i.test(v), "ipn_url must use http or https")
        .optional()
    ),
  full_name: optionalString("full_name", 256),
  buyer_name: optionalString("buyer_name", 256),
  address: optionalString("address", 128),
  item_name: optionalString("item_name"),
  item_number: optionalString("item_number"),
  item_description: optionalString("item_description"),
  invoice: optionalString("invoice"),
  custom: optionalString("custom"),
  success_url: httpUrlSchema("success_url"),
  cancel_url: httpUrlSchema("cancel_url"),
  buttonType: z.enum(["simple", "advanced"], {
    error: "buttonType must be simple or advanced",
  })
  .optional(),
  itemDescription: optionalString("itemDescription"),
  itemNumber: optionalString("itemNumber"),
  item_quantity: optionalNumber("item_quantity"),
  tax_amount: optionalNumber("tax_amount"),
  shipping_cost: optionalNumber("shipping_cost"),
  requestAmount: optionalNumber("requestAmount"),
  requestCurrency: optionalString("requestCurrency"),
  requestDescription: optionalString("requestDescription"),
  taxAmount: optionalNumber("taxAmount"),
  shippingCost: optionalNumber("shippingCost"),
});

module.exports = { createTransactionValidator, createInvoiceTransactionValidator };
