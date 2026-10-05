const apiKeyService = require("../services/merchantApiKey.service");

const authenticateApiKey = async (req, reply) => {
  try {
    const publicKey = req.headers["x-public-key"];
    const secretKey = req.headers["x-secret-key"];
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection?.remoteAddress;

    if (!publicKey || !secretKey) {
      return reply.code(401).send({
        success: false,
        message: "Missing API key credentials. Provide X-PUBLIC-KEY and X-SECRET-KEY headers.",
      });
    }

    const apiKey = await apiKeyService.verifyApiKey(publicKey, secretKey, clientIp);

    req.apiKey = apiKey;
    req.merchant = { _id: apiKey.merchantId };

    await apiKeyService.updateLastUsed(apiKey._id, clientIp);
  } catch (error) {
    if (error.message === "Invalid API key." || error.message === "API key has expired.") {
      return reply.code(401).send({ success: false, message: error.message });
    }
    if (error.message === "IP not allowed.") {
      return reply.code(403).send({ success: false, message: error.message });
    }
    console.error("API key auth error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = { authenticateApiKey };
