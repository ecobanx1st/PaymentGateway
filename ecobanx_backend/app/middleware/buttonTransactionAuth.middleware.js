const { validateToken } = require("./authMiddleware");
const { Users } = require("../models/usersModel");
const { KYB } = require("../models/kybModel");


const tokenAuth = validateToken(["user"], ["business"]);

const validateButtonTransactionAuth = async (req, reply) => {
  try {
    const authHeader = req.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      return tokenAuth(req, reply);
    }

    const uniqueId = String(req.body?.custom || "").trim();

    if (!uniqueId) {
      return reply.code(401).send({
        success: false,
        code: "MISSING_MERCHANT_ID",
        message:
          "Unauthorized: Missing authorization header. Pass the merchant unique ID in the 'custom' field.",
      });
    }

    const user = await Users.findOne({ userUniqueId: uniqueId }).lean();

    if (!user) {
      return reply.code(401).send({
        success: false,
        code: "MERCHANT_NOT_FOUND",
        message: "Unauthorized: Unknown merchant unique ID.",
      });
    }

    if (String(user.accountType || "").toLowerCase() !== "business") {
      return reply.code(403).send({
        success: false,
        code: "INVALID_ACCOUNT_TYPE",
        message: "Forbidden: This account type cannot receive button payments.",
      });
    }

    if (user.blockstatus) {
      return reply.code(403).send({
        success: false,
        code: "ACCOUNT_BLOCKED",
        message: "Your account has been blocked.",
      });
    }

    // Business (KYB) verification — same gate as other merchant money flows.
    const kyb = await KYB.findOne({ userId: user._id }).select("status").lean();

    if (!kyb || kyb.status !== "Approved") {
      return reply.code(403).send({
        success: false,
        code: "KYB_NOT_APPROVED",
        message: "KYB verification must be approved.",
      });
    }

    req.user = { ...user, merchantId: user._id };
  } catch (error) {
    req.log?.error({ err: error }, "buttonTransactionAuth error");
    return reply.code(500).send({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Internal server error during authentication",
    });
  }
};

module.exports = { validateButtonTransactionAuth };
