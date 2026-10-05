const crypto = require("crypto");
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const getKey = (secret) => {
  return crypto.createHash("sha256").update(secret).digest();
};

const encrypt = (text, secret) => {
  const key = getKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

const decrypt = (encryptedText, secret) => {
  const key = getKey(secret);
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encrypted = parts.join(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encrypt, decrypt };
