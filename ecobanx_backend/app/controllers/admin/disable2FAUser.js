const { Users } = require("../../models/usersModel");

// POST /disable-2fa-user
const disable2FAUser = async (req, reply) => {
    try {
        const { id } = req.body;

        const user = await Users.findById(id);

        if (!user) {
            return reply.code(404).send({
                success: false,
                message: "User not found",
            });
        }

        await Users.findByIdAndUpdate(
            id,
            {
                $set: {
                    twoFactorEnabled: false,
                },
            },
            { new: true }
        );

        return reply.send({
            success: true,
            message: "Two-factor authentication has been disabled successfully.",
        });
    } catch (error) {
        console.error("Disable 2FA Error:", error);
        return reply.code(500).send({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = { disable2FAUser };