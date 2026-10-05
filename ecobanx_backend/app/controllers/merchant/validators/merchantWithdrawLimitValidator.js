const { z } = require("zod");

const merchantWithdrawLimitValidator = z.object({
    merchantUsersDailyLimit: z
        .number({
            required_error: "merchantUsersDailyLimit is required",
            invalid_type_error:
                "merchantUsersDailyLimit must be a number",
        })
        .min(0, "merchantUsersDailyLimit cannot be negative"),

    withdrawalLimit: z
        .number({
            required_error: "withdrawalLimit is required",
            invalid_type_error:
                "withdrawalLimit must be a number",
        })
        .min(0, "withdrawalLimit cannot be negative"),
});

module.exports = {
    merchantWithdrawLimitValidator,
};