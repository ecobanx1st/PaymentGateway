const { z } = require("zod");
const { isValidIPRestriction } = require("../../../utils/ipValidator");
const { API_KEY_PERMISSIONS } = require("../../../constants/apiKeyPermissions");

const permissionsSchema = z.object(
  Object.fromEntries(
    API_KEY_PERMISSIONS.map((key) => [key, z.boolean().optional()])
  )
);

const createApiKeyValidator = z.object({
  keyName: z
    .string({ required_error: "Key name is required" })
    .min(1, "Key name is required")
    .max(20, "Key name must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Key name can only contain letters, numbers, spaces, hyphens, and underscores"),
  ipRestrictions: z
    .array(z.string())
    .optional()
    .default([])
    .refine((ips) => ips.every(isValidIPRestriction), {
      message: "Each IP restriction must be a valid IP address or CIDR notation",
    }),
  permissions: permissionsSchema.optional(),
  twoFactorCode: z
    .string({ required_error: "Google authenticator code is required" })
    .regex(/^\d{6,8}$/, "Enter the 6-digit code from your authenticator app"),
});

const createMerchantSettingsValidator = z.object({
  ipnSecret: z
    .string({ required_error: "IPN Secret is required" })
    .min(1, "IPN Secret is required")
    .regex(/^[a-zA-Z0-9 _-]+$/, "IPN Secret can only contain letters, numbers, spaces, hyphens, and underscores"),
});



const updateApiKeyValidator = z.object({
  keyName: z
    .string()
    .min(1, "Key name is required")
    .max(20, "Key name must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Key name can only contain letters, numbers, spaces, hyphens, and underscores")
    .optional(),
  ipRestrictions: z
    .array(z.string())
    .optional()
    .refine((ips) => !ips || ips.every(isValidIPRestriction), {
      message: "Each IP restriction must be a valid IP address or CIDR notation",
    }),
  status: z
    .enum(["ACTIVE", "REVOKED"])
    .optional(),
  twoFactorCode: z
    .string({ required_error: "Google authenticator code is required" })
    .regex(/^\d{6,8}$/, "Enter the 6-digit code from your authenticator app"),
});

const updatePermissionsValidator = z.object({
  permissions: permissionsSchema,
  twoFactorCode: z
    .string({ required_error: "Google authenticator code is required" })
    .regex(/^\d{6,8}$/, "Enter the 6-digit code from your authenticator app"),
});

module.exports = {
  createApiKeyValidator,
  updateApiKeyValidator,
  updatePermissionsValidator,
  createMerchantSettingsValidator ,
};
