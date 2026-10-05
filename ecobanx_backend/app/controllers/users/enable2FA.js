const { Users } = require("../../models/usersModel");
const twoFactorService = require("../../services/twofactor/twoFactorService");
const notificationService = require("../../services/notification/notificationService");

const enable2FA = async (req, reply) => {
    try {

        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }

        const { token } = req.body || {};

        if (!token) {
            return reply.code(400).send({
                success: false,
                message: "OTP token is required",
            });
        }

        const userId = req.user._id || req.user.id;

        const user = await Users.findById(userId);

        if (!user) {
            return reply.code(404).send({
                success: false,
                message: "User not found",
            });
        }

        await twoFactorService.enableForUser(user, token);

        await notificationService.createNotification({
            user_id: user._id,
            role: "user",
            title: "2FA Enabled Successfully",
            description: "Two-factor authentication has been enabled for your account",
            type: "security",
            category: "SECURITY",
            status: "success",
        });

        return reply.code(200).send({
            success: true,
            message: "2FA enabled successfully",
            result: {
                userId: user._id,
                email: user.email,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });
    } catch (error) {
        if (error.status) {
            return reply.code(error.status).send({ success: false, message: error.message });
        }
        console.error("enable2FA error:", error);

        return reply.code(500).send({
            success: false,
            message: "Error enabling 2FA",
        });
    }
};

module.exports = { enable2FA };