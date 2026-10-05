const { getBalance } = require("../../services/wallet/balanceService");
const { getExchangeRate } = require("../../services/price/priceService");
const { Asset } = require("../../models/Asset");

const USDT_EQUIVALENTS = new Set(["USDT", "USD"]);

const getBalanceInUsdt = async (assetSymbol, balance) => {
  if (USDT_EQUIVALENTS.has(assetSymbol)) {
    return { rate: 1, usd: balance };
  }

  const rate = await getExchangeRate(assetSymbol, "USD");

  if (rate == null) {
    return { rate: null, usd: null };
  }

  return { rate, usd: balance * rate };
};

const getBalances = async (req, reply) => {
  try {
    const { coin } = req.validatedData || req.body || {};
    const merchantId = req.user.merchantId || req.user._id || req.user.id;

    if (coin) {
      const balance = await getBalance(merchantId, coin.toUpperCase());
      const { usd } = await getBalanceInUsdt(balance.assetSymbol, balance.totalBalance.total);

      return reply.code(200).send({
        success: true,
        result: {
          [balance.assetSymbol]: {
            balance: balance.totalBalance.total,
            usd,
          },
        },
      });
    }

    const assets = await Asset.find({ status: true }).lean();
    const result = {};
    let totalUsd = 0;

    for (const asset of assets) {
      try {
        const balance = await getBalance(merchantId, asset.assetSymbol);
        const { usd } = await getBalanceInUsdt(balance.assetSymbol, balance.totalBalance.total);

        result[balance.assetSymbol] = {
          balance: balance.totalBalance.total,
          usd,
        };

        if (usd != null) totalUsd += usd;
      } catch {
        result[asset.assetSymbol] = { balance: 0, usd: 0 };
      }
    }

    return reply.code(200).send({
      success: true,
      result,
      totalUsd,
      message: "Balances fetched successfully",
    });
  } catch (error) {
    if (error.message === "Asset not found") {
      return reply.code(200).send({
        success: true,
        result: {},
        totalUsd: 0,
        message: "Asset not found",
      });
    }
    console.error("getBalances error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getBalances };
