const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not set");
  return crypto.createHash("sha256").update(key).digest();
};

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

const decrypt = (encryptedText) => {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encrypted = parts.join(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encrypt, decrypt };
