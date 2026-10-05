const { MerchantApiHistory } = require("../models/merchantApiHistoryModel");
const { validateToken } = require("../middleware/authMiddleware");
const { verifyMerchantToken, checkPermission } = require("../middleware/merchantAuth.middleware");
const { checkApiKeyIp } = require("../middleware/merchantApiIp.middleware");
const { decryptMerchantPayload, encryptMerchantResponse } = require("../middleware/merchantEncryption.middleware");
const { attachRequestId, captureRawBody, verifyHmacSignature } = require("../middleware/merchantSecurity.middleware");
const { idempotencyMiddleware, idempotencyOnSend } = require("../middleware/idempotency.middleware");
const { zodValidate } = require("../middleware/utils/zodValidate");
const { requestWithdrawValidator, createApiKeyValidator, updateApiKeyValidator, updatePermissionsValidator, getAuthorizedTokenValidator, getDepositAddressValidator, confirmTransactionValidator, basicInfoValidator, balancesValidator, depositAddressesValidator, createTransactionValidator, getTxInfoValidator, getTxInfoMultiValidator, getWithdrawalHistoryValidator, getWithdrawalInfoValidator, createTransferValidator, transferTokenReceiverValidator, getTransferTokenReceiverHistoryValidator, usersDepositValidator, merchantassetvalidator, generateQrCodeValidator } = require("../controllers/merchant/validators");
const { getAuthorizedToken } = require("../controllers/auth/getAuthorizedToken");
const { refreshMerchantToken } = require("../controllers/auth/refreshToken");
const requestWithdraw = require("../controllers/merchant/requestWithdraw");
const { getWithdrawals, getWithdrawalById, createApiKey, listApiKeys, getApiKeyById, updateApiKey, updatePermissions, deleteApiKey, getBasicInfo, getBalances, getDepositAddress, listDepositAddresses, getApiHistory, createTransaction, getTransactionInfo, getTransactionInfoMulti, getWithdrawalHistory, getWithdrawalInfo, createTransfer, confirmTransaction, getIpnHistory, getMerchantSettings, createMerchantSettings, updateMerchantSettings, transferTokenReceiver, getTransferToReceiverHistory, getMerchantAssets, getDashboard, userDeposit, supportedAssets, supportedNetworks,getQRCode } = require("../controllers/merchant");
const { createMerchantSettingsValidator } = require("../controllers/merchant/validators/apiKey.validator");
const { profile, updateProfile, changePassword, generate2FA, enable2FA, disable2FA, supportTicketCreate, getSupportTicket, getTicketById, closeTicket, sendMessage, markMessagesSeen, getAllNotification, markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications, getUserNetworks, getUserAssets, createKyc, editKyc, createKyb, editKyb, createWalletAddress, getuserKyc, getuserKyb, getDepositHistory, getDepositHistoryById } = require("../controllers/users");
const { createSupportTicketValidator, sendMessageValidator, getUserNetworksValidator, getUserAssetsValidator, createKycValidator, editKycValidator, createKybValidator, editKybValidator, createWalletAddressValidator, getBalancesValidator, updateProfileValidator, getDepositHistoryValidator } = require("../controllers/users/validators");
const { uploadKycImages } = require("../middleware/uploadKycImages");
const { uploadKybDocuments } = require("../middleware/uploadKybDocuments");
const { supportCategory } = require("../controllers/users");
const { getAllTransactions } = require("../controllers/merchant");
const rateLimiter = require("../middleware/rateLimiter");


const merchantApiRateLimit = rateLimiter({
  merchantApi: true,
  limit: 5,
  windowSeconds: 120,
  noAuthLimit: 3,
  noAuthWindowSeconds: 60,
});

