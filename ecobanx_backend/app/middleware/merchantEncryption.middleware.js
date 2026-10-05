const { decrypt: decryptSecret } = require("../services/encryption/encryptData");
const { decrypt: decryptPayload, encrypt: encryptPayload } = require("../services/encryption/payloadEncryption");

const decryptMerchantPayload = async (req, reply) => {
  if (!req.body || !req.body.payload) return;

  if (!req.apiKey) {
    return reply.code(401).send({ success: false, message: "Authentication required" });
  }

  try {
    const secretKey = decryptSecret(req.apiKey.secretKeyEncrypted);
    const decryptedJson = decryptPayload(req.body.payload, secretKey);
    req.body = JSON.parse(decryptedJson);
    req.isEncrypted = true;

    req._requestBody = JSON.parse(JSON.stringify(req.body));
    if (req._requestBody.privatekey) req._requestBody.privatekey = "***";
    if (req._requestBody.secretKey) req._requestBody.secretKey = "***";
  } catch (err) {
    return reply.code(400).send({ success: false, message: "Invalid encrypted payload" });
  }
};

const encryptMerchantResponse = (req, reply, payload, done) => {
  if (!req.isEncrypted) return done(null, payload);

  try {
    const secretKey = decryptSecret(req.apiKey.secretKeyEncrypted);
    const encrypted = encryptPayload(payload, secretKey);
    done(null, JSON.stringify({ payload: encrypted }));
  } catch (err) {
    done(null, payload);
  }
};

module.exports = { decryptMerchantPayload, encryptMerchantResponse };
