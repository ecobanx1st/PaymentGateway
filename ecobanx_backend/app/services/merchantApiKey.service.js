const bcrypt = require("bcrypt");
const { MerchantApiKey } = require("../models/merchantApiKeyModel");
const { generatePublicKey, generateSecretKey } = require("../utils/apiKeyGenerator");
const { encrypt, decrypt } = require("./encryption/encryptData");
const { isValidIPRestriction } = require("../utils/ipValidator");
const { escapeRegex } = require("../middleware/utils/escapeRegex");
const { API_KEY_PERMISSIONS, DEFAULT_API_KEY_PERMISSIONS } = require("../constants/apiKeyPermissions");

const MAX_ACTIVE_KEYS = 10;

const createApiKey = async ({ merchantId, keyName, ipRestrictions = [], permissions }) => {
  const total = await MerchantApiKey.countDocuments({
    merchantId,
    status: "ACTIVE",
  });

  if (total >= MAX_ACTIVE_KEYS) {
    throw new Error(`You can create a maximum of ${MAX_ACTIVE_KEYS} API keys.`);
  }

  const duplicate = await MerchantApiKey.findOne({
    merchantId,
    keyName: { $regex: `^${escapeRegex(keyName.trim())}$`, $options: "i" },
  });
  if (duplicate) {
    throw new Error("API key name already exists.");
  }

  if (ipRestrictions.length > 0) {
    for (const ip of ipRestrictions) {
      if (!isValidIPRestriction(ip)) {
        throw new Error(`Invalid IP restriction value: ${ip}`);
      }
    }
  }

  const publicKey = generatePublicKey();
  const secretKey = generateSecretKey();

  const secretKeyEncrypted = encrypt(secretKey);

  const apiKey = await MerchantApiKey.create({
    merchantId,
    keyName,
    publicKey,
    secretKeyEncrypted,
    ipRestrictions,
    permissions: permissions ?? { ...DEFAULT_API_KEY_PERMISSIONS },
  });

  return {
    id: apiKey._id,
    publicKey: apiKey.publicKey,
    secretKey: decrypt(apiKey.secretKeyEncrypted),
    keyName: apiKey.keyName,
    permissions: apiKey.permissions,
    ipRestrictions: apiKey.ipRestrictions,
    status: apiKey.status,
    createdAt: apiKey.createdAt,
  };
};

const listApiKeys = async (merchantId, { page = 1, limit = 10, search = "" } = {}) => {
  const filter = { merchantId };

  if (search?.trim()) {
    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escapedSearch, "i");

    filter.$or = [
      { keyName: regex },
      { ipRestrictions: regex },
    ];
  }

  const result = await MerchantApiKey.paginate(filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    select: "-__v",
    lean: true,
  });

  return {
    docs: result.docs.map((key) => ({
      id: key._id,
      keyName: key.keyName,
      publicKey: key.publicKey,
      secretKey: decrypt(key.secretKeyEncrypted),
      permissions: key.permissions,
      ipRestrictions: key.ipRestrictions,
      status: key.status,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    })),
    page: result.page,
    limit: result.limit,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    pagingCounter: result.pagingCounter,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
  };
};

