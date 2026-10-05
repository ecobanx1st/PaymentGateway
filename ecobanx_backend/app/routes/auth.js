const {
    register,
    verifyOtp,
    login,
    resendOtp,
    forgotPassword,
    resetPassword,
    validate2FALogin,
    googleLogin,
    getOtpStatus,
} = require("../controllers/auth");
const { refreshAccessToken } = require("../controllers/auth/refreshToken");
const { zodValidate } = require("../middleware/utils/zodValidate");
const { logout } = require("../controllers/auth/logout");
const { logoutValidator } = require("../controllers/auth/vaidators");
module.exports = async function (fastify) {

    fastify.post("/register", register);
    fastify.post("/verify-otp", verifyOtp);
    fastify.post("/get-otp-status", getOtpStatus);


    fastify.post("/login", login);
    fastify.post("/google-auth", googleLogin);
    fastify.post("/refresh-token", refreshAccessToken);
    fastify.post("/resend-otp", resendOtp);
    fastify.post("/forgot-password", forgotPassword);
    fastify.post("/reset-password", resetPassword);
    fastify.post("/validate-2fa-login", validate2FALogin);



    fastify.post(
        "/logout",
        {
            preHandler: async (req, reply) => {
                const result = await zodValidate(req, reply, logoutValidator);
                if (!result.success) return;

                req.validatedData = result.data;
            },
        },
        logout
    );
};