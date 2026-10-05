const { Users } = require("../../models/usersModel");
const { forgotPasswordValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const { sendEmail } = require("../../services/email/sendEmail");

const forgotPassword = async (req, reply) => {
  try {
    // Validate input
    const result = await zodValidate(req, reply, forgotPasswordValidator);
    if (!result.success) return;

    const { email } = result.data;

    // Find user
    const user = await Users.findOne({ email });

    if (!user) {
      return reply.code(400).send({
        success: false,
        message: "Given Email not found, Please Sign Up",
      });
    }

    // Check account verification
    if (!user.accountverifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "Please verify your account first",
      });
    }

    // 60-second rate limit
    if (user.lastForgotPasswordOtpSentAt) {
      const diff =
        (Date.now() - user.lastForgotPasswordOtpSentAt.getTime()) / 1000;

      if (diff < 60) {
        return reply.code(429).send({
          success: false,
          message: `Please wait ${Math.ceil(
            60 - diff
          )} seconds before requesting another OTP.`,
        });
      }
    }

    // Generate OTP
    const forgotPasswordOtp =
      Math.floor(100000 + Math.random() * 900000);

    const expiryTime = new Date(Date.now() + 3 * 60 * 1000);

    // Save OTP
    user.forgotPasswordOtp = forgotPasswordOtp;
    user.forgotPasswordOtpExpiresAt = expiryTime;
    user.lastForgotPasswordOtpSentAt = new Date();

    await user.save();

    // Send email here
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      template: "forgotPassword",
      data: {
        name: user.fullName || user.businessName,
        otp: forgotPasswordOtp,
        resetLink: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/reset-password?email=${encodeURIComponent(user.email)}&otp=${forgotPasswordOtp}`
          : undefined,
      },
    });

    return reply.code(200).send({
      success: true,
      message: "Password reset OTP sent successfully.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { forgotPassword };