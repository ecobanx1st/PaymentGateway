const mongoose = require("mongoose");
const { Users: StageUsers } = require("../../models/stageUsersModel");
const { Users } = require("../../models/usersModel");
const { verifyOtpValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const notificationService = require("../../services/notification/notificationService");

const verifyOtp = async (req, reply) => {
  try {
    const result = await zodValidate(req, reply, verifyOtpValidator);
    if (!result.success) return;

    const { email, otp } = result.data;

    // Find stage user by email
    const stageUser = await StageUsers
      .findOne({ email })
      .select("+password");

    if (!stageUser) {
      return reply.code(404).send({
        success: false,
        message: "Email not found",
      });
    }

    // Check OTP expiry
    if (
      !stageUser.emailOtpExpiresAt ||
      stageUser.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      console.log("[StageUsers] OTP expired, record retained: ", stageUser._id);
      return reply.code(400).send({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Validate OTP
    if (Number(stageUser.emailOtp) !== Number(otp)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Create verified user
      const [newUser] = await Users.create([{
        accountType: stageUser.accountType,
        companyName: stageUser.companyName,
        companyWebsite: stageUser.companyWebsite,
        fullName: stageUser.fullName,
        businessName: stageUser.businessName,
        email: stageUser.email,
        phone: stageUser.phone,
        phoneCountryCode: stageUser.phoneCountryCode,
        country: stageUser.country,
        password: stageUser.password,
        verifyStatus: true,
      }], { session });

      console.log("[StageUsers] Verification successful", stageUser.email);

      // Delete stage user only after the verified user was created
      await StageUsers.deleteOne({ _id: stageUser._id }).session(session);

      console.log("[StageUsers] Deleted after successful verification", stageUser.email);

      await session.commitTransaction();

      await notificationService.createNotification({
        user_id: newUser._id,
        role: "admin",
        title: "User Email Verified",
        description: `${newUser.fullName || newUser.businessName || "A user"} has verified their email (${newUser.email})`,
        type: "register",
        category: "ONBOARDING",
        status: "success",
      });

      return reply.code(200).send({
        success: true,
        message: "Account verified successfully",
        result: {
          // id: newUser._id,
          // email: newUser.email,
        },
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { verifyOtp };
