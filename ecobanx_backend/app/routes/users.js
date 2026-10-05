const { zodValidate } = require("../middleware/utils/zodValidate");
const { validateToken } = require("../middleware/authMiddleware");
const { uploadKycImages } = require("../middleware/uploadKycImages");
const { uploadKybDocuments } = require("../middleware/uploadKybDocuments");
const { idempotencyMiddleware, idempotencyOnSend } = require("../middleware/idempotency.middleware");

const { profile, updateProfile, changePassword, generate2FA, enable2FA, disable2FA, supportTicketCreate, getSupportTicket, getTicketById, closeTicket, sendMessage, markMessagesSeen, getAllNotification, markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications, getUserNetworks, getUserAssets, createKyc, editKyc, createKyb, editKyb, createWalletAddress, getuserKyc, getuserKyb } = require("../controllers/users");
const { createSupportTicketValidator, sendMessageValidator, getUserNetworksValidator, getUserAssetsValidator, createKycValidator, editKycValidator, createKybValidator, editKybValidator, createWalletAddressValidator, getBalancesValidator, updateProfileValidator } = require("../controllers/users/validators");
const { supportCategory } = require("../controllers/users");
const { getBalances, requestWithdraw, transferTokenReceiver, getWithdrawalById } = require("../controllers/merchant");
const { getDepositHistory, getDepositHistoryById } = require("../controllers/users");
const { getDepositHistoryValidator } = require("../controllers/users/validators");
const { getDashboard } = require("../controllers/merchant");
const { getAllTransactions } = require("../controllers/merchant");
const { requestWithdrawValidator, transferTokenReceiverValidator } = require("../controllers/merchant/validators");

module.exports = async function (fastify) {

  fastify.post("/profile", { preHandler: validateToken(["user"]) }, profile);

  fastify.post("/update-profile", { preHandler: [validateToken(["user"]), updateProfileValidator] }, updateProfile);

  fastify.post("/change-password", { preHandler: validateToken(["user"]) }, changePassword);

  fastify.post('/generate-2fa', {
    preHandler: validateToken(["user"]),
  }, generate2FA);

  fastify.post('/enable-2fa', {
    preHandler: validateToken(["user"]),
  }, enable2FA);

  fastify.post('/disable-2fa', {
    preHandler: validateToken(["user", "admin", "subadmin"]),
  }, disable2FA);

  // =========================================
  // USER SUPPORT TICKETS
  // =========================================
  fastify.post('/support-ticket', {
    preHandler: [validateToken(["user"]), async (req, reply) => {
      const result = await zodValidate(req, reply, createSupportTicketValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    }],
  }, supportTicketCreate);

  fastify.get('/support-tickets', {
    preHandler: validateToken(["user"]),
  }, getSupportTicket);

  fastify.get('/support-tickets/:id', {
    preHandler: validateToken(["user"]),
  }, getTicketById);

  fastify.post('/support-tickets/:id/close', {
    preHandler: validateToken(["user"]),
  }, closeTicket);

  fastify.post('/support-tickets/:id/messages', {
    preHandler: [validateToken(["user"]), async (req, reply) => {
      const result = await zodValidate(req, reply, sendMessageValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    }],
  }, sendMessage);

  fastify.post('/support-tickets/:id/seen', {
    preHandler: validateToken(["user"]),
  }, markMessagesSeen);


  // support category module
  fastify.get('/support-category/', {
    preHandler: validateToken(["user"]),
  }, supportCategory);


  // notification module

  fastify.get('/get-notification', {
    preHandler: validateToken(["user"]),
  }, getAllNotification)

  fastify.patch('/notifications/:id/read', {
    preHandler: validateToken(["user"]),
  }, markAsRead)

  fastify.patch('/notifications/read-all', {
    preHandler: validateToken(["user"]),
  }, markAllAsRead)

  fastify.delete('/notifications/clear-all', {
    preHandler: validateToken(["user"]),
  }, clearAllNotifications)

  fastify.get('/notifications/unread-count', {
    preHandler: validateToken(["user"]),
  }, getUnreadCount)

  // =========================================
  // NETWORK & ASSET LISTS
  // =========================================
  fastify.post("/network/list", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getUserNetworksValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getUserNetworks);

  fastify.post("/asset/list", {
    preHandler: [
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getUserAssetsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getUserAssets);



  // =========================================
  // KYC
  // =========================================
  fastify.post("/create/kyc", {
    preHandler: [
      validateToken(["user"]),
      uploadKycImages,

      async (req, reply) => {

        const result = await zodValidate(req, reply, createKycValidator);

        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],

  }, createKyc);

  fastify.get("/kyc", {
    preHandler: validateToken(["user"]),
  }, getuserKyc);

  fastify.put("/update/kyc", {
    preHandler: [
      validateToken(["user"]),
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
      validateToken(["user", "admin", "subadmin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createWalletAddressValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createWalletAddress);


  fastify.get("/withdrawals/:id", {
    preHandler: validateToken(["user"]),
  }, getWithdrawalById);



  // =========================================
  // KYB
  // =========================================
  fastify.post("/kyb/create", {
    preHandler: [
      validateToken(["user"]),
      uploadKybDocuments,
      async (req, reply) => {
        const result = await zodValidate(req, reply, createKybValidator);

        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createKyb);

  fastify.get("/kyb/user", {
    preHandler: validateToken(["user"]),
  }, getuserKyb);

  fastify.put("/kyb/edit", {
    preHandler: [
      validateToken(["user"]),
      uploadKybDocuments,
      async (req, reply) => {
        const result = await zodValidate(req, reply, createKybValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, editKyb);


  // merchant balance
  fastify.post("/balances", {
    preHandler: [
      validateToken(["user"]),
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
      validateToken(["user"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getDepositHistoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getDepositHistory);

  fastify.get("/deposit-history/:id", {
    preHandler: validateToken(["user"]),
  }, getDepositHistoryById);


  // get-dashboard-data
  fastify.post("/dashboard-data", {
    preHandler: [
      validateToken(["user"]),

    ],
  }, getDashboard);


  // get-usertranscation-historys
  fastify.post("/getAllTransactions", {
    preHandler: [
      validateToken(["user"]),

    ],
  }, getAllTransactions);



  // ──────────────────────────────────────────
  // WITHDRAWAL REQUEST
  // ──────────────────────────────────────────
  fastify.post("/withdraw", {
    preHandler: [
      validateToken(["user"]),
      idempotencyMiddleware,
      async (req, reply) => {
        const result = await zodValidate(req, reply, requestWithdrawValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, requestWithdraw);


  fastify.post("/transfer_token_receiver", {
    preHandler: [
      async (req, reply) => {
        const result = await zodValidate(req, reply, transferTokenReceiverValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, transferTokenReceiver);


};
