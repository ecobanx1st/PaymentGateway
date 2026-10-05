const { OAuth2Client } = require("google-auth-library");
const { Users } = require("../../models/usersModel");
const { generateToken } = require("../../middleware/utils/pasetoService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, reply) => {
    try {
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const {
            sub,
            email,
            name,
            picture
        } = payload;

        let user = await Users.findOne({ email });

        if (!user) {
            user = await Users.create({
                fullName: name,
                email,
                isGoogleLogin: true,
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            user.profileImage = picture;
            await user.save();
        }

        const token = await generateToken({ id: user._id });

        return reply.send({
            success: true,
            result: {
                id: user._id,
                token: token.accessToken,
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            },
        });

    } catch (err) {
        console.log(err);

        return reply.status(401).send({
            success: false,
            message: "Google authentication failed",
        });
    }
};

module.exports = {
    googleLogin,
};