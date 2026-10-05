const { Users } = require("../../models/usersModel");
const { MerchantApiKey } = require("../../models/merchantApiKeyModel");
const { verifyRefreshToken, generateToken, generateApiTokens } = require("../../middleware/utils/pasetoService");

// ──────────────────────────────────────────
// User session refresh (auth.js login flow)
// ──────────────────────────────────────────
const refreshAccessToken = async (req, reply) => {
  try {
    const { refreshToken: token } = req.body || {};

    if (!token) {
      return reply.code(400).send({
        success: false,
        message: "Refresh token is required",
      });
    }

    let payload;
    try {
      payload = await verifyRefreshToken(token);
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    if (!payload.id || !payload.unique_id) {
      return reply.code(401).send({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await Users.findById(payload.id).select("-password -twoFactorSecret").lean();
    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "User not found",
      });
    }

    const tokens = await generateToken({
      id: user._id,
      unique_id: user.unique_id,
      role: user.role,
    });

    return reply.code(200).send({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: "2h",
      },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("refreshAccessToken error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// ──────────────────────────────────────────
// Merchant API key token refresh (merchant.js)
// ──────────────────────────────────────────
const refreshMerchantToken = async (req, reply) => {
  try {
    const { refresh_token } = req.body || {};

    if (!refresh_token) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: refresh_token",
      });
    }

    let payload;
    try {
      payload = await verifyRefreshToken(refresh_token);
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    if (!payload.apiKeyId) {
      return reply.code(401).send({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const apiKey = await MerchantApiKey.findById(payload.apiKeyId)
      .select("status expiresAt")
      .lean();

    if (!apiKey || apiKey.status !== "ACTIVE") {
      return reply.code(401).send({
        success: false,
        message: "API key has been revoked",
      });
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return reply.code(401).send({
        success: false,
        message: "API key has expired",
      });
    }

    const tokens = await generateApiTokens({
      id: payload.id,
      apiKeyId: payload.apiKeyId,
    });

    return reply.code(200).send({
      success: true,
      result: {
        access_token: "Bearer " + tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: Math.floor((tokens.expiresAt - new Date()) / 1000),
        refresh_expires_in: Math.floor((tokens.refreshExpiresAt - new Date()) / 1000),
      },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("refreshMerchantToken error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { refreshAccessToken, refreshMerchantToken };
