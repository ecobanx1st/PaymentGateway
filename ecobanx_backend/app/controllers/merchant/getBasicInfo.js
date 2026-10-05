const { Users } = require("../../models/usersModel");

const getBasicInfo = async (req, reply) => {
  try {
    const merchant = await Users.findById(req.user.merchantId)
      .select("username email phone companyName website status createdAt")
      .lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found",
      });
    }

    return reply.code(200).send({
      success: true,
      result: {
        username: merchant.username,
        email: merchant.email,
        phone: merchant.phone,
        company_name: merchant.companyName,
        website: merchant.website,
        status: merchant.status,
        created_at: merchant.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getBasicInfo };
