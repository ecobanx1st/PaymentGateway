const crypto = require("crypto");

const generatePublicKey = () => {
  const bytes = crypto.randomBytes(32);
  return "hash_pay_" + bytes.toString("base64url");
};

const generateSecretKey = () => {
  const bytes = crypto.randomBytes(48);
  return "hash_pay_" + bytes.toString("base64url");
};

module.exports = { generatePublicKey, generateSecretKey };
