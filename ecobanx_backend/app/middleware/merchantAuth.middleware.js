const { verifyAccessToken } = require("./utils/pasetoService");
const { MerchantApiKey } = require("../models/merchantApiKeyModel");

const verifyMerchantToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.code(401).send({
        success: false,
        message: "Missing or invalid authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];
    let payload;

    try {
      payload = await verifyAccessToken(token);
    } catch (err) {
      if (err.message.includes("expired")) {
        return reply.code(401).send({
          success: false,
          message: "Token has expired.",
        });
      }
      return reply.code(401).send({
        success: false,
        message: "Invalid token.",
      });
    }

    if (!payload.apiKeyId) {
      return reply.code(401).send({
        success: false,
        message: "Invalid token.",
      });
    }

    const apiKey = await MerchantApiKey.findById(payload.apiKeyId)
      .select("status expiresAt permissions merchantId secretKeyEncrypted")
      .lean();

    if (!apiKey || apiKey.status !== "ACTIVE") {
      return reply.code(401).send({
        success: false,
        message: "API key has been revoked.",
      });
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return reply.code(401).send({
        success: false,
        message: "API key has expired.",
      });
    }

    req.user = {
      merchantId: apiKey.merchantId,
      apiKeyId: apiKey._id,
    };

    req.apiKey = apiKey;
  } catch (error) {
    console.error("verifyMerchantToken error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const checkPermission = (permission) => {
  return async (req, reply) => {
    if (!req.apiKey) {
      return reply.code(401).send({
        success: false,
        message: "Authentication required.",
      });
    }

    const hasPermission =
      req.apiKey.permissions && req.apiKey.permissions[permission] === true;

    if (!hasPermission) {
      return reply.code(403).send({
        success: false,
        message: "Permission denied..",
      });
    }
  };
};

const verifyCheckoutToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.code(401).send({
        success: false,
        message: "Missing or invalid authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];
    let payload;

    try {
      payload = await verifyAccessToken(token);
    } catch (err) {
      if (err.message.includes("expired")) {
        return reply.code(401).send({
          success: false,
          message: "Token has expired.",
        });
      }
      return reply.code(401).send({
        success: false,
        message: "Invalid token.",
      });
    }

    if (payload.scope !== "checkout" || !payload.txnId) {
      return reply.code(401).send({
        success: false,
        message: "Invalid token.",
      });
    }

    req.txnId = payload.txnId;
  } catch (error) {
    console.error("verifyCheckoutToken error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { verifyMerchantToken, checkPermission, verifyCheckoutToken };
