const { adminLogin } = require("../controllers/auth/adminLogin");
const { changePassword } = require("../controllers/auth/changePassword");
const { getAdminDetails } = require("../controllers/auth/getAdminDetails");
const { validateToken } = require("../middleware/authMiddleware");
const { zodValidate } = require("../middleware/utils/zodValidate");
const { generate2FA } = require("../controllers/auth/generate2FA");
const { enable2FA } = require("../controllers/auth/enable2FA");
const { disable2FA } = require("../controllers/auth/disable2FA");

const { adminLoginValidator } = require("../controllers/auth/vaidators");

// support ticket admin controllers
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllTickets,
  getTicketById,
  adminReply,
  updateTicketStatus,
  markMessagesSeen,
  GetAllMerchantLists,
  getAllDepositAddress,
  getBothAddress
} = require("../controllers/admin");

// support ticket validators
const {
  createCategoryValidator,
  updateCategoryValidator,
  updateTicketStatusValidator,
  adminReplyValidator,
  addcommissionValidator,
  updatecommissionValidator,
  deletecommissionValidator,
} = require("../controllers/admin/validators");
const { updateAdminDetails } = require("../controllers/auth/updateAdminDetails");
const { uploadAssetImage } = require("../middleware/uploadAssetImages");
const { getAllNotification, createNetwork, updateNetwork, deleteNetwork, hardDeleteNetwork, toggleNetworkStatus, getNetworkDetails, getAllNetworks, createAsset, updateAsset, deleteAsset, hardDeleteAsset, toggleAssetStatus, getAssetDetails, getAllAssets, getAssetsGroupedByNetwork, getAllKyc, getSingleKyc, approveKyc, rejectKyc, getAllKyb, getKybDetails, approveKyb, rejectKyb, markAsRead, markAllAsRead, getUnreadCount, clearAllNotifications } = require("../controllers/admin");
const { addCommission } = require("../controllers/admin/addcommission");
const { getCommission } = require("../controllers/admin/getCommission");
const { updateCommission } = require("../controllers/admin/updateCommission");
const { deleteCommission } = require("../controllers/admin/deleteCommission");
const {
  createNetworkValidator,
  updateNetworkValidator,
  deleteNetworkValidator,
  getNetworkDetailsValidator,
  getAllNetworksValidator,
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetDetailsValidator,
  getAllAssetsValidator,
  getAllKycValidator,
  rejectKycValidator,
  getAllKybValidator,
  rejectKybValidator,
  blockusersValidator
} = require("../controllers/admin/validators");

const {
  getAllWithdrawals,
  getWithdrawalDetail,
  approveWithdrawal,
  rejectWithdrawal,
} = require("../controllers/admin/withdrawalController");

const {
  depositTransactionHistory,
  depositTransactionHistoryById,
} = require("../controllers/admin/depositTransactionController");

const {
  GetAllDepositeHistory,
  getDepositHistoryById,
} = require("../controllers/admin");

const { getIpnHistory, blockusers, disable2FAUser } = require("../controllers/admin");
const { getAdminDashboard } = require("../controllers/admin");

const {
  rejectWithdrawalValidator,
} = require("../controllers/admin/validators/withdrawal.validator");
const { getWithdrawLimit, updateWithdrawLimit } = require("../controllers/admin/withdrawFee.controller");
const { getContractAddress } = require("../controllers/admin/getContractAddress");

