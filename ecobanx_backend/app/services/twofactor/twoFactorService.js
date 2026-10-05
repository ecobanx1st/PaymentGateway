const speakeasy = require("speakeasy");

const TWO_FACTOR_NAME = "Ecobanx";

const generateSecret = (email) => {
  return speakeasy.generateSecret({
    length: 20,
    name: `${TWO_FACTOR_NAME} (${email})`,
    issuer: TWO_FACTOR_NAME,
  });
};

const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: token.toString().trim(),
    window: 1,
  });
};

const enableForUser = async (user, token) => {
  if (!user.twoFactorSecret) {
    throw { status: 400, message: "Please generate 2FA first" };
  }
  if (user.twoFactorEnabled) {
    throw { status: 400, message: "2FA is already enabled" };
  }
  const verified = verifyToken(user.twoFactorSecret, token);
  if (!verified) {
    throw { status: 400, message: "Invalid OTP" };
  }
  user.twoFactorEnabled = true;
  await user.save();
  return user;
};

const disableForUser = async (user, token) => {
  if (!user.twoFactorSecret) {
    throw { status: 400, message: "2FA not enabled" };
  }
  const verified = verifyToken(user.twoFactorSecret, token);
  if (!verified) {
    throw { status: 400, message: "Invalid OTP" };
  }
  user.twoFactorEnabled = false;
  await user.save();
  return user;
};

module.exports = {
  generateSecret,
  verifyToken,
  enableForUser,
  disableForUser,
};
