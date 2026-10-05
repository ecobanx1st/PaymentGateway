const apiKeyService = require("../../services/merchantApiKey.service");
const { Users } = require("../../models/usersModel");
const { KYC } = require("../../models/kycModel");
const { KYB } = require("../../models/kybModel");
const twoFactorService = require("../../services/twofactor/twoFactorService");

// Google-authenticator OTP check shared by create / update / permissions.
const verifyApiKeyOtp = (merchant, twoFactorCode, reply) => {
  if (!merchant.twoFactorSecret) {
    reply.code(400).send({
      success: false,
      message: "Two-factor authentication is not configured.",
    });
    return false;
  }

  const isValid = twoFactorService.verifyToken(
    merchant.twoFactorSecret,
    twoFactorCode
  );

  if (!isValid) {
    reply.code(400).send({
      success: false,
      message: "Invalid authenticator code.",
    });
    return false;
  }

  return true;
};

const createApiKey = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { keyName, ipRestrictions, permissions, twoFactorCode } = req.validatedData;

    const merchant = await Users.findById(merchantId).lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found.",
      });
    }

    if (!merchant.accountverifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "Merchant account is not verified.",
      })
    }

    // ============================================================
    // KYC / KYB VERIFICATION CHECK
    // ============================================================

    if (merchant.accountType === "individual") {
      const kyc = await KYC.findOne({
        userId: merchantId,
      }).lean();

      // No KYC submitted
      if (!kyc) {
        return reply.code(400).send({
          success: false,
          message: "Please complete your KYC verification before creating an API key.",
        });
      }

      // KYC pending admin approval
      if (kyc.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is pending admin approval. Please wait until your KYC is approved.",
        });
      }

      // KYC rejected
      if (kyc.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification was rejected. Please resubmit your KYC for approval.",
        });
      }

      // Any status other than Approved
      if (kyc.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else if (merchant.accountType === "business") {
      const kyb = await KYB.findOne({
        userId: merchantId,
      }).lean();

      // No KYB submitted
      if (!kyb) {
        return reply.code(400).send({
          success: false,
          message: "Please complete your KYB verification before creating an API key.",
        });
      }

      // KYB pending admin approval
      if (kyb.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is pending admin approval. Please wait until your KYB is approved.",
        });
      }

      // KYB rejected
      if (kyb.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification was rejected. Please resubmit your KYB for approval.",
        });
      }

      // Any status other than Approved
      if (kyb.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        message: "Invalid account type.",
      });
    }

    // ============================================================
    // 2FA CHECK
    // ============================================================

    if (!merchant.twoFactorEnabled) {
      return reply.code(400).send({
        success: false,
        message:
          "Two-factor authentication is not enabled. Please enable 2FA before creating an API key.",
      });
    }

    if (!verifyApiKeyOtp(merchant, twoFactorCode, reply)) return;

    // ============================================================
    // CREATE API KEY
    // ============================================================

    const result = await apiKeyService.createApiKey({
      merchantId,
      keyName,
      ipRestrictions,
      permissions,
    });



    // await notificationService.createNotification({
    //   user_id: merchantId,
    //   role: "user",
    //   title: "Api Key Created",
    //   description: "Your new API key has been generated successfully.",
    //   type: "general",
    //   category: "SECURITY",
    //   status: "success",
    // });


    return reply.code(201).send({
      success: true,
      message: "API key created successfully.",
      data: {
        id: result.id,
        publicKey: result.publicKey,
        secretKey: result.secretKey,
        keyName: result.keyName,
        permissions: result.permissions,
        ipRestrictions: result.ipRestrictions,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    if (
      error.message.includes("maximum of 10 API keys") ||
      error.message.includes("already exists") ||
      error.message.includes("Invalid IP")
    ) {
      return reply.code(400).send({
        success: false,
        message: error.message,
      });
    }

    console.error("Create API key error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const listApiKeys = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { page = 1, limit = 5, search = "" } = req.query;

    const result = await apiKeyService.listApiKeys(merchantId, {
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      search: search.trim(),
    });

    return reply.code(200).send({
      success: true,
      message: "API keys fetched successfully.",
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      },
    });
  } catch (error) {
    console.error("List API keys error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const getApiKeyById = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { id } = req.params;

    const key = await apiKeyService.getApiKeyById(merchantId, id);
    if (!key) {
      return reply.code(404).send({ success: false, message: "API key not found." });
    }

    return reply.code(200).send({
      success: true,
      data: key,
    });
  } catch (error) {
    console.error("Get API key error:", error);
    return reply.code(500).send({ success: false, message: "Internal server error" });
  }
};

const updateApiKey = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { id } = req.params;
    const { twoFactorCode, ...updates } = req.validatedData;

    // ============================================================
    // MERCHANT CHECK
    // ============================================================

    const merchant = await Users.findById(merchantId).lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found.",
      });
    }

    if (!merchant.accountverifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "Merchant account is not verified.",
      });
    }

    // ============================================================
    // KYC / KYB CHECK
    // ============================================================

    if (merchant.accountType === "individual") {
      const kyc = await KYC.findOne({
        userId: merchantId,
      }).lean();

      // No KYC record
      if (!kyc) {
        return reply.code(400).send({
          success: false,
          message:
            "Please complete your KYC verification before updating an API key.",
        });
      }

      // KYC pending
      if (kyc.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is pending admin approval. Please wait until your KYC is approved.",
        });
      }

      // KYC rejected
      if (kyc.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification was rejected. Please resubmit your KYC for approval.",
        });
      }

      // KYC not approved
      if (kyc.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYC verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else if (merchant.accountType === "business") {
      const kyb = await KYB.findOne({
        userId: merchantId,
      }).lean();

      // No KYB record
      if (!kyb) {
        return reply.code(400).send({
          success: false,
          message:
            "Please complete your KYB verification before updating an API key.",
        });
      }

      // KYB pending
      if (kyb.status === "Pending") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is pending admin approval. Please wait until your KYB is approved.",
        });
      }

      // KYB rejected
      if (kyb.status === "Rejected") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification was rejected. Please resubmit your KYB for approval.",
        });
      }

      // KYB not approved
      if (kyb.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message:
            "Your KYB verification is not approved yet. Please wait for admin approval.",
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        message: "Invalid account type.",
      });
    }

    // ============================================================
    // 2FA CHECK
    // ============================================================

    if (!merchant.twoFactorEnabled) {
      return reply.code(400).send({
        success: false,
        message:
          "Two-factor authentication is not enabled. Please enable 2FA before updating an API key.",
      });
    }

    if (!verifyApiKeyOtp(merchant, twoFactorCode, reply)) return;

    // ============================================================
    // UPDATE API KEY
    // ============================================================

    const key = await apiKeyService.updateApiKey(
      merchantId,
      id,
      updates
    );

    if (!key) {
      return reply.code(404).send({
        success: false,
        message: "API key not found.",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "API key updated successfully.",
      data: key,
    });
  } catch (error) {
    if (error.message?.includes("Invalid IP")) {
      return reply.code(400).send({
        success: false,
        message: error.message,
      });
    }

    console.error("Update API key error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePermissions = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { id } = req.params;
    const { permissions, twoFactorCode } = req.validatedData;

    const merchant = await Users.findById(merchantId).lean();

    if (!merchant) {
      return reply.code(404).send({
        success: false,
        message: "Merchant not found.",
      });
    }

    if (!merchant.accountverifyStatus) {
      return reply.code(400).send({
        success: false,
        message: "Merchant not verified.",
      });
    }

    // Check KYC/KYB based on account type
    if (merchant.accountType === "individual") {
      const kyc = await KYC.findOne({ userId: merchantId }).lean();

      if (!kyc || kyc.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message: "KYC verification must be approved.",
        });
      }
    } else if (merchant.accountType === "business") {
      const kyb = await KYB.findOne({ userId: merchantId }).lean();

      if (!kyb || kyb.status !== "Approved") {
        return reply.code(400).send({
          success: false,
          message: "KYB verification must be approved.",
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        message: "Invalid account type.",
      });
    }

    // Check 2FA
    if (!merchant.twoFactorEnabled) {
      return reply.code(400).send({
        success: false,
        message: "Two-factor authentication is not enabled.",
      });
    }

    if (!verifyApiKeyOtp(merchant, twoFactorCode, reply)) return;

    const key = await apiKeyService.updatePermissions(
      merchantId,
      id,
      permissions
    );

    if (!key) {
      return reply.code(404).send({
        success: false,
        message: "API key not found.",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Permissions updated successfully.",
      data: key,
    });
  } catch (error) {
    if (error.message.includes("No valid permissions")) {
      return reply.code(400).send({
        success: false,
        message: error.message,
      });
    }

    console.error("Update permissions error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteApiKey = async (req, reply) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const { id } = req.params;

    const deletedKey = await apiKeyService.revokeApiKey(merchantId, id);

    return reply.code(200).send({
      success: true,
      message: "API key deleted successfully.",
      data: deletedKey,
    });
  } catch (error) {
    console.error("Delete API key error:", error);

    if (error.name === "CastError") {
      return reply.code(400).send({
        success: false,
        message: "Invalid API key id.",
      });
    }

    if (error.message === "API key not found") {
      return reply.code(404).send({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "API key does not belong to this merchant") {
      return reply.code(403).send({
        success: false,
        message: error.message,
      });
    }

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createApiKey,
  listApiKeys,
  getApiKeyById,
  updateApiKey,
  updatePermissions,
  deleteApiKey,
};