module.exports = async function (fastify) {

  // ✅ ADMIN LOGIN
  fastify.post("/admin-login", {
    preHandler: async (req, reply) => {
      const result = await zodValidate(req, reply, adminLoginValidator);
      if (!result.success) return;
      req.validatedData = result.data;
    },
  }, adminLogin);

  // GET ADMIN DETAILS
  fastify.get("/details", {
    preHandler: validateToken(["admin", "sub_admin"])
  }, getAdminDetails);


  fastify.post("/update-details", {
    preHandler: validateToken(["admin", "sub_admin"])
  }, updateAdminDetails);

  // total merchant
  fastify.post("/get-merchant-lists", {
    preHandler: validateToken(["admin", "sub_admin"])
  }, GetAllMerchantLists);





  fastify.post("/change-password", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, changePassword);

  fastify.post('/generate-2fa', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, generate2FA);

  fastify.post('/enable-2fa', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, enable2FA);

  fastify.post('/disable-2fa', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, disable2FA);

  // =========================================
  // SUPPORT TICKET CATEGORIES
  // =========================================
  fastify.post("/support-ticket-category", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createCategoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createCategory);

  fastify.get("/support-ticket-category", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getCategories);

  fastify.get("/support-ticket-category/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getCategoryById);

  fastify.put("/support-ticket-category/:id", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateCategoryValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateCategory);

  fastify.delete("/support-ticket-category/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, deleteCategory);

  // =========================================
  // SUPPORT TICKET MANAGEMENT (ADMIN)
  // =========================================
  fastify.get("/support-tickets", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getAllTickets);

  fastify.get("/support-tickets/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getTicketById);

  fastify.post("/support-tickets/:id/reply", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, adminReplyValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, adminReply);

  fastify.post("/support-tickets/:id/status", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateTicketStatusValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateTicketStatus);

  fastify.post("/support-tickets/:id/seen", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, markMessagesSeen);



  // commission management
  fastify.post(
    "/add-commission",
    { preHandler: validateToken(["admin", "sub-admin"]) },
    async (req, reply) => {
      const validated = await zodValidate(req, reply, addcommissionValidator);
      if (!validated.success) return;
      req.validatedData = validated.data;
      return addCommission(req, reply);
    }
  );

  // get commission 
  fastify.get(
    "/get-commission",
    { preHandler: validateToken(["admin", "sub-admin"]) },
    async (req, reply) => {
      return getCommission(req, reply);
    }
  );

  // update commission
  fastify.post(
    "/update-commission",
    { preHandler: validateToken(["admin", "sub-admin"]) },
    async (req, reply) => {
      const validated = await zodValidate(req, reply, updatecommissionValidator);
      if (!validated.success) return;
      req.validatedData = validated.data;
      return updateCommission(req, reply);
    }
  );

  // delete commission
  fastify.post(
    "/delete-commission",
    { preHandler: validateToken(["admin", "sub-admin"]) },
    async (req, reply) => {
      const validated = await zodValidate(req, reply, deletecommissionValidator);
      if (!validated.success) return;
      req.validatedData = validated.data;
      return deleteCommission(req, reply);
    }
  );



  fastify.get('/get-all-notification', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getAllNotification)

  fastify.patch('/notifications/read-all', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, markAllAsRead)

  fastify.patch('/notifications/:notificationId/read', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, markAsRead)

  fastify.get('/notifications/unread-count', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getUnreadCount)

  fastify.delete('/notifications/clear-all', {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, clearAllNotifications)

  // =========================================
  // NETWORK MANAGEMENT
  // =========================================
  fastify.post("/network/create", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, createNetworkValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, createNetwork);

  fastify.post("/network/update", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateNetworkValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateNetwork);

  fastify.post("/network/soft-delete", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, deleteNetworkValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, toggleNetworkStatus);

  fastify.post("/network/details", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getNetworkDetailsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getNetworkDetails);

  fastify.post("/create-network", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getAllNetworksValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getAllNetworks);



  fastify.post("/network/hard-delete", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, deleteNetworkValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, hardDeleteNetwork);

  // =========================================
  // ASSET MANAGEMENT
  // =========================================
  fastify.post(
    "/asset/create",
    {
      preHandler: [
        validateToken(["admin", "sub-admin"]),
        uploadAssetImage,

        async (req, reply) => {
          // Parse JSON string from multipart/form-data
          if (typeof req.body.networks === "string") {
            try {
              req.body.networks = JSON.parse(req.body.networks);
            } catch (err) {
              return reply.code(400).send({
                success: false,
                message: "Invalid networks JSON",
              });
            }
          }

          const result = await zodValidate(req, reply, createAssetValidator);
          if (!result.success) return;

          req.validatedData = result.data;
        },
      ],
    },
    createAsset
  );

  fastify.post("/asset/update", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      uploadAssetImage,
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateAssetValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateAsset);

  fastify.post("/asset/soft-delete", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, deleteAssetValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, toggleAssetStatus);

  fastify.post("/asset/details", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getAssetDetailsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getAssetDetails);

  fastify.post("/create-asset", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, getAllAssetsValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, getAllAssets);



  fastify.post("/asset/hard-delete", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, deleteAssetValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, hardDeleteAsset);

  // =========================================
  // KYC MANAGEMENT
  // =========================================
  fastify.get("/kyc", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),

      async (req, reply) => {
        const result = getAllKycValidator.safeParse(req.query);

        if (!result.success) {
          return reply.code(400).send({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map((error) => ({
              field: error.path.join("."),
              message: error.message,
            })),
            result: null,
          });
        }

        req.validatedData = result.data;
      },
    ],
  }, getAllKyc);


  fastify.get("/kyc/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getSingleKyc);

  fastify.patch("/kyc/:id/approve", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, approveKyc);

  fastify.patch("/kyc/:id/reject", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, rejectKycValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, rejectKyc);

  // =========================================
  // WITHDRAWAL MANAGEMENT
  // =========================================

  fastify.get("/withdrawals", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getAllWithdrawals);

  fastify.get("/withdrawals/:withdrawId", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getWithdrawalDetail);

  fastify.post("/withdrawals/:withdrawId/approve", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, approveWithdrawal);

  fastify.post("/withdrawals/:withdrawId/reject", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, rejectWithdrawalValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],

  }, rejectWithdrawal);

  // =========================================
  // DEPOSIT / TRANSACTION MANAGEMENT (ADMIN)
  // =========================================

  fastify.get("/deposits", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, depositTransactionHistory);

  fastify.get("/deposits/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, depositTransactionHistoryById);

  // =========================================
  // DEPOSIT HISTORY (DEPOSIT HISTORY MODEL)
  // =========================================

  fastify.get("/deposits/history", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, GetAllDepositeHistory);

  fastify.get("/deposits/history/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getDepositHistoryById);

  // =========================================
  // IPN HISTORY (ADMIN)
  // =========================================
  fastify.post("/ipn-history", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getIpnHistory);

  // KYB MANAGEMENT
  // =========================================

  fastify.get("/kyb/list", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),

      async (req, reply) => {
        const result = getAllKybValidator.safeParse(req.query);

        if (!result.success) {
          return reply.code(400).send({
            success: false,
            message: "Validation failed",
            errors: result.error.issues.map((error) => ({
              field: error.path.join("."),
              message: error.message,
            })),
            result: null,
          });
        }

        req.validatedData = result.data;
      },
    ],
  }, getAllKyb);

  fastify.get("/kyb/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, getKybDetails);

  fastify.put("/kyb/approve/:id", {
    preHandler: validateToken(["admin", "sub-admin"]),
  }, approveKyb);

  fastify.patch("/kyb/reject/:id", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),
      async (req, reply) => {
        const result = await zodValidate(req, reply, rejectKybValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, rejectKyb);


  // for merchant
  fastify.get("/getWithdrawFee", {
    preHandler: [
      validateToken(["admin", "sub-admin"])
    ],
  }, getWithdrawLimit);

  fastify.post("/updateWithdrawFee", {
    preHandler: [
      validateToken(["admin", "sub-admin"])
    ],
  }, updateWithdrawLimit);
  // block and unblock user
  fastify.post(
    "/block-user",
    {
      preHandler: [
        validateToken(["admin", "sub-admin"]),
        async (req, reply) => {
          const result = await zodValidate(req, reply, blockusersValidator);
          if (!result.success) return;
          req.validatedData = result.data;
        }
      ]
    },
    blockusers
  );

  // users 2fa disable by admin
  fastify.post(
    "/disable-2fa-user",
    {
      preHandler: [
        validateToken(["admin", "sub-admin"]),
      ]
    },
    disable2FAUser
  );


  // adminDashbord
  fastify.post("/admin-dashboard", {
    preHandler: [
      validateToken(["admin", "sub-admin"]),

    ],
  }, getAdminDashboard);


  // to get all the merchant and users deposit address
  // payload:{
  //   {
  //       "networkType" : "trx" or "evm" or "btc"
  //   }
  // }

  fastify.post("/getAllDepositAddress", {
    // preHandler: [
    //   validateToken(["admin", "sub-admin"]),

    // ],
  }, getAllDepositAddress);

  fastify.post("/getBothAddress", {
    // preHandler: [
    //   validateToken(["admin", "sub-admin"]),

    // ],
  }, getBothAddress);

  fastify.post("/getContractAddress", {
   
  }, getContractAddress);



};
