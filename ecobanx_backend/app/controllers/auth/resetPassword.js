const { Users } = require("../../models/usersModel");
const { resetPasswordValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const bcrypt = require("bcrypt");

const resetPassword = async (req, reply) => {
  try {
    const result = await zodValidate(
      req,
      reply,
      resetPasswordValidator
    );

    if (!result.success) return;

    const { email, otp, newPassword } = result.data;

    // Find user by email
    const user = await Users.findOne({ email }).select(
      "+password fullName email forgotPasswordOtp forgotPasswordOtpExpiresAt"
    );

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check OTP exists
    if (!user.forgotPasswordOtp) {
      return reply.code(400).send({
        success: false,
        message: "No password reset request found.",
      });
    }

    // Check OTP expiry
    if (
      !user.forgotPasswordOtpExpiresAt ||
      user.forgotPasswordOtpExpiresAt.getTime() < Date.now()
    ) {
      return reply.code(400).send({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (String(user.forgotPasswordOtp) !== String(otp)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // --------------------------------------------------
    // Check if new password is same as old password
    // --------------------------------------------------

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return reply.code(400).send({
        success: false,
        message:
          "New password must be different from your old password.",
      });
    }

    // --------------------------------------------------
    // Hash new password
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    user.password = hashedPassword;

    // Clear OTP after successful password reset
    user.forgotPasswordOtp = undefined;
    user.forgotPasswordOtpExpiresAt = undefined;
    user.lastForgotPasswordOtpSentAt = undefined;

    await user.save();

    return reply.code(200).send({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

module.exports = { resetPassword };