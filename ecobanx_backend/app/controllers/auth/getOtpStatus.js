const { Users: StageUsers } = require("../../models/stageUsersModel");

const OTP_RESEND_COOLDOWN_SECONDS = 120;
const OTP_EXPIRY_SECONDS = 2 * 60;

const getOtpStatus = async (req, reply) => {
    try {
        const { email } = req.body;

        if (!email) {
            return reply.code(400).send({
                success: false,
                message: "Email is required.",
            });
        }

        // Find pending user
        const stageUser = await StageUsers.findOne({ email }).select(
            "lastEmailOtpSentAt emailOtpExpiresAt verifyStatus"
        );

        if (!stageUser) {
            return reply.code(404).send({
                success: false,
                message: "Verification session not found.",
            });
        }

        // Already verified
        if (stageUser.verifyStatus) {
            return reply.code(400).send({
                success: false,
                message: "Account already verified.",
            });
        }

        const now = Date.now();

        // =========================================================
        // RESEND COUNTDOWN
        // =========================================================

        let retryAfter = 0;

        if (stageUser.lastEmailOtpSentAt) {
            const elapsedSeconds =
                (now - stageUser.lastEmailOtpSentAt.getTime()) / 1000;

            retryAfter = Math.max(
                0,
                Math.ceil(
                    OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
                )
            );
        }

        // =========================================================
        // OTP EXPIRY
        // =========================================================

        let otpExpiresIn = 0;

        if (stageUser.emailOtpExpiresAt) {
            otpExpiresIn = Math.max(
                0,
                Math.min(
                    OTP_EXPIRY_SECONDS,
                    Math.ceil(
                        (stageUser.emailOtpExpiresAt.getTime() - now) / 1000
                    )
                )
            );
        }

        // =========================================================
        // RESPONSE
        // =========================================================

        return reply.code(200).send({
            success: true,

            canResend: retryAfter === 0,

            retryAfter,

            otpExpired: otpExpiresIn === 0,

            otpExpiresIn,
        });
    } catch (error) {
        console.error("Get OTP Status Error:", error);

        return reply.code(500).send({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
    getOtpStatus,
};