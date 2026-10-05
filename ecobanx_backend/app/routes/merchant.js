const { MerchantApiHistory } = require("../models/merchantApiHistoryModel");
const { validateToken } = require("../middleware/authMiddleware");
const { validateButtonTransactionAuth } = require("../middleware/buttonTransactionAuth.middleware");
const { verifyMerchantToken, checkPermission } = require("../middleware/merchantAuth.middleware");
const { decryptMerchantPayload, encryptMerchantResponse } = require("../middleware/merchantEncryption.middleware");
const { attachRequestId, captureRawBody, verifyHmacSignature } = require("../middleware/merchantSecurity.middleware");
const { idempotencyMiddleware, idempotencyOnSend } = require("../middleware/idempotency.middleware");
const { zodValidate } = require("../middleware/utils/zodValidate");
const { requestWithdrawValidator, createApiKeyValidator, updateApiKeyValidator, updatePermissionsValidator, getAuthorizedTokenValidator, getDepositAddressValidator, confirmTransactionValidator, basicInfoValidator, balancesValidator, depositAddressesValidator, createTransactionValidator, createInvoiceTransactionValidator, getTxInfoValidator, getTxInfoMultiValidator, getWithdrawalHistoryValidator, getWithdrawalInfoValidator, createTransferValidator, transferTokenReceiverValidator, getTransferTokenReceiverHistoryValidator, usersDepositValidator, merchantassetvalidator } = require("../controllers/merchant/validators");
const { updateInvoiceNgetAddressValidator } = require("../controllers/merchant/validators/updateInvoiceNgetAddressValidator");
const { getAuthorizedToken } = require("../controllers/auth/getAuthorizedToken");
const { refreshMerchantToken } = require("../controllers/auth/refreshToken");
const requestWithdraw = require("../controllers/merchant/requestWithdraw");
const { getWithdrawals, getWithdrawalById, getPendingPayouts, createApiKey, listApiKeys, getApiKeyById, updateApiKey, updatePermissions, deleteApiKey, getBasicInfo, getBalances, getDepositAddress, listDepositAddresses, getApiHistory, createTransaction, createInvoiceTransaction, getTransactionInfo, getTransactionInfoMulti, getWithdrawalHistory, getWithdrawalInfo, createTransfer, confirmTransaction, getIpnHistory, getMerchantSettings, createMerchantSettings, updateMerchantSettings, transferTokenReceiver, getTransferToReceiverHistory, getMerchantAssets, getDashboard, userDeposit } = require("../controllers/merchant");
const { updateInvoiceNgetAddress } = require("../controllers/merchant/updateInvoiceNgetAddress");
const { createMerchantSettingsValidator } = require("../controllers/merchant/validators/apiKey.validator");
const { profile, updateProfile, changePassword, generate2FA, enable2FA, disable2FA, supportTicketCreate, getSupportTicket, getTicketById, closeTicket, sendMessage, markMessagesSeen, getAllNotification, markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications, getUserNetworks, getUserAssets, createKyc, editKyc, createKyb, editKyb, createWalletAddress, getuserKyc, getuserKyb, getDepositHistory, getDepositHistoryById } = require("../controllers/users");
const { createSupportTicketValidator, sendMessageValidator, getUserNetworksValidator, getUserAssetsValidator, createKycValidator, editKycValidator, createKybValidator, editKybValidator, createWalletAddressValidator, getBalancesValidator, updateProfileValidator, getDepositHistoryValidator } = require("../controllers/users/validators");
const { uploadKycImages } = require("../middleware/uploadKycImages");
const { uploadKybDocuments } = require("../middleware/uploadKybDocuments");
const { supportCategory } = require("../controllers/users");
const { getAllTransactions } = require("../controllers/merchant");
const merchant = require("../controllers/merchant");
const { merchantWithdrawLimit } = require("../controllers/merchant/merchantWithdrawLimitController");
const { merchantWithdrawLimitValidator } = require("../controllers/merchant/validators/merchantWithdrawLimitValidator");
const { merchantWithdrawApproval } = require("../controllers/merchant/merchantWithdrawApproval");
const { rejectMerchantWithdrawalValidator } = require("../controllers/merchant/validators");
const { createButtonMaker, getAllButtonMakers, getButtonMakerById, updateButtonMaker } = require("../controllers/merchant/buttonMaker.controller");
const { convertPrice } = require("../controllers/merchant/price.controller");
const { priceConvertValidator } = require("../controllers/merchant/validators/priceConvertValidator");
const { createButtonMakerValidator } = require("../controllers/merchant/validators/buttonMakerValidator");
const { updateButtonMakerValidator } = require("../controllers/merchant/validators/updateButtonMakerValidator");

