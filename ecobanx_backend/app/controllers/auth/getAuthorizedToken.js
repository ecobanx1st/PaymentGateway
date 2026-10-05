const { MerchantApiKey } = require("../../models/merchantApiKeyModel");
const { Users } = require("../../models/usersModel");
const { Transaction } = require("../../models/transactionModel");
const { MerchantApiHistory } = require("../../models/merchantApiHistoryModel");
const { generateApiTokens, verifyRefreshToken, generateAccessToken, generateCheckoutToken } = require("../../middleware/utils/pasetoService");
const { decrypt } = require("../../services/encryption/encryptData");

const CHECKOUT_TOKEN_TTL_MS = 30 * 60 * 1000;
const PROCESSING_STATUSES = ["pending", "paid", "underpaid"];

const getAuthorizedToken = async (req, reply) => {
  try {
    const { publickey, privatekey, txn_id } = req.validatedData;
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection?.remoteAddress;


    console.log("========== IP CHECK ==========");
    console.log("req.ip:", req.ip);
    console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
    console.log("remoteAddress:", req.connection?.remoteAddress);
    console.log("clientIp:", clientIp);
    console.log("===============================");


    if (txn_id) {
      const tx = await Transaction.findOne({ txnId: txn_id })
        .select("txnId status")
        .lean();

      if (!tx) {
        return reply.code(404).send({
          success: false,
          message: "Transaction not found",
        });
      }

      if (!PROCESSING_STATUSES.includes(tx.status)) {
        return reply.code(403).send({
          success: false,
          message: `Checkout token unavailable: transaction is ${tx.status}`,
        });
      }

      const token = await generateCheckoutToken(
        { txnId: tx.txnId },
        CHECKOUT_TOKEN_TTL_MS
      );

      return reply.code(200).send({
        success: true,
        result: {
          access_token: "Bearer " + token.accessToken,
          expires_in: Math.floor((token.expiresAt - new Date()) / 1000),
        },
        message: "Checkout token generated successfully",
      });
    }

    const apiKey = await MerchantApiKey.findOne({
      publicKey: publickey,
      status: "ACTIVE",
    }).lean();

    if (!apiKey) {
      return reply.code(401).send({
        success: false,
        message: "Invalid API credentials1.",
      });
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return reply.code(401).send({
        success: false,
        message: "Invalid API credentials2.",
      });
    }

    if (apiKey.ipRestrictions && apiKey.ipRestrictions.length > 0) {
      const { isIPInCIDR } = require("../../utils/ipValidator");
      const allowed = apiKey.ipRestrictions.some((restriction) => {
        if (restriction === clientIp) return true;
        if (restriction.includes("/")) return isIPInCIDR(clientIp, restriction);
        return false;
      });
      if (!allowed) {
        return reply.code(401).send({
          success: false,
          message: "IP Blocked.",
        });
      }
    }


    console.log("========== IP DEBUG ==========");
    console.log("req.ip:", req.ip);
    console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
    console.log("remoteAddress:", req.connection?.remoteAddress);
    console.log("clientIp:", clientIp);
    console.log("allowed IPs:", apiKey?.ipRestrictions);
    console.log("==============================");

    const decryptedSecret = decrypt(apiKey.secretKeyEncrypted);
    if (privatekey !== decryptedSecret) {
      return reply.code(401).send({
        success: false,
        message: "Invalid API credentials4.",
      });
    }

    const user = await Users.findById(apiKey.merchantId).lean();
    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "Invalid API credentials5.",
      });
    }

    await MerchantApiKey.findByIdAndUpdate(apiKey._id, {
      $set: { lastUsedAt: new Date(), lastUsedIp: clientIp },
    });

    const token = await generateApiTokens({
      id: user._id,
      apiKeyId: apiKey._id,
      publicKey: apiKey.publicKey,
    });

    MerchantApiHistory.create({
      merchantId: apiKey.merchantId,
      apiKeyId: apiKey._id,
      endpoint: req.routerPath || req.url,
      method: req.method,
      requestBody: { publickey: "***", privatekey: "***" },
      responseStatus: 200,
      ip: clientIp,
    }).catch((err) => req.log.error({ err }, "Failed to log token history"));

    return reply.code(200).send({
      success: true,
      result: {
        access_token: "Bearer " + token.accessToken,
        // refresh_token: token.refreshToken,
        // this token valid for 15 min or 900 seconds
        // expires_in: Math.floor((token.expiresAt - new Date()) / 1000),
        // refresh_expires_in: Math.floor((token.refreshExpiresAt - new Date()) / 1000),
      },
      message: "Token generated successfully",
    });
  } catch (error) {
    console.error("API login error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getAuthorizedToken };
