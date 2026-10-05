const { Users } = require("../../models/usersModel");
const { Admins } = require("../../models/adminModel");
const twoFactorService = require("../../services/twofactor/twoFactorService");
const notificationService = require("../../services/notification/notificationService");


const disable2FA = async (req, reply) => {
    try {
        const loggedInUserId = req.user?._id || req.user?.id;

        if (!loggedInUserId) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
            });
        }


        // CHECK IF LOGGED-IN USER IS ADMIN / SUB-ADMIN

        const admin = await Admins.findById(loggedInUserId);

        if (admin) {
            const { userId } = req.body;

            if (!userId) {
                return reply.code(400).send({
                    success: false,
                    message: "userId is required",
                });
            }

            const user = await Users.findById(userId);


            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            if (!user.twoFactorEnabled) {
                return reply.code(400).send({
                    success: false,
                    message: "User 2FA is already disabled",
                });
            }

            user.twoFactorEnabled = false;


            await user.save();


            await notificationService.createNotification({
                user_id: user._id,
                role: "user",
                title: "Two-Factor Authentication Disabled",
                description: "Your Two-Factor Authentication (2FA) has been disabled by an administrator. If you did not expect this change, please contact support immediately.",
                type: "security",
                category: "SECURITY",
                status: "info",
            });


            return reply.code(200).send({
                success: true,
                message: "User 2FA disabled successfully",
                result: {
                    userId: user._id,
                    email: user.email,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            });
        }


        // NORMAL USER FLOW (OTP REQUIRED)

        const { token } = req.body;

        if (!token) {
            return reply.code(400).send({
                success: false,
                message: "OTP is required",
            });
        }

        const user = await Users.findById(loggedInUserId);

        if (!user) {
            return reply.code(404).send({
                success: false,
                message: "User not found",
            });
        }

        if (!user.twoFactorEnabled) {
            return reply.code(400).send({
                success: false,
                message: "2FA is already disabled",
            });
        }
        try {
        await twoFactorService.disableForUser(user, token);
        } catch (err) {
            return reply.code(400).send({
                success: false,
                message: "Expired or invalid OTP",
            });
        }

        await notificationService.createNotification({
            user_id: user._id,
            role: "user",
            title: "Two-Factor Authentication Disabled",
            description: "You have successfully disabled Two-Factor Authentication (2FA) for your account.",
            type: "security",
            category: "SECURITY",
            status: "success",
        });

        return reply.code(200).send({
            success: true,
            message: "2FA disabled successfully",
            result: {
                userId: user._id,
                email: user.email,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });

    } catch (error) {
        console.error("disable2FA error:", error);

        return reply.code(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = { disable2FA };