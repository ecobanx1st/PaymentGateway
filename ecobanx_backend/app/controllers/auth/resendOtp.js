const { Users: StageUsers } = require("../../models/stageUsersModel");
const { Users } = require("../../models/usersModel");
const { resendOtpValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const { sendEmail } = require("../../services/email/sendEmail");

const OTP_EXPIRY_MINUTES = 2;
const OTP_RESEND_COOLDOWN_SECONDS = 120;

const resendOtp = async (req, reply) => {
  try {
    const result = await zodValidate(req, reply, resendOtpValidator);

    if (!result.success) return;

    const { email } = result.data;

    // =========================================================
    // FIND STAGE USER
    // =========================================================

    const stageUser = await StageUsers.findOne({ email });

    if (!stageUser) {
      const existingUser = await Users.findOne({ email });

      if (existingUser) {
        return reply.code(400).send({
          success: false,
          message: "Account already verified. Please login.",
        });
      }

      return reply.code(404).send({
        success: false,
        message: "Please enter a registered email address.",
      });
    }

    // =========================================================
    // SAFETY CHECK
    // =========================================================

    if (stageUser.verifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "Account already verified.",
      });
    }

    // =========================================================
    // CHECK RESEND COOLDOWN
    // =========================================================

    let retryAfter = 0;

    if (stageUser.lastEmailOtpSentAt) {
      const elapsedSeconds =
        (Date.now() - stageUser.lastEmailOtpSentAt.getTime()) / 1000;

      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        retryAfter = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
        );

        return reply.code(429).send({
          success: false,
          message: `Please wait ${retryAfter} seconds before requesting a new OTP.`,
          retryAfter,
        });
      }
    }

    // =========================================================
    // GENERATE NEW OTP
    // =========================================================

    const emailOtp = Math.floor(100000 + Math.random() * 900000);

    const expiryTime = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const otpSentAt = new Date();

    // =========================================================
    // UPDATE STAGE USER
    // =========================================================

    stageUser.emailOtp = emailOtp;
    stageUser.emailOtpExpiresAt = expiryTime;
    stageUser.lastEmailOtpSentAt = otpSentAt;

    await stageUser.save();

    console.log(
      "[StageUsers] OTP resent",
      stageUser.email,
      "expiresAt:",
      expiryTime.toISOString(),
      "lastSentAt:",
      otpSentAt.toISOString()
    );

    // =========================================================
    // SEND EMAIL
    // =========================================================

    await sendEmail({
      to: stageUser.email,
      subject: "Your Verification Code",
      template: "otp",
      data: {
        name: stageUser.fullName || stageUser.businessName,
        otp: emailOtp,
      },
    });

    // =========================================================
    // RESPONSE
    // =========================================================

    return reply.code(200).send({
      success: true,
      message: "OTP resent successfully.",
      otpExpiresInMinutes: OTP_EXPIRY_MINUTES,
      resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      retryAfter: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Something went wrong.",
    });
  }
};

module.exports = { resendOtp };