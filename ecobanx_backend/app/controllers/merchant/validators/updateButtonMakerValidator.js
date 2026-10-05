const { z } = require("zod");

const updateButtonMakerValidator = z.object({
    buttonmakerId: z
        .string({
            invalid_type_error: "buttonmakerId must be a string",
        })
        .min(1, "buttonmakerId must not be empty")
        .trim(),
    network: z
        .string({
            invalid_type_error: "network must be a string",
        })
        .min(1, "network must not be empty")
        .trim(),

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
});

module.exports = {
    updateButtonMakerValidator,
};