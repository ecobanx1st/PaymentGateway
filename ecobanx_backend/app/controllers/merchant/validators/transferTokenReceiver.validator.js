const { z } = require("zod");

const transferTokenReceiverValidator = z
  .object({
    address: z
      .string({ required_error: "address is required" })
      .trim()
      .min(1, "address is required"),

    amount: z.preprocess(
      (value) => {
        if (typeof value === "string") {
          const trimmed = value.trim();

          if (!/^\d+(\.\d+)?$/.test(trimmed)) {
            return undefined;
          }

          return Number(trimmed);
        }

        return value;
      },
      z
        .number({
          required_error: "amount is required",
          invalid_type_error: "amount must be a number",
        })
        .positive("amount must be greater than 0")
    ),

    coin: z
      .record(
        z.string().min(1),
        z.object({
          decimal: z.coerce
            .number({
              invalid_type_error: "decimal must be a number",
            })
            .optional(),

          symbol: z
            .string({
              invalid_type_error: "symbol must be a string",
            })
            .optional(),
        })
      )
      .optional(),

    txId: z
      .string({ required_error: "txId is required" })
      .trim()
      .min(1, "txId is required"),

    from: z
      .string({ required_error: "from is required" })
      .trim()
      .min(1, "from is required"),

    // Optional initially.
    // Conditional validation is done below.
    contractAddress: z
      .string()
      .trim()
      .min(1, "contractAddress cannot be empty")
      .optional(),

    network: z
      .string({ required_error: "network is required" })
      .trim()
      .min(1, "network is required")
      .toUpperCase(),

    apiKey: z
      .string({
        invalid_type_error: "apiKey must be a string",
      })
      .trim()
      .min(1, "apiKey must not be empty")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const tokenInfo = Object.values(data.coin || {})[0] || {};

    const symbol = tokenInfo.symbol?.toUpperCase();

    if (!symbol) {
      return;
    }

    // Native coins
    const nativeCoins = {
      ETH: ["ETH"],
      BNB: ["BNB"],
      TRX: ["TRX"],
      SOL: ["SOL"],
    };

    const isNativeCoin =
      Object.values(nativeCoins)
        .flat()
        .includes(symbol);

    // Token requires contractAddress
    if (!isNativeCoin && !data.contractAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractAddress"],
        message: `contractAddress is required for ${symbol}`,
      });
    }

    // Native coin should not require contract address
    // You can also reject it if you want strict behavior.
    if (isNativeCoin && data.contractAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contractAddress"],
        message: `contractAddress is not required for ${symbol}`,
      });
    }
  });

module.exports = {
  transferTokenReceiverValidator,
};