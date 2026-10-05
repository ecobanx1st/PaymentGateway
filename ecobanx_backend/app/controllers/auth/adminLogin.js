const { Admins } = require("../../models/adminModel");
const { AdminStaffs } = require("../../models/AdminStaff");
const { generateToken } = require("../../middleware/utils/pasetoService");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");

const adminLogin = async (req, reply) => {
  try {
    const { email, password, twoFactorCode } = req.validatedData;

    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail || !password) {
      return reply.code(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    let user = null;
    let userType = null;

    // Main admin
    user = await Admins.findOne({ email: normalizedEmail })
      .select("+password email verifyStatus role twoFactorEnabled twoFactorSecret");
    if (user) {
      userType = "admin";
    }

    // Staff
    if (!user) {
      user = await AdminStaffs.findOne({ email: normalizedEmail })
        .select("name username email phone password role roleType permissions status twoFactorEnabled twoFactorSecret");

      if (user) {
        userType = "staff";
      }
    }

    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.password) {
      console.error("🚨 Password hash missing for user:", {
        email: normalizedEmail,
        userType,
        userId: user._id,
      });

      return reply.code(500).send({
        success: false,
        message: "Password hash missing in database",
      });
    }

    if (userType === "admin" && user.verifyStatus === false) {
      return reply.code(403).send({
        success: false,
        message: "Account not verified",
      });
    }

    if (userType === "staff" && user.status !== "active") {
      return reply.code(403).send({
        success: false,
        message: "Your account is inactive. Contact Admin.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return reply.code(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }


    // 2FA for any user who enabled it
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return reply.code(200).send({
          success: false,
          twoFactorRequired: true,
          message: "Enter 2FA code",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
        window: 1,
      });

      if (!verified) {
        return reply.code(401).send({
          success: false,
          message: "Invalid 2FA code",
        });
      }
    }

    const basePermissions = ["Profile"];

    const permissions = userType === "staff" ? [...basePermissions, ...user.permissions] || basePermissions : ["ALL"];
    const token = await generateToken({
      id: user._id,
      role: user.role?.toLowerCase?.() || user.role,
      userType,
      permissions,
    });

    // Save refresh token to database and update last login time
    user.refreshToken = token.refreshToken;
    user.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
    user.lastLoginTime = new Date();
    await user.save();

    return reply.code(200).send({
      success: true,
      message: "Login successful",
      result: {
        id: user._id,
        name: user.name || "Admin",
        email: user.email,
        role: user.role?.toLowerCase?.() || user.role,
        roleType: user.roleType || null,
        userType,
        permissions,
        token: token.accessToken,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        lastLoginTime: user.lastLoginTime,
      },
    });
  } catch (error) {
    console.error("🚨 Login Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

module.exports = { adminLogin };