const { Users } = require("../../models/usersModel");


const logout = async (req, reply) => {
    try {
        const { unique_id } = req.validatedData;

        const result = await Users.updateOne(
            { unique_id },
            { $unset: { unique_id: 1 } }
        );


        if (result.matchedCount === 0) {
            return reply.code(404).send({
                success: false,
                message: "Invalid session or already logged out",
            });
        }

        return reply.code(200).send({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({
            success: false,
            message: error.message,
        });
    }
};


module.exports = { logout };
