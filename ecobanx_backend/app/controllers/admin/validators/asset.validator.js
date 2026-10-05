const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const digitsOnlyRegex = /^\d+$/;

const networkConfigSchema = z.object({
  networkId: z
    .string({ required_error: "Network ID is required", invalid_type_error: "Network ID must be a string" })
    .regex(objectIdRegex, "Invalid Network ID"),
  contractAddress: z
    .string({ invalid_type_error: "Contract address must be a string" })
    .trim()
    .min(1, "Contract address cannot be empty")
    .optional()
    .default(null),
  withdrawFee: z.coerce
    .number({ invalid_type_error: "Withdraw fee must be a number" })
    .min(0, "Withdraw fee must be at least 0")
    .optional()
    .default(0),
  minWithdrawAmount: z.coerce
    .number({ invalid_type_error: "Min withdraw amount must be a number" })
    .min(0, "Min withdraw amount must be at least 0")
    .optional()
    .default(0),
  maxWithdrawAmount: z.coerce
    .number({ invalid_type_error: "Max withdraw amount must be a number" })
    .min(0, "Max withdraw amount must be at least 0")
    .optional()
    .default(0),
  minDepositAmount: z.coerce
    .number({ invalid_type_error: "Min deposit amount must be a number" })
    .min(0, "Min deposit amount must be at least 0")
    .optional()
    .default(0),
  maxDepositAmount: z.coerce
    .number({ invalid_type_error: "Max deposit amount must be a number" })
    .min(0, "Max deposit amount must be at least 0")
    .optional()
    .default(0),
  decimal: z.coerce
  .number({
    required_error: "Decimal is required",
    invalid_type_error: "Decimal must be a number",
  })
  .int("Decimal must be an integer")
  .min(0, "Decimal must be at least 0")
  .max(255, "Decimal must not exceed 255"),
})
.refine(
  (data) => data.maxWithdrawAmount > data.minWithdrawAmount,
  { message: "Max withdraw amount must be greater than min withdraw amount" },
)
.refine(
  (data) => data.maxDepositAmount > data.minDepositAmount,
  { message: "Max deposit amount must be greater than min deposit amount" },
)

const networksArrayValidator = z
  .array(networkConfigSchema, {
    required_error: "Network configurations are required",
    invalid_type_error: "Network configurations must be an array",
  })
  .min(1, "At least one network configuration is required")
  .refine(
    (configs) =>
      new Set(configs.map((config) => config.networkId)).size === configs.length,
    { message: "Duplicate network IDs are not allowed" }
  );

const createAssetValidator = z.object({
  assetName: z
    .string({ required_error: "Asset name is required", invalid_type_error: "Asset name must be a string" })
    .trim()
    .min(1, "Asset name is required"),
  assetSymbol: z
    .string({ required_error: "Asset symbol is required", invalid_type_error: "Asset symbol must be a string" })
    .trim()
    .min(1, "Asset symbol is required"),
  networks: networksArrayValidator,
  depositStatus: z.coerce
    .boolean({ invalid_type_error: "Deposit status must be a boolean" })
    .optional()
    .default(true),
  withdrawStatus: z.coerce

    .boolean({ invalid_type_error: "Withdraw status must be a boolean" })
    .optional()
    .default(true),
});

const updateAssetValidator = z.object({
  assetId: z
    .string({ required_error: "Asset ID is required", invalid_type_error: "Asset ID must be a string" })
    .regex(objectIdRegex, "Invalid Asset ID"),
  assetName: z
    .string({ invalid_type_error: "Asset name must be a string" })
    .trim()
    .min(1, "Asset name cannot be empty")
    .optional(),
  assetSymbol: z
    .string({ invalid_type_error: "Asset symbol must be a string" })
    .trim()
    .min(1, "Asset symbol cannot be empty")
    .optional(),
  networks: networksArrayValidator.optional(),
  depositStatus: z
    .boolean({ invalid_type_error: "Deposit status must be a boolean" })
    .optional(),
  withdrawStatus: z
    .boolean({ invalid_type_error: "Withdraw status must be a boolean" })
    .optional(),
  status: z
    .boolean({ invalid_type_error: "Status must be a boolean" })
    .optional(),
});

const deleteAssetValidator = z.object({
  assetId: z
    .string({ required_error: "Asset ID is required", invalid_type_error: "Asset ID must be a string" })
    .regex(objectIdRegex, "Invalid Asset ID"),
});

const getAssetDetailsValidator = z.object({
  assetId: z
    .string({ required_error: "Asset ID is required", invalid_type_error: "Asset ID must be a string" })
    .regex(objectIdRegex, "Invalid Asset ID"),
});

const getAllAssetsValidator = z.object({
  page: z
    .string({ invalid_type_error: "Page must be a string" })
    .regex(digitsOnlyRegex, "Page must be a positive number")
    .optional()
    .default("1"),

  limit: z
    .string({ invalid_type_error: "Limit must be a string" })
    .regex(digitsOnlyRegex, "Limit must be a positive number")
    .optional()
    .default("10"),

  search: z
    .string({ invalid_type_error: "Search must be a string" })
    .optional()
    .default(""),

  networkId: z
    .string({ invalid_type_error: "Network ID must be a string" })
    .regex(objectIdRegex, "Invalid Network ID")
    .optional(),

  // Asset status
  status: z
    .enum(["true", "false", "all"], {
      errorMap: () => ({
        message: "Status must be true, false, or all",
      }),
    })
    .optional()
    .default("all"),

  // Deposit status
  depositStatus: z
    .enum(["true", "false", "all"], {
      errorMap: () => ({
        message: "Deposit status must be true, false, or all",
      }),
    })
    .optional()
    .default("all"),

  // Withdraw status
  withdrawStatus: z
    .enum(["true", "false", "all"], {
      errorMap: () => ({
        message: "Withdraw status must be true, false, or all",
      }),
    })
    .optional()
    .default("all"),
});


module.exports = {
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetDetailsValidator,
  getAllAssetsValidator,
};
