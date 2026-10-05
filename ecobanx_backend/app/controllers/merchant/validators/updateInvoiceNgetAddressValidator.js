const { z } = require("zod");

const updateInvoiceNgetAddressValidator = z.object({
    invoiceId: z
        .string({
            invalid_type_error: "invoiceId must be a string",
        })
        .min(1, "invoiceId must not be empty")
        .trim()
        .optional(),
    buttonmakerId: z.string().min(1).trim().optional(),
    transactionId: z.string().min(1).trim().optional(),
    txnId: z.string().min(1).trim().optional(),
    txn_id: z.string().min(1).trim().optional(),

    firstname: z
        .string({
            invalid_type_error: "firstname must be a string",
        })
        .min(1, "firstname must not be empty")
        .trim()
        .optional(),

    lastname: z
        .string({
            invalid_type_error: "lastname must be a string",
        })
        .min(1, "lastname must not be empty")
        .trim()
        .optional(),

    email: z
        .string({
            invalid_type_error: "email must be a string",
        })
        .email("Invalid email address")
        .trim()
        .toLowerCase()
        .optional(),
    buyer_firstname: z.string().min(1).trim().optional(),
    buyer_lastname: z.string().min(1).trim().optional(),
    buyer_email: z.string().email("Invalid buyer email address").trim().toLowerCase().optional(),
}).refine(
    (v) => Boolean(v.invoiceId || v.buttonmakerId || v.transactionId || v.txnId || v.txn_id),
    { message: "invoiceId is required", path: ["invoiceId"] }
);

module.exports = {
    updateInvoiceNgetAddressValidator,
};