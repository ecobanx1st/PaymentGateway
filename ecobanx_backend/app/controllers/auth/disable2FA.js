// controllers/auth/disable2FA.js

const speakeasy = require("speakeasy");
const { Admins } = require("../../models/adminModel");
const { AdminStaffs } = require("../../models/AdminStaff");

const disable2FA = async (req, reply) => {
  try {
    const { token } = req.body;

    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!token) {
      return reply.code(400).send({
        success: false,
        message: "OTP token is required",
      });
    }

    const userId = req.user._id || req.user.id;
    const reqUserType = req.user.userType;

    let user = null;
    let userType = null;

    if (reqUserType === "admin") {
      user = await Admins.findById(userId);
      if (user) userType = "admin";
    } else if (reqUserType === "staff") {
      user = await AdminStaffs.findById(userId);
      if (user) userType = "staff";
    } else {
      user = await Admins.findById(userId);
      if (user) {
        userType = "admin";
      } else {
        user = await AdminStaffs.findById(userId);
        if (user) userType = "staff";
      }
    }

    if (!user || !user.twoFactorSecret) {
      return reply.code(400).send({
        success: false,
        message: "2FA not enabled",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return reply.code(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.twoFactorEnabled = false;

    // optional: fully remove secret
    // user.twoFactorSecret = undefined;
    // user.otpauth_url = undefined;

    await user.save();

    return reply.code(200).send({
      success: true,
      message: "2FA disabled successfully",
      result: {
        userId: user._id,
        email: user.email,
        userType,
        twoFactorEnabled: false,
      },
    });
  } catch (error) {
    console.error("disable2FA error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error disabling 2FA",
    });
  }
};

module.exports = { disable2FA };