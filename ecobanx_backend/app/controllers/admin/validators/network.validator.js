const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const digitsOnlyRegex = /^\d+$/;

const createNetworkValidator = z.object({
  networkName: z
    .string({ required_error: "Network name is required", invalid_type_error: "Network name must be a string" })
    .trim()
    .min(1, "Network name is required"),
  networkSymbol: z
    .string({ required_error: "Network symbol is required", invalid_type_error: "Network symbol must be a string" })
    .trim()
    .min(1, "Network symbol is required"),
  chainId: z
    .string({ invalid_type_error: "Chain ID must be a string" })
    .trim()
    .refine(
      (value) => value === "" || digitsOnlyRegex.test(value),
      {
        message: "Chain ID must contain only digits",
      }
    )
    .optional(),
  rpcUrl: z.preprocess(
    (value) => value === "" ? undefined : value,
    z
      .string()
      .trim()
      .url("Invalid RPC URL format")
      .refine(
        (val) => val.startsWith("http://") || val.startsWith("https://"),
        {
          message: "RPC URL must be a valid HTTP or HTTPS URL",
        }
      )
  ),
  type: z.enum(["EVM", "NON-EVM"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be EVM or NON-EVM",
  }),
  status: z.boolean({
    required_error: "Status is required",
    invalid_type_error: "Status must be a boolean",
  }),
  depositEnabled: z.boolean({
    required_error: "Deposit enabled is required",
    invalid_type_error: "Deposit enabled must be a boolean",
  }),
  withdrawEnabled: z.boolean({
    required_error: "Withdraw enabled is required",
    invalid_type_error: "Withdraw enabled must be a boolean",
  }),
  withdrawFee: z
    .number({
      required_error: "Withdraw fee is required",
      invalid_type_error: "Withdraw fee must be a number",
    })
    .min(0, "Withdraw fee must be at least 0"),
  explorerUrl: z.preprocess(
    (value) => value === "" ? undefined : value,
    z
      .string({
        invalid_type_error: "Explorer URL must be a string",
      })
      .trim()
      .url("Invalid explorer URL format")
      .optional()
  ),
});

const updateNetworkValidator = z.object({
  networkId: z
    .string({ required_error: "Network ID is required", invalid_type_error: "Network ID must be a string" })
    .regex(objectIdRegex, "Invalid Network ID"),
  networkName: z
    .string({ invalid_type_error: "Network name must be a string" })
    .trim()
    .min(1, "Network name cannot be empty")
    .optional(),
  networkSymbol: z
    .string({ invalid_type_error: "Network symbol must be a string" })
    .trim()
    .min(1, "Network symbol cannot be empty")
    .optional(),
  chainId: z
    .string({ invalid_type_error: "Chain ID must be a string" })
    .trim()
    .refine(
      (value) => value === "" || digitsOnlyRegex.test(value),
      {
        message: "Chain ID must contain only digits",
      }
    )
    .optional(),
  rpcUrl: z
    .string({ invalid_type_error: "RPC URL must be a string" })
    .trim()

    .min(1, "RPC URL cannot be empty")
    .url("Invalid RPC URL format")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "RPC URL must be a valid HTTP or HTTPS URL",
    }),
  type: z.enum(["EVM", "NON-EVM"]).optional(),
  status: z
    .boolean({ invalid_type_error: "Status must be a boolean" })
    .optional(),
  depositEnabled: z
    .boolean({ invalid_type_error: "Deposit enabled must be a boolean" })
    .optional(),
  withdrawEnabled: z
    .boolean({ invalid_type_error: "Withdraw enabled must be a boolean" })
    .optional(),
  withdrawFee: z
    .number({ invalid_type_error: "Withdraw fee must be a number" })
    .min(0, "Withdraw fee must be at least 0")
    .optional(),
  explorerUrl: z
    .string({ invalid_type_error: "Explorer URL must be a string" })
    .trim()
    .url("Invalid explorer URL format")
    .optional()
    .or(z.literal("")),
});

const deleteNetworkValidator = z.object({
  networkId: z
    .string({ required_error: "Network ID is required", invalid_type_error: "Network ID must be a string" })
    .regex(objectIdRegex, "Invalid Network ID"),
  forceChange: z
    .boolean({ invalid_type_error: "Delete must be a boolean" })
    .optional()
    .default(false),
});

const getNetworkDetailsValidator = z.object({
  networkId: z
    .string({ required_error: "Network ID is required", invalid_type_error: "Network ID must be a string" })
    .regex(objectIdRegex, "Invalid Network ID"),
});

const getAllNetworksValidator = z.object({
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

  status: z
    .enum(["true", "false", "all"], {
      errorMap: () => ({
        message: "Status must be true, false, or all",
      }),
    })
    .optional()
    .default("all"),

  type: z
    .enum(["EVM", "NON-EVM"])
    .optional(),
});


module.exports = {
  createNetworkValidator,
  updateNetworkValidator,
  deleteNetworkValidator,
  getNetworkDetailsValidator,
  getAllNetworksValidator,
};
