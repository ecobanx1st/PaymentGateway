const { z } = require("zod");

const checkoutDepositAddressValidator = z.object({
  cmd: z.literal("get_deposit_address", {
    error: "cmd must be get_deposit_address",
  }),

  coin: z.union(
    [
      z
        .string()
        .min(1, "coin is required"),
      z.array(
        z
          .string()
          .min(1, "coin items must not be empty")
      ),
    ],
    { error: "coin is required" }
  ),

  network: z
    .string({ error: "network is required" })
    .trim()
    .min(1, "network is required"),

  txnId: z
    .string({ error: "txnId is required" })
    .trim()
    .min(1, "txnId must not be empty"),

  merchantId: z.string().optional(),

  buyerEmail: z
    .string({ error: "Buyer email is required" })
    .trim()
    .email("Invalid buyer email address")
    .transform((value) => value.toLowerCase()),

  buyerFirstname: z
    .string({ error: "Buyer first name is required" })
    .trim()
    .min(2, "Buyer first name must be at least 2 characters")
    .max(50, "Buyer first name must not exceed 50 characters")
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Buyer first name can contain only letters and spaces"
    ),

  buyerLastname: z
    .string({ error: "Buyer last name is required" })
    .trim()
    .min(2, "Buyer last name must be at least 2 characters")
    .max(50, "Buyer last name must not exceed 50 characters")
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Buyer last name can contain only letters and spaces"
    ),
});

module.exports = { checkoutDepositAddressValidator };