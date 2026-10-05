const { Users } = require("../../models/usersModel");
const { getRegistry } = require("../../socket/socketRegistry");

// post /block-user/:id
const blockusers = async (req, reply) => {
    try {
        const { id } = req.body;

        const user = await Users.findById(id);
        if (!user) {
            return reply.code(404).send({ success: false, message: "User not found" });
        }

        user.blockstatus = !user.blockstatus;
        await user.save();

        // Force immediate logout over Socket.IO when the user gets blocked
        if (user.blockstatus) {
            try {
                getRegistry().emitToUser(user._id, "forceLogout", {
                    message: "Your account has been blocked by the administrator.",
                });
            } catch (emitError) {
                console.error("Force logout emit error:", emitError);
            }
        }

        return reply.send({
            success: true,
            message: `User has been ${user.blockstatus ? "blocked" : "unblocked"} successfully`,
        });
    } catch (error) {
        console.error("Block User Error:", error);
        return reply.code(500).send({ success: false, message: "Server error" });
    }
};

module.exports = { blockusers };