module.exports = async function (fastify) {
  // ──────────────────────────────────────────
  // GLOBAL HOOKS (run on all routes in this plugin)
  // ──────────────────────────────────────────

  // Capture raw body string BEFORE any parsing
  fastify.addHook("preParsing", captureRawBody);

  // Attach request ID to every request
  fastify.addHook("onRequest", attachRequestId);
  fastify.addHook("preHandler", merchantApiRateLimit);

  // Capture request body for history logging
  fastify.addHook("preHandler", (req, reply, done) => {
    if (req.body && typeof req.body === "object" && !req.body.payload) {
      req._requestBody = JSON.parse(JSON.stringify(req.body));
      if (req._requestBody.privatekey) req._requestBody.privatekey = "***";
      if (req._requestBody.secretKey) req._requestBody.secretKey = "***";
    }
    done();
  });

  // Capture response body for history
  fastify.addHook("onSend", (req, reply, payload, done) => {
    try {
      reply._responseBody = JSON.parse(payload);
    } catch {
      reply._responseBody = payload;
    }
    reply._responseStatus = reply.statusCode;
    done();
  });

  // Log API history
  fastify.addHook("onResponse", async (req, reply) => {
    const path = req.routerPath || req.url;
    if (req.user && req.user.merchantId) {
      try {
        const res = reply._responseBody || {};
        await MerchantApiHistory.create({
          merchantId: req.user.merchantId,
          apiKeyId: req.user.apiKeyId || null,
          endpoint: path,
          method: req.method,
          requestBody: req._requestBody || null,
          responseStatus: reply._responseStatus ?? reply.statusCode,
          success: res.success ?? (reply.statusCode < 400),
          message: res.message || (reply.statusCode < 400 ? "Success" : "Request failed"),
          ip: req.ip,
        });
      } catch (err) {
        req.log.error({ err }, "Failed to log merchant API history");
      }
    }
  });

  // Encrypt response if request was encrypted
  fastify.addHook("onSend", encryptMerchantResponse);

  // Idempotency — cache response on send
  fastify.addHook("onSend", idempotencyOnSend);

  // ──────────────────────────────────────────
  // GET AUTHORIZED TOKEN (no PASETO auth)
  // ──────────────────────────────────────────
  fastify.post("/get-authorized-token", {
    preHandler: async (req, reply) => {
      const result = await zodValidate(req, reply, getAuthorizedTokenValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    },
  }, getAuthorizedToken);

  // ──────────────────────────────────────────
  // REFRESH TOKEN
  // ──────────────────────────────────────────
  fastify.post("/refresh-token", {}, refreshMerchantToken);

  // ──────────────────────────────────────────
  // MERCHANT API (token-based, permission-gated)
  // ──────────────────────────────────────────
  // Each route: verifyMerchantToken → verifyHmacSignature → decryptMerchantPayload → checkPermission

  // POST /merchant/get_basic_info — Get merchant profile
  fastify.post("/get_basic_info", {
    preHandler: [
      verifyMerchantToken,
      merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("basicInfo"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, basicInfoValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getBasicInfo);

  // POST /merchant/balances — Get coin balances
  fastify.post("/balances", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("getBalance"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, balancesValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getBalances);

  // POST /merchant/get_deposit_address — Generate new deposit address
  fastify.post("/get_deposit_address", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("deposit"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getDepositAddressValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getDepositAddress);

  // POST /merchant/deposit_addresses — List all generated deposit addresses
  fastify.post("/deposit_addresses", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("deposit"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, depositAddressesValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, listDepositAddresses);

  // GET /merchant/api-history — View API call history
  fastify.get("/api-history", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
    ],
  }, getApiHistory);

  // =========================================
  // CREATE TRANSACTION (custom checkout)
  // =========================================
  fastify.post("/create_transaction", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      idempotencyMiddleware,
      checkPermission("createTransaction"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createTransactionValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createTransaction);

  // =========================================
  // GET TX INFO
  // =========================================
  fastify.post("/get_tx_info", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,

      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("getTransaction"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getTxInfoValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getTransactionInfo);

  // =========================================
  // GET TX INFO MULTI
  // =========================================
  fastify.post("/get_tx_info_multi", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("getTransaction"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getTxInfoMultiValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getTransactionInfoMulti);

  // =========================================
  // GET WITHDRAWAL HISTORY
  // =========================================
  fastify.post("/get_withdrawal_history", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("getWithdrawHistory"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getWithdrawalHistoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getWithdrawalHistory);

  // =========================================
  // GET WITHDRAWAL INFO
  // =========================================
  fastify.post("/get_withdrawal_info", {
    preHandler: [
      verifyMerchantToken, merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      checkPermission("getWithdrawHistory"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getWithdrawalInfoValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getWithdrawalInfo);

  // ──────────────────────────────────────────
  // CREATE TRANSFER
  // ──────────────────────────────────────────
  fastify.post("/create_transfer", {
    preHandler: [
      verifyMerchantToken,
      merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      idempotencyMiddleware,
      checkPermission("withdraw"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createTransferValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createTransfer);

fastify.post("/get_QRCode", {
    preHandler: [
      verifyMerchantToken,
      merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      idempotencyMiddleware,
      checkPermission("deposit"),
      async (req, reply) => {
        const result = await zodValidate(req, reply, generateQrCodeValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getQRCode);

  fastify.post("/assetList", {
    preHandler: [
      verifyMerchantToken,
      merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      idempotencyMiddleware,
      checkPermission("withdraw"),
    ],
  }, supportedAssets);

  fastify.post("/networksList", {
    preHandler: [
      verifyMerchantToken,
      merchantApiRateLimit,
      checkApiKeyIp,
      verifyHmacSignature,
      decryptMerchantPayload,
      idempotencyMiddleware,
      checkPermission("withdraw"),
    ],
  }, supportedNetworks);
};
