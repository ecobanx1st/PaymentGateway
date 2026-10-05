const { Admins } = require("../../models/adminModel");
const { AdminStaffs } = require("../../models/AdminStaff");
const { changePasswordValidator } = require('./vaidators/index')


const { zodValidate } = require("../../middleware/utils/zodValidate");
const bcrypt = require("bcrypt");

const changePassword = async (req, reply) => {
  try {
    // 🔐 Must be logged in
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Validate request body using Zod
    const validation = await zodValidate(req, reply, changePasswordValidator);
    if (!validation.success) return;

    const { oldPassword, newPassword } = validation.data;

    const userId = req.user._id || req.user.id;
    const userType = req.user.userType;

    let user = null;

    // ✅ Find correct collection
    if (userType === "admin") {
      user = await Admins.findById(userId).select("+password");
    } else if (userType === "staff") {
      user = await AdminStaffs.findById(userId).select("+password");
    } else {
      // fallback safety
      user = await Admins.findById(userId).select("+password");
      if (!user) {
        user = await AdminStaffs.findById(userId).select("+password");
      }
    }

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: "Account not found",
      });
    }

    if (!user.password) {
      return reply.code(500).send({
        success: false,
        message: "Password hash missing in database",
      });
    }

    // ✅ Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return reply.code(400).send({
        success: false,
        message: "Current Password is incorrect",
      });
    }

    // ❌ Prevent reusing same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return reply.code(400).send({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    // 🔐 Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return reply.send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return reply.code(500).send({
      success: false,
      message: error.message || "Something Went Wrong",
    });
  }
};

module.exports = { changePassword };