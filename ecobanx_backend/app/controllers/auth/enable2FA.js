const { Admins } = require("../../models/adminModel");
const { AdminStaffs } = require("../../models/AdminStaff");
const twoFactorService = require("../../services/twofactor/twoFactorService");
const notificationService = require("../../services/notification/notificationService");

const enable2FA = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const { token } = req.body;

    if (!token) {
      return reply.code(400).send({
        success: false,
        message: "OTP token is required",
      });
    }

    const userId = req.user._id || req.user.id;
    const userType = req.user.userType;

    let user = null;

    if (userType === "admin") {
      user = await Admins.findById(userId);
    } else if (userType === "staff") {
      user = await AdminStaffs.findById(userId);
    } else {
      user = await Admins.findById(userId);
      if (!user) {
        user = await AdminStaffs.findById(userId);
      }
    }

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: "Admin or staff not found",
      });
    }

    await twoFactorService.enableForUser(user, token);

    await notificationService.createNotification({
      admin_id: user._id,
      role: "admin",
      title: "2FA Enabled Successfully",
      description: "Two-factor authentication has been enabled for your admin account",
      type: "security",
      category: "SECURITY",
      status: "success",
    });

    return reply.code(200).send({
      success: true,
      message: "2FA enabled successfully",
      result: {
        userId: user._id,
        email: user.email,
        userType: userType || "unknown",
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    if (error.status) {
      return reply.code(error.status).send({ success: false, message: error.message });
    }
    console.error("enable2FA error:", error);
    return reply.code(500).send({
      success: false,
      message: "Error enabling 2FA",
    });
  }
};

module.exports = { enable2FA };
