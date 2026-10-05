const { z } = require("zod");

const createButtonMakerValidator = z.object({
    itemName: z
        .string({
            invalid_type_error: "itemName must be a string",
            required_error: "itemName is required",
        })
        .min(1, "itemName must not be empty")
        .max(255, "itemName must not exceed 255 characters")
        .trim(),

    amountInCurrency: z
        .number({
            invalid_type_error: "amountInCurrency must be a number",
            required_error: "amountInCurrency is required",
        })
        .min(0, "amountInCurrency cannot be negative"),

    requestAmount: z
        .number({
            invalid_type_error: "requestAmount must be a number",
            required_error: "requestAmount is required",
        })
        .min(0, "requestAmount cannot be negative"),

    fiatName: z
        .string({
            invalid_type_error: "fiatName must be a string",
            required_error: "fiatName is required",
        })
        .min(1, "fiatName must not be empty")
        .trim(),

    assetSymbol: z
        .string({
            invalid_type_error: "assetSymbol must be a string",
            required_error: "assetSymbol is required",
        })
        .min(1, "assetSymbol must not be empty")
        .trim(),

    assetId: z
        .string({
            invalid_type_error: "assetId must be a string",
            required_error: "assetId is required",
        })
        .min(1, "assetId must not be empty")
        .trim(),

    NetworkName: z
        .string({
            invalid_type_error: "NetworkName must be a string",
        })
        .min(1, "NetworkName must not be empty")
        .trim()
        .optional()
        .nullable(),

    network: z
        .string({
            invalid_type_error: "network must be a string",
        })
        .min(1, "network must not be empty")
        .trim()
        .optional()
        .nullable(),

    itemDescription: z
        .string({
            invalid_type_error: "itemDescription must be a string",
        })
        .max(1000, "itemDescription must not exceed 1000 characters")
        .trim()
        .optional()
        .nullable(),

    itemNumber: z
        .string({
            invalid_type_error: "itemNumber must be a string",
        })
        .max(100, "itemNumber must not exceed 100 characters")
        .trim()
        .optional()
        .nullable(),

    invoice: z
        .string({
            invalid_type_error: "invoice must be a string",
        })
        .max(100, "invoice must not exceed 100 characters")
        .trim()
        .optional()
        .nullable(),

    itemQuantity: z
        .number({
            invalid_type_error: "itemQuantity must be a number",
        })
        .int("itemQuantity must be an integer")
        .min(1, "itemQuantity must be at least 1")
        .optional()
        .nullable(),

    editQuantity: z
        .boolean({
            invalid_type_error: "editQuantity must be a boolean",
        })
        .optional()
        .default(false),

    taxAmount: z
        .number({
            invalid_type_error: "taxAmount must be a number",
        })
        .min(0, "taxAmount cannot be negative")
        .optional()
        .nullable(),

    shippingCost: z
        .number({
            invalid_type_error: "shippingCost must be a number",
        })
        .min(0, "shippingCost cannot be negative")
        .optional()
        .nullable(),

    additionalShippingCost: z
        .number({
            invalid_type_error: "additionalShippingCost must be a number",
        })
        .min(0, "additionalShippingCost cannot be negative")
        .optional()
        .nullable(),

    successUrl: z
        .string({
            invalid_type_error: "successUrl must be a string",
            required_error: "successUrl is required",
        })
        .url("successUrl must be a valid URL")
        .trim(),

    cancelUrl: z
        .string({
            invalid_type_error: "cancelUrl must be a string",
            required_error: "cancelUrl is required",
        })
        .url("cancelUrl must be a valid URL")
        .trim(),

    ipnUrl: z
        .string({
            invalid_type_error: "ipnUrl must be a string",
            required_error: "ipnUrl is required",
        })
        .url("ipnUrl must be a valid URL")
        .trim(),

    buttonType: z
        .enum(["Simple", "Advanced"], {
            error: "buttonType must be Simple or Advanced",
        }),
});

module.exports = {
    createButtonMakerValidator,
};