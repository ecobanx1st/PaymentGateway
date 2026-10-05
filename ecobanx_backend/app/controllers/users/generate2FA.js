const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const { Users } = require("../../models/usersModel");

const generate2FA = async (req, reply) => {
    try {
        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: "Unauthorized",
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

        // If already generated, return existing QR and details
        if (user.twoFactorSecret && user.otpauth_url) {
            const qrCode = await QRCode.toDataURL(user.otpauth_url);

            return reply.code(200).send({
                success: true,
                message: "2FA already generated",
                result: {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    secret: user.twoFactorSecret,
                    otpauth_url: user.otpauth_url,
                    qrCode,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            });
        }

        // Generate new secret
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `Eco Banx (${user.email})`,
            issuer: "Ecobanx",
        });

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        user.twoFactorSecret = secret.base32;
        user.otpauth_url = secret.otpauth_url;
        user.twoFactorEnabled = false;

        await user.save();

        return reply.code(200).send({
            success: true,
            message: "2FA generated successfully",
            result: {
                userId: user._id,
                email: user.email,
                role: user.role,
                secret: secret.base32,
                otpauth_url: secret.otpauth_url,
                qrCode,
                twoFactorEnabled: false,
            },
        });
    } catch (error) {
        console.error("generate2FA error:", error);

        return reply.code(500).send({
            success: false,
            message: "Error generating 2FA",
        });
    }
};

module.exports = { generate2FA };