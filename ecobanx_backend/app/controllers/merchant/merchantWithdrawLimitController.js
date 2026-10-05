const MerchantWithDrawLimit = require("../../models/merchantWithDrawLimit");

const merchantWithdrawLimit = async (req, reply) => {
    try {
        // ==========================================
        // MERCHANT AUTHENTICATION
        // ==========================================
        const merchantId =
            req.user?.merchantId || req.user?._id;

        if (!merchantId) {
            return reply.code(401).send({
                success: false,
                message: "Merchant authentication required.",
            });
        }

        const body = req.validatedData || req.body || {};

        const hasPayload =
            Object.keys(body).length > 0;

        // ==========================================
        // GET
        // POST WITH EMPTY BODY
        // ==========================================
        if (!hasPayload) {
            const settings =
                await MerchantWithDrawLimit.findOne({
                    merchantId,
                }).lean();

            if (!settings) {
                return reply.code(404).send({
                    success: false,
                    message:
                        "Merchant withdrawal limit is not configured.",
                });
            }

            return reply.code(200).send({
                success: true,
                message:
                    "Merchant withdrawal limit fetched successfully.",
                result: settings,
            });
        }

        // ==========================================
        // UPDATE / CREATE
        // ==========================================
        const {
            merchantUsersDailyLimit,
            withdrawalLimit,
        } = body;

        // ==========================================
        // NUMBER VALIDATION
        // ==========================================
        if (
            typeof merchantUsersDailyLimit !== "number" ||
            typeof withdrawalLimit !== "number"
        ) {
            return reply.code(400).send({
                success: false,
                message:
                    "merchantUsersDailyLimit and withdrawalLimit must be numbers.",
            });
        }

        // ==========================================
        // FINITE NUMBER CHECK
        // ==========================================
        if (
            !Number.isFinite(merchantUsersDailyLimit) ||
            !Number.isFinite(withdrawalLimit)
        ) {
            return reply.code(400).send({
                success: false,
                message:
                    "Withdrawal limits must be valid numbers.",
            });
        }

        // ==========================================
        // NEGATIVE VALUE CHECK
        // ==========================================
        if (
            merchantUsersDailyLimit < 0 ||
            withdrawalLimit < 0
        ) {
            return reply.code(400).send({
                success: false,
                message:
                    "Withdrawal limits cannot be negative.",
            });
        }

        // ==========================================
        // CREATE / UPDATE
        // ==========================================
        const settings =
            await MerchantWithDrawLimit.findOneAndUpdate(
                {
                    merchantId,
                },
                {
                    $set: {
                        merchantUsersDailyLimit,
                        withdrawalLimit,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            ).lean();

        // ==========================================
        // SUCCESS
        // ==========================================
        return reply.code(200).send({
            success: true,
            message:
                "Merchant withdrawal limit updated successfully.",
            result: settings,
        });

    } catch (error) {
        req.log.error(error);

        return reply.code(500).send({
            success: false,
            message:
                "Failed to process merchant withdrawal limit.",
        });
    }
};

module.exports = {
    merchantWithdrawLimit,
};