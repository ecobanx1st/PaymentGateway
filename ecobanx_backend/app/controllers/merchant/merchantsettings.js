const { MerchantSettings } = require("../../models/merchantsettingsModel");
const { Users } = require("../../models/usersModel");

const getMerchantSettings = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId || req.user._id || req.user.id;

    const settings = await MerchantSettings.findOne({ merchantId });
    if (!settings) {
      return reply.code(404).send({ success: false, message: "Merchant settings not found." });
    }

    return reply.code(200).send({
      success: true,
      message: "Merchant settings fetched successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Get merchant settings error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const createMerchantSettings = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId || req.user._id || req.user.id;
    const {
      ipnSecret,
      ipnUrl,
      depositCoin,
      logEmail,
      newpayment,
      fundreceive,
      fundsend,
      depositreceived,
    } = req.body;

    const settings = await MerchantSettings.create({
      merchantId,
      ipnSecret,
      ipnUrl,
      depositCoin,
      logEmail,
      newpayment,
      fundreceive,
      fundsend,
      depositreceived,
    });

    return reply.code(201).send({
      success: true,
      message: "Merchant settings created successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Create merchant settings error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const updateMerchantSettings = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId || req.user._id || req.user.id;
    const updates = req.body;

    const merchant = await Users.findOne({ _id: merchantId });
    if (!merchant) {
      return reply.code(404).send({ success: false, message: "Merchant not found." });
    }

    const settings = await MerchantSettings.findOneAndUpdate(
      { merchantId },
      { $set: updates },
      { new: true }
    );

    if (!settings) {
      return reply.code(404).send({ success: false, message: "Merchant settings not found." });
    }

    return reply.code(200).send({
      success: true,
      message: "Merchant settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Update merchant settings error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getMerchantSettings,
  createMerchantSettings,
  updateMerchantSettings,
};

