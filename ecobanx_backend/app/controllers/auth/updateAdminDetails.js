const { Admins } = require("../../models/adminModel");
const { AdminStaffs } = require("../../models/AdminStaff");

const updateAdminDetails = async (req, reply) => {
  try {
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
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
        message: "Account not found",
      });
    }

    const data = req.validatedData || req.body || {};
    const allowedFields = ["name", "country", "phone", "profile_picture"];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (updateData.email) {
      const duplicate = await Admins.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });
      if (duplicate) {
        return reply.code(400).send({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    if (!Object.keys(updateData).length) {
      return reply.code(400).send({
        success: false,
        message: "No valid fields to update",
      });
    }

    const updatedAdmin = await Admins.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password -refreshToken -refreshTokenExpiresAt -twoFactorSecret -otpauth_url");

    return reply.send({
      success: true,
      message: "Profile updated successfully",
      result: updatedAdmin,
    });
  } catch (error) {
    console.error("Update Admin Details Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { updateAdminDetails };