const getApiKeyById = async (merchantId, keyId) => {
  const key = await MerchantApiKey.findOne({ _id: keyId, merchantId })
    .select("-__v")
    .lean();

  if (!key) return null;

  return {
    id: key._id,
    keyName: key.keyName,
    publicKey: key.publicKey,
    secretKey: decrypt(key.secretKeyEncrypted),
    permissions: key.permissions,
    ipRestrictions: key.ipRestrictions,
    status: key.status,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
};

const updateApiKey = async (merchantId, keyId, updates) => {
  const { keyName, ipRestrictions, status } = updates;

  if (ipRestrictions && ipRestrictions.length > 0) {
    for (const ip of ipRestrictions) {
      if (!isValidIPRestriction(ip)) {
        throw new Error(`Invalid IP restriction value: ${ip}`);
      }
    }
  }

  const setFields = {};
  if (keyName !== undefined) setFields.keyName = keyName;
  if (ipRestrictions !== undefined) setFields.ipRestrictions = ipRestrictions;
  if (status !== undefined) setFields.status = status;

  const key = await MerchantApiKey.findOneAndUpdate(
    { _id: keyId, merchantId },
    { $set: setFields },
    { new: true }
  ).select(" -__v").lean();

  if (!key) return null;

  return {
    id: key._id,
    keyName: key.keyName,
    publicKey: key.publicKey,
    secretKey: decrypt(key.secretKeyEncrypted),
    permissions: key.permissions,
    ipRestrictions: key.ipRestrictions,
    status: key.status,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
};

const updatePermissions = async (merchantId, keyId, permissions) => {
  const setFields = {};
  for (const [key, value] of Object.entries(permissions)) {
    if (API_KEY_PERMISSIONS.includes(key) && typeof value === "boolean") {
      setFields[`permissions.${key}`] = value;
    }
  }

  if (Object.keys(setFields).length === 0) {
    throw new Error("No valid permissions provided.");
  }

  const key = await MerchantApiKey.findOneAndUpdate(
    { _id: keyId, merchantId },
    { $set: setFields },
    { new: true }
  ).select(" -__v").lean();

  if (!key) return null;

  return {
    id: key._id,
    keyName: key.keyName,
    publicKey: key.publicKey,
    secretKey: decrypt(key.secretKeyEncrypted),
    permissions: key.permissions,
    ipRestrictions: key.ipRestrictions,
    status: key.status,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
};

const revokeApiKey = async (merchantId, keyId) => {
  const result = await MerchantApiKey.deleteOne({ _id: keyId, merchantId });

  if (result.deletedCount === 0) {
    const exists = await MerchantApiKey.exists({ _id: keyId });
    if (exists) {
      throw new Error("API key does not belong to this merchant");
    }
    throw new Error("API key not found");
  }

  return {};
};

const verifyApiKey = async (publicKey, secretKey, clientIp) => {
  const apiKey = await MerchantApiKey.findOne({ publicKey, status: "ACTIVE" }).lean();
  if (!apiKey) {
    throw new Error("Invalid API key.");
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new Error("API key has expired.");
  }

  if (apiKey.ipRestrictions && apiKey.ipRestrictions.length > 0) {
    const allowed = apiKey.ipRestrictions.some((restriction) => {
      if (restriction === clientIp) return true;
      if (restriction.includes("/")) {
        const { isIPInCIDR } = require("../utils/ipValidator");
        return isIPInCIDR(clientIp, restriction);
      }
      return false;
    });

    if (!allowed) {
      throw new Error("IP not allowed.");
    }
  }

  const match = await bcrypt.compare(secretKey);
  if (!match) {
    throw new Error("Invalid API key.");
  }

  return apiKey;
};

const updateLastUsed = async (keyId, clientIp) => {
  await MerchantApiKey.findByIdAndUpdate(keyId, {
    $set: { lastUsedAt: new Date(), lastUsedIp: clientIp },
  });
};

const findApiKeyByValue = async (apiKey) => {
  if (!apiKey) return null;

  const record = await MerchantApiKey.findOne({ publicKey: apiKey }).lean();
  if (record) return record;

  const candidates = await MerchantApiKey.find({ status: "ACTIVE" })
    .select("merchantId publicKey secretKeyEncrypted expiresAt status")
    .lean();

  return (
    candidates.find(
      (candidate) => decrypt(candidate.secretKeyEncrypted) === apiKey
    ) || null
  );
};

const checkPermission = (apiKey, permission) => {
  return apiKey.permissions && apiKey.permissions[permission] === true;
};

module.exports = {
  createApiKey,
  listApiKeys,
  getApiKeyById,
  updateApiKey,
  updatePermissions,
  revokeApiKey,
  verifyApiKey,
  findApiKeyByValue,
  updateLastUsed,
  checkPermission,
};
