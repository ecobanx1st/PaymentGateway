const { Users } = require("../../models/usersModel");
const { Users: StageUsers } = require("../../models/stageUsersModel");
const { loginValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const { generateToken } = require("../../middleware/utils/pasetoService");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const notificationService = require("../../services/notification/notificationService");

const generateUserUniqueId = async () => {
  for (let i = 0; i < 5; i++) {
    const id = `USR-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const exists = await Users.exists({ userUniqueId: id });
    if (!exists) return id;
  }
  return `USR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const MAX_LOGIN_ATTEMPTS = parsePositiveInt(
  process.env.max_attempts,
  5
);

const LOGIN_LOCK_MINUTES = parsePositiveInt(
  process.env.ACCOUNT_LOCK_MINUTES,
  2
);

const LOGIN_LOCK_MS = LOGIN_LOCK_MINUTES * 60 * 1000;

/**
 * Account locked response
 */
const sendAccountLocked = (reply, lockedUntil) => {
  const lockMs =
    new Date(lockedUntil).getTime() - Date.now();

  const retryAfter = Math.max(
    1,
    Math.ceil(lockMs / 1000)
  );

  reply.header("Retry-After", retryAfter);

  return reply.code(423).send({
    success: false,
    code: "ACCOUNT_LOCKED",
    message: `Your account has been temporarily locked. Please try again in ${retryAfter} seconds.`,
    retryAfter,
  });
};

/**
 * LOGIN
 */
const login = async (req, reply) => {
  try {
    // -----------------------------
    // 1. Validate request
    // -----------------------------
    const result = await zodValidate(
      req,
      reply,
      loginValidator
    );

    if (!result.success) return;

    const { email, password, otp } = result.data;

    const now = new Date();

    // -----------------------------
    // 2. Check staged/unverified user
    // -----------------------------
    const stageUser = await StageUsers.findOne({ email });

    if (stageUser) {
      return reply.code(400).send({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message:
          "Your email address is not verified yet. Please verify your email before log in.",
      });
    }

    // -----------------------------
    // 3. Get user
    // -----------------------------
    let user = await Users.findOne({ email }).select(
      "+password loginAttempts accountType lastFailedLoginAt accountLockedUntil blockstatus twoFactorSecret twoFactorEnabled userUniqueId unique_id fcmToken email firstname lastname");

    if (!user) {
      return reply.code(400).send({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Given email not found. Please signup.",
      });
    }

    // -----------------------------
    // 4. Admin blocked account
    // -----------------------------
    if (user.blockstatus) {
      return reply.code(403).send({
        success: false,
        code: "ACCOUNT_BLOCKED",
        message:
          "Your account has been blocked. Please contact support for assistance.",
      });
    }

    // -----------------------------
    // 5. Check account lock
    // -----------------------------
    if (
      user.accountLockedUntil &&
      new Date(user.accountLockedUntil).getTime() > now.getTime()
    ) {
      return sendAccountLocked(
        reply,
        user.accountLockedUntil
      );
    }

    // -----------------------------
    // 6. Clear expired lock
    // -----------------------------
    if (
      user.accountLockedUntil &&
      new Date(user.accountLockedUntil).getTime() <= now.getTime()
    ) {
      user.loginAttempts = 0;
      user.lastFailedLoginAt = null;
      user.accountLockedUntil = null;

      await user.save();
    }

    // -----------------------------
    // 7. Check password
    // -----------------------------
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // -----------------------------
    // 8. Invalid password
    // -----------------------------
    if (!isMatch) {
      user.loginAttempts =
        (user.loginAttempts || 0) + 1;

      user.lastFailedLoginAt = now;

      // 5th failed attempt
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.accountLockedUntil = new Date(
          now.getTime() + LOGIN_LOCK_MS
        );

        await user.save();

        return sendAccountLocked(
          reply,
          user.accountLockedUntil
        );
      }

      await user.save();

      const remainingAttempts =
        MAX_LOGIN_ATTEMPTS - user.loginAttempts;

      return reply.code(400).send({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: `Invalid Credentials. You have ${remainingAttempts} login attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
      });
    }

    // -----------------------------
    // 9. Two-factor authentication
    // -----------------------------
    if (user.twoFactorEnabled) {
      if (!otp) {
        return reply.code(200).send({
          success: true,
          requiresTwoFactor: true,
          message:
            "Password verified. Please enter your authentication code to continue.",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp.toString().trim(),
        window: 1,
      });

      if (!verified) {
        return reply.code(401).send({
          success: false,
          code: "INVALID_OTP",
          message:
            "The authentication code is invalid or has expired. Please enter a valid code.",
        });
      }
    }

    // -----------------------------
    // 10. Reset login attempts
    // -----------------------------
    user.loginAttempts = 0;
    user.lastFailedLoginAt = null;
    user.accountLockedUntil = null;
    user.lastLoginTime = new Date();

    // -----------------------------
    // 10b. Ensure userUniqueId exists
    // -----------------------------
    if (!user.userUniqueId) {
      user.userUniqueId = await generateUserUniqueId();
    }

    // -----------------------------
    // 11. Generate token
    // -----------------------------
    const token = await generateToken({
      id: user._id,
    });

    user.refreshToken = token.refreshToken;
    user.refreshTokenExpiresAt =
      token.refreshTokenExpiresAt;

    try {
      await user.save();
    } catch (saveErr) {
      // Retry once with a fresh id on rare unique-index collision
      if (saveErr?.code === 11000 && !user.$isNew) {
        user.userUniqueId = await generateUserUniqueId();
        await user.save();
      } else {
        throw saveErr;
      }
    }

    // -----------------------------
    // 12. Login notification
    // -----------------------------
    const deviceName =
      req.headers["user-agent"] || "Unknown device";

    await notificationService.createNotification({
      user_id: user._id,
      role: "user",
      title: "Login Successful",
      description: `You logged in from ${deviceName}`,
      type: "login",
      category: "SECURITY",
      status: "info",
    });

    // -----------------------------
    // 13. Success response
    // -----------------------------
    return reply.code(200).send({
      success: true,
      message: "Login successful.",
      result: {
        id: user._id,
        userUniqueId: user.userUniqueId,
        token: token.accessToken,
        refreshToken: token.refreshToken,
        accountType: user.accountType,
        refreshTokenExpiresAt:
          token.refreshTokenExpiresAt,
        lastLoginTime: user.lastLoginTime,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return reply.code(500).send({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Something went wrong while processing your login. Please try again later.",
    });
  }
};

module.exports = {
  login,
};