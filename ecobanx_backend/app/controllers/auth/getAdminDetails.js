const { Admins } = require("../../models/adminModel");
const { adminLoginValidator } = require("./vaidators");
const { zodValidate } = require("../../middleware/utils/zodValidate");
const { generateToken } = require("../../middleware/utils/pasetoService");
const bcrypt = require("bcrypt");

const getAdminDetails = async (req, reply) => {


  try {
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    let admin = await Admins.find({}).select(
      "+name email role country phone blockstatus  twoFactorEnabled createdAt updatedAt"
    );

    return reply.send({
      success: true,
      admin
    });

  } catch (error) {
    console.error("Admin Details Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Server error",
    });
  }
};



module.exports = { getAdminDetails };
