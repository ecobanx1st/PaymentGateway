const { Users } = require("../../models/usersModel");
const { Users: StageUsers } = require("../../models/stageUsersModel");
const { registerValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const bcrypt = require("bcrypt");
const notificationService = require("../../services/notification/notificationService");
const { sendEmail } = require("../../services/email/sendEmail");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 2);

const register = async (req, reply) => {
  try {
    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    const result = await zodValidate(req, reply, registerValidator);

    if (!result.success) {
      return;
    }

    const {
      fullName,
      businessName,
      phone,
      phoneCountryCode,
      email,
      country,
      password,
      accountType,
      companyName,
      companyWebsite,
    } = result.data;

    // =========================================================
    // NORMALIZE DATA
    // =========================================================

    const normalizedEmail = email.trim().toLowerCase();

    const formattedPhone = `${phoneCountryCode}${phone}`;

    // =========================================================
    // CHECK EXISTING VERIFIED USER
    //
    // We check EMAIL and PHONE separately.
    // =========================================================

    const [existingEmailUser, existingPhoneUser] =
      await Promise.all([
        Users.findOne({
          email: normalizedEmail,
        }),

        Users.findOne({
          phone: formattedPhone,
        }),
      ]);

    // =========================================================
    // 1. EMAIL ALREADY EXISTS IN VERIFIED USERS
    // =========================================================

    if (existingEmailUser) {
      // -------------------------------------------------------
      // SAME ACCOUNT TYPE
      // -------------------------------------------------------

      if (existingEmailUser.accountType === accountType) {
        return reply.code(400).send({
          success: false,
          code: "ACCOUNT_ALREADY_EXISTS",
          message:
            `An account with this email already exists as a ${accountType} account. Please login.`,
        });
      }

      // -------------------------------------------------------
      // DIFFERENT ACCOUNT TYPE
      // -------------------------------------------------------

      return reply.code(400).send({
        success: false,
        code: "EMAIL_ALREADY_REGISTERED",
        message:
          `This email is already registered. Please use a different email address.`
      });
    }


    if (existingPhoneUser) {
      return reply.code(400).send({
        success: false,
        code: "PHONE_ALREADY_REGISTERED",
        message:
          "This phone number is already registered. Please use a different phone number.",
      });
    }

    // =========================================================
    // CHECK PENDING STAGE USER
    //
    // Email and phone are checked separately here also.
    // =========================================================

    const [pendingEmailUser, pendingPhoneUser] =
      await Promise.all([
        StageUsers.findOne({
          email: normalizedEmail,
        }),

        StageUsers.findOne({
          phone: formattedPhone,
        }),
      ]);

    // =========================================================
    // 3. EMAIL EXISTS IN STAGE USERS
    //
    // User registered but did not verify email.
    // =========================================================

    if (pendingEmailUser) {
      // -------------------------------------------------------
      // SAME ACCOUNT TYPE
      // -------------------------------------------------------

      if (pendingEmailUser.accountType === accountType) {
        return reply.code(400).send({
          success: false,
          code: "REGISTRATION_PENDING",
          message:
            "This email is already registered but not verified. Please verify the OTP sent to your email.",
        });
      }

      // -------------------------------------------------------
      // DIFFERENT ACCOUNT TYPE
      // -------------------------------------------------------

      return reply.code(400).send({
        success: false,
        code: "EMAIL_REGISTRATION_PENDING",
        message:
          `This email already has a pending ${pendingEmailUser.accountType} registration. ` +
          `Please verify the email before registering again.`,
      });
    }

    // =========================================================
    // 4. PHONE EXISTS IN STAGE USERS
    //
    // Different email but same phone in pending registration.
    // =========================================================

    if (pendingPhoneUser) {
      return reply.code(400).send({
        success: false,
        code: "PHONE_REGISTRATION_PENDING",
        message:
          "This phone number is already associated with a pending registration. Please complete that registration first.",
      });
    }

    // =========================================================
    // GENERATE OTP
    // =========================================================

    const expiryTime = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const otpSentAt = new Date();

    const emailOtp = Math.floor(
      100000 + Math.random() * 900000
    );

    // =========================================================
    // HASH PASSWORD
    // =========================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================================================
    // CREATE NEW STAGE USER
    // =========================================================

    const stageUser = await StageUsers.create({
      fullName,

      businessName,

      email: normalizedEmail,

      phone: formattedPhone,

      phoneCountryCode,

      password: hashedPassword,

      accountType,

      companyName,

      companyWebsite,

      country,

      emailOtp,

      emailOtpExpiresAt: expiryTime,

      lastEmailOtpSentAt: otpSentAt,

      accountverifyStatus: false,
    });

    console.log(
      "[StageUsers] New registration:",
      stageUser.email,
      stageUser.accountType
    );

    // =========================================================
    // SEND OTP EMAIL
    // =========================================================

    await sendEmail({
      to: stageUser.email,

      subject: "Verify Your Email",

      template: "verification",

      data: {
        name:
          stageUser.fullName ||
          stageUser.businessName ||
          "User",

        otp: emailOtp,

        verificationLink:
          process.env.BACKEND_URL
            ? `${process.env.BACKEND_URL}/verify-email?email=${encodeURIComponent(
              stageUser.email
            )}&otp=${emailOtp}`
            : undefined,
      },
    });

    // =========================================================
    // ADMIN NOTIFICATION
    // =========================================================

    await notificationService.createNotification({
      role: "admin",

      title: "New User Registration",

      description:
        `${stageUser.fullName ||
        stageUser.businessName ||
        "A new user"} has registered ` +
        `(${stageUser.email}) as ${stageUser.accountType}`,

      type: "register",

      category: "ONBOARDING",

      status: "info",
    });

    // =========================================================
    // SUCCESS RESPONSE
    // =========================================================

    return reply.code(201).send({
      success: true,

      code: "REGISTRATION_PENDING",

      message: "Registered successfully. OTP sent to email.",
    });
  } catch (error) {
    console.error("Register Error:", error);

    // =========================================================
    // DUPLICATE KEY
    // =========================================================

    if (error.code === 11000) {
      return reply.code(400).send({
        success: false,
        code: "DUPLICATE_REGISTRATION",
        message:
          "This email or phone number is already registered.",
      });
    }

    // =========================================================
    // INTERNAL SERVER ERROR
    // =========================================================

    return reply.code(500).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

module.exports = {
  register,
};