module.exports = async function (fastify) {

  fastify.addHook("onRequest", attachRequestId);

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
          responseStatus: reply.statusCode,
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
  // WITHDRAWAL REQUEST
  // ──────────────────────────────────────────
  fastify.post("/withdraw", {
    preHandler: [
      validateToken(["user"], ["business"]),
      idempotencyMiddleware,
      async (req, reply) => {
        const result = await zodValidate(req, reply, requestWithdrawValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, requestWithdraw);

  // GET /merchant/api-history — View API call history
  fastify.get("/api-history", {
    preHandler: [
      validateToken(["user"]),
      // async (req, reply) => {
      //   const result = await zodValidate(req, reply, getApiHistoryValidator);
      //   if (!result.success) return;
      //   req.validatedData = result.data;
      // },
    ],
  }, getApiHistory);
  // ──────────────────────────────────────────
  // LIST OWN WITHDRAWALS
  // ──────────────────────────────────────────
  fastify.get("/withdrawals", {
    preHandler: validateToken(["user"]),
  }, getWithdrawals);

  // ──────────────────────────────────────────
  // PENDING PAYOUTS (review queue: PENDING + payOut + create_transfer)
  // NOTE: registered before /withdrawals/:id so "pending-payouts" is not treated as an id.
  // ──────────────────────────────────────────
  fastify.get("/withdrawals/pending-payouts", {
    preHandler: validateToken(["user"]),
  }, getPendingPayouts);

  // ──────────────────────────────────────────
  // GET OWN WITHDRAWAL BY ID
  // ──────────────────────────────────────────
  fastify.get("/withdrawals/:id", {
    preHandler: validateToken(["user"]),
  }, getWithdrawalById);

  // ──────────────────────────────────────────
  // MERCHANT APPROVE WITHDRAWAL
  // ──────────────────────────────────────────
  fastify.post("/withdrawals/:id/approve", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        req.validatedData = { action: "approve" };
      },
    ],
  }, merchantWithdrawApproval);

  // ──────────────────────────────────────────
  // MERCHANT REJECT WITHDRAWAL
  // ──────────────────────────────────────────
  fastify.post("/withdrawals/:id/reject", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, rejectMerchantWithdrawalValidator);
        if (!result.success) return;
        req.validatedData = { ...result.data, action: "reject" };
      },
    ],
  }, merchantWithdrawApproval);

  // ──────────────────────────────────────────
  // LIST OWN DEPOSITS / TRANSACTIONS
  // ──────────────────────────────────────────
  fastify.get("/deposit_historys", {
    preHandler: validateToken(["user"]),
  }, getTransactionInfoMulti);

  // ──────────────────────────────────────────
  // GET OWN DEPOSIT / TRANSACTION BY ID
  // ──────────────────────────────────────────
  fastify.post("/deposit_history", {
    preHandler: validateToken(["user"]),
  }, getTransactionInfo);

  // ──────────────────────────────────────────
  // GET IPN HISTORY (OWN)
  // ──────────────────────────────────────────
  fastify.post("/ipn_history", {
    preHandler: validateToken(["user"]),
  }, getIpnHistory);

  // ──────────────────────────────────────────
  // API KEY MANAGEMENT
  // ──────────────────────────────────────────

  fastify.post("/api-keys", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createApiKeyValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createApiKey);

  // GET /merchant/api-keys — List all API keys
  fastify.get("/api-keys", {
    preHandler: validateToken(["user"]),
  }, listApiKeys);

  // GET /merchant/api-keys/:id — Get API key details
  fastify.get("/api-keys/:id", {
    preHandler: validateToken(["user"]),
  }, getApiKeyById);

  // PUT /merchant/api-keys/:id — Update API key (name, IPs, status)
  fastify.put("/api-keys/:id", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateApiKeyValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateApiKey);

  // PUT /merchant/api-keys/:id/permissions — Update permissions only
  fastify.put("/api-keys/:id/permissions", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updatePermissionsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updatePermissions);

  // DELETE /merchant/api-keys/:id — Permanently delete API key
  fastify.delete("/api-keys/:id", {
    preHandler: validateToken(["user"]),

  }, deleteApiKey);

  // ──────────────────────────────────────────
  // MERCHANT SETTINGS MANAGEMENT
  // ──────────────────────────────────────────

  fastify.get("/merchantsettings", {
    preHandler: validateToken(["user"]),
  }, getMerchantSettings);

  fastify.post("/merchantsettings", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createMerchantSettingsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createMerchantSettings);

  fastify.put("/merchantsettings", {
    preHandler: validateToken(["user"]),
  }, updateMerchantSettings);


  // =========================================
  // CONFIRM TRANSACTION (amount received)
  // =========================================
  fastify.post("/confirm_transaction", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, confirmTransactionValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, confirmTransaction);

  // =========================================
  // TOKEN TRANSFER RECEIVER (deposit webhook)
  // Server-to-server webhook: the controller authenticates the caller
  // via the `apiKey` in the request body (and credits the user wallet
  // directly when the address belongs to a customer). No user Bearer
  // token is required — a user-token guard would 401 every webhook.
  // =========================================
  fastify.post("/transfer_token_receiver", {
    preHandler: [
      async (req, reply) => {
        const result = await zodValidate(req, reply, transferTokenReceiverValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, transferTokenReceiver);

  // =========================================
  // GET TRANSFER TOKEN RECEIVER HISTORY
  // =========================================
  fastify.post("/transfer_token_receiver_history", {
    preHandler: [
      verifyMerchantToken,
      async (req, reply) => {
        const result = await zodValidate(req, reply, getTransferTokenReceiverHistoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getTransferToReceiverHistory);

  // get dropdown list based on assets
  fastify.post("/assetslists", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, merchantassetvalidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getMerchantAssets);




  fastify.post("/users-deposit", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, usersDepositValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, userDeposit);


  fastify.post("/profile", { preHandler: validateToken(["user"], ["business"]) }, profile);
  fastify.post("/update-profile", { preHandler: [validateToken(["user"], ["business"]), updateProfileValidator] }, updateProfile);

  fastify.post("/change-password", { preHandler: validateToken(["user"], ["business"]) }, changePassword);

  fastify.post('/generate-2fa', {
    preHandler: validateToken(["user"], ["business"]),
  }, generate2FA);

  fastify.post('/enable-2fa', {
    preHandler: validateToken(["user"], ["business"]),
  }, enable2FA);

  fastify.post('/disable-2fa', {
    preHandler: validateToken(["user", "admin", "subadmin"], ["business"]),
  }, disable2FA);

  // =========================================
  // USER SUPPORT TICKETS
  // =========================================
  fastify.post('/support-ticket', {
    preHandler: [validateToken(["user"], ["business"]), async (req, reply) => {
      const result = await zodValidate(req, reply, createSupportTicketValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    }],
  }, supportTicketCreate);

  fastify.get('/support-tickets', {
    preHandler: validateToken(["user"], ["business"]),
  }, getSupportTicket);

  fastify.get('/support-tickets/:id', {
    preHandler: validateToken(["user"], ["business"]),
  }, getTicketById);

  fastify.post('/support-tickets/:id/close', {
    preHandler: validateToken(["user"], ["business"]),
  }, closeTicket);

  fastify.post('/support-tickets/:id/messages', {
    preHandler: [validateToken(["user"], ["business"]), async (req, reply) => {
      const result = await zodValidate(req, reply, sendMessageValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    }],
  }, sendMessage);

  fastify.post('/support-tickets/:id/seen', {
    preHandler: validateToken(["user"], ["business"]),
  }, markMessagesSeen);


  // support category module
  fastify.get('/support-category/', {
    preHandler: validateToken(["user"], ["business"]),
  }, supportCategory);


  // notification module

  fastify.get('/get-notification', {
    preHandler: validateToken(["user"], ["business"]),
  }, getAllNotification)

  fastify.patch('/notifications/:id/read', {
    preHandler: validateToken(["user"], ["business"]),
  }, markAsRead)

  fastify.patch('/notifications/read-all', {
    preHandler: validateToken(["user"], ["business"]),
  }, markAllAsRead)

  fastify.delete('/notifications/clear-all', {
    preHandler: validateToken(["user"], ["business"]),
  }, clearAllNotifications)

  fastify.get('/notifications/unread-count', {
    preHandler: validateToken(["user"], ["business"]),
  }, getUnreadCount)

  // =========================================
  // NETWORK & ASSET LISTS
  // =========================================
  fastify.post("/network/list", {
    preHandler: [
      validateToken(["user"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getUserNetworksValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getUserNetworks);

  fastify.post("/asset/list", {
    preHandler: [
      validateToken(["user"], ["business", "individual"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getUserAssetsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getUserAssets);


  fastify.post("/price/convert", {
    preHandler: [
      validateToken(["user"], ["business", "individual"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, priceConvertValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, convertPrice);



  // =========================================
  // KYC
  // =========================================
  fastify.post("/create/kyc", {
    preHandler: [
      validateToken(["user"], ["business"]),
      uploadKycImages,

      async (req, reply) => {

        const result = await zodValidate(req, reply, createKycValidator);

        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],

  }, createKyc);

  fastify.get("/kyc", {
    preHandler: validateToken(["user"], ["business"]),
  }, getuserKyc);

  fastify.put("/update/kyc", {
    preHandler: [
      validateToken(["user"], ["business"]),
      uploadKycImages,
      async (req, reply) => {
        const result = await zodValidate(req, reply, createKycValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, editKyc);

  // =========================================
  // WALLET
  // =========================================
  fastify.post("/wallet/create", {
    preHandler: [
      validateToken(["user", "admin", "subadmin"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createWalletAddressValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createWalletAddress);


  // =========================================
  // KYB
  // =========================================
  fastify.post("/create-kyb", {
    preHandler: [
      validateToken(["user"], ["business"]),
      uploadKybDocuments,
      async (req, reply) => {
        const result = await zodValidate(req, reply, createKybValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createKyb);

  fastify.get("/kyb-status", {
    preHandler: validateToken(["user"], ["business"]),
  }, getuserKyb);

  fastify.put("/update-kyb", {
    preHandler: [
      validateToken(["user"], ["business"]),
      uploadKybDocuments,
      async (req, reply) => {
        const result = await zodValidate(req, reply, createKybValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, editKyb);


  // business wallet balance
  fastify.post("/wallet/balances", {
    preHandler: [
      validateToken(["user"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getBalancesValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getBalances);

  // =========================================
  // DEPOSIT HISTORY
  // =========================================
  fastify.post("/deposit-history", {
    preHandler: [
      validateToken(["user"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getDepositHistoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getDepositHistory);

  fastify.get("/deposit-history/:id", {
    preHandler: validateToken(["user"], ["business"]),
  }, getDepositHistoryById);

  // get-dashboard-data
  fastify.post("/dashboard-data", {
    preHandler: [
      validateToken(["user"], ["business", "individual"]),

    ],
  }, getDashboard);


  // get-usertranscation-historys
  fastify.post("/getAllTransactions", {
    preHandler: [
      validateToken(["user"], ["business"]),

    ],
  }, getAllTransactions);

  fastify.post("/button-maker", {
    preHandler: [
      validateToken(["user"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createButtonMakerValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createButtonMaker);

  fastify.get("/button-makers", {
    preHandler: validateToken(["user"], ["business"]),
  }, getAllButtonMakers);

  fastify.get("/button-maker/:id", {
    preHandler: validateToken(["user"], ["business"]),
  }, getButtonMakerById);

  fastify.post("/update-button-maker", {
    preHandler: [
      validateToken(["user"], ["business"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateButtonMakerValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateButtonMaker);

  fastify.post(
    "/withdraw-limit",
    {
      preHandler: [
        validateToken(["user"]),
        async (req, reply) => {

          // Empty body = GET operation
          if (
            !req.body ||
            Object.keys(req.body).length === 0
          ) {
            req.validatedData = {};
            return;
          }

          const result = await zodValidate(
            req,
            reply,
            merchantWithdrawLimitValidator
          );

          if (!result.success) return;

          req.validatedData = result.data;
        },
      ],
    },
    merchantWithdrawLimit);

     fastify.post("/create_button_transaction", {
        preHandler: [
          validateButtonTransactionAuth,
          async (req, reply) => {
            const result = await zodValidate(req, reply, createTransactionValidator);
            if (!result.success) return;
            req.validatedData = result.data;
          },
        ],
      }, createTransaction);

       fastify.post("/create_invoice_transaction", {
        preHandler: [
          validateButtonTransactionAuth,
          async (req, reply) => {
            const result = await zodValidate(req, reply, createInvoiceTransactionValidator);
            if (!result.success) return;
            req.validatedData = result.data;
          },
        ],
      }, createInvoiceTransaction);

      fastify.post("/update_invoice_transaction", {
        preHandler: [
          validateButtonTransactionAuth,
          async (req, reply) => {
            const result = await zodValidate(req, reply, updateInvoiceNgetAddressValidator);
            if (!result.success) return;
            req.validatedData = result.data;
          },
        ],
      }, updateInvoiceNgetAddress);

      fastify.post("/update_invoice_get_address", {
        preHandler: [
          validateButtonTransactionAuth,
          async (req, reply) => {
            const result = await zodValidate(req, reply, updateInvoiceNgetAddressValidator);
            if (!result.success) return;
            req.validatedData = result.data;
          },
        ],
      }, updateInvoiceNgetAddress);
};

