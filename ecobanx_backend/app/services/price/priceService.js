const mongoose = require("mongoose");
const { Wallets } = require("../../models/walletModel");

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price";
const LLAMA_PRICE_URL =
  "https://coins.llama.fi/prices/current";

const COIN_IDS = {
  ETH: "ethereum",
  BNB: "binancecoin",
  BTC: "bitcoin",
  SOL: "solana",
  TRX: "tron",
  USDT: "tether",
  USDC: "usd-coin",
  XRP: "ripple",
  DOGE: "dogecoin",
};

// Pricing providers may hang; every outbound price fetch gets a hard timeout.
const getPriceFetchTimeoutMs = () =>
  Number(process.env.PRICE_FETCH_TIMEOUT_MS) || 8000;

const fetchWithTimeout = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(getPriceFetchTimeoutMs()),
  });
  return response;
};

//
// Exact decimal arithmetic on scaled BigInt values.
// A decimal is represented as { value: BigInt, scale: fractional digit count }.
// No floating-point math is used for monetary calculations.
//
const parseDecimal = (input) => {
  const str = String(input).trim();
  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    throw new Error(`Invalid decimal value`);
  }
  const negative = str.startsWith("-");
  const [intPart, fracPart = ""] = (negative ? str.slice(1) : str).split(".");
  const digits = BigInt((intPart || "0") + fracPart);
  return { value: negative ? -digits : digits, scale: fracPart.length };
};

const mulDecimal = (a, b) => ({
  value: a.value * b.value,
  scale: a.scale + b.scale,
});

// Rescale with rounding AWAY from zero (ceiling for positive amounts) so the
// buyer can never underpay due to truncation.
const ceilToScale = (decimal, targetScale) => {
  if (targetScale < decimal.scale) {
    const factor = 10n ** BigInt(decimal.scale - targetScale);
    const quotient = decimal.value / factor;
    const remainder = decimal.value % factor;
    const adjusted =
      remainder !== 0n ? (decimal.value >= 0n ? quotient + 1n : quotient - 1n) : quotient;
    return { value: adjusted, scale: targetScale };
  }
  return { value: decimal.value * 10n ** BigInt(targetScale - decimal.scale), scale: targetScale };
};

const formatDecimal = ({ value, scale }) => {
  const negative = value < 0n;
  const absStr = (negative ? -value : value).toString().padStart(scale + 1, "0");
  const intPart = absStr.slice(0, absStr.length - scale) || "0";
  const fracPart = scale > 0 ? "." + absStr.slice(absStr.length - scale) : "";
  return (negative ? "-" : "") + intPart + fracPart;
};

async function fetchCoinGeckoTickerData(symbols) {
  const ids = symbols
    .map((symbol) => COIN_IDS[symbol])
    .filter(Boolean);

  if (!ids.length) return [];

  const response = await fetchWithTimeout(
    `${COINGECKO_URL}?ids=${ids.join(",")}&vs_currencies=usd`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko Error: ${response.status}`);
  }

  const data = await response.json();

  return symbols
    .map((symbol) => {
      const id = COIN_IDS[symbol];

      return {
        symbol,
        price: Number(data?.[id]?.usd),
      };
    })
    .filter((item) => Number.isFinite(item.price));
}

async function fetchLlamaTickerData(symbols) {
  const coinKeys = symbols
    .map((symbol) =>
      COIN_IDS[symbol]
        ? `coingecko:${COIN_IDS[symbol]}`
        : null
    )
    .filter(Boolean);

  if (!coinKeys.length) return [];

  const response = await fetchWithTimeout(
    `${LLAMA_PRICE_URL}/${coinKeys.join(",")}`
  );

  if (!response.ok) {
    throw new Error(`DefiLlama Error: ${response.status}`);
  }

  const data = await response.json();

  return symbols
    .map((symbol) => {
      const id = COIN_IDS[symbol];

      return {
        symbol,
        price: Number(
          data?.coins?.[`coingecko:${id}`]?.price
        ),
      };
    })
    .filter((item) => Number.isFinite(item.price));
}

async function getTickerData(symbols) {
  try {
    const prices = await fetchCoinGeckoTickerData(symbols);

    return {
      source: "coingecko",
      prices,
    };
  } catch (err) {
    console.log("CoinGecko Failed:", err.message);

    try {
      const prices = await fetchLlamaTickerData(symbols);

      return {
        source: "defillama",
        prices,
      };
    } catch (err2) {
      console.log("DefiLlama Failed:", err2.message);

      return {
        source: null,
        prices: [],
      };
    }
  }
}

const dashboardApi = async (req, res) => {
  try {
    const wallets = await Wallets.find({
      userId: req.user._id,
    })
      .populate("assetId", "assetSymbol")
      .lean();

    let p2pcount = 0;
    try {
      const P2P = mongoose.model("p2p");
      p2pcount = await P2P.countDocuments({
        userId: req.user._id,
        status: { $in: ["active", "pending"] },
      });
    } catch (err) {
      p2pcount = 0;
    }

    const walletSymbols = [
      ...new Set(
        wallets
          .map((w) => String(w.assetId?.assetSymbol || w.asset || "").toUpperCase())
          .filter(Boolean)
      ),
    ];

    const { source, prices } =
      await getTickerData(walletSymbols);

    const priceMap = new Map(
      prices.map((item) => [
        item.symbol.toUpperCase(),
        item.price,
      ])
    );

    let totalUSDT = 0;

    for (const wallet of wallets) {
      const coin = String(wallet.assetId?.assetSymbol || wallet.asset || "").toUpperCase();
      const balance = Number(wallet.free);

      if (!Number.isFinite(balance) || balance <= 0)
        continue;

      if (coin === "USDT" || coin === "USD") {
        totalUSDT += balance;
        continue;
      }

      const price = priceMap.get(coin);

      if (!price) continue;

      totalUSDT += balance * price;
    }

    return res.status(200).json({
      success: true,
      message: "Wallet Balance",
      result: {
        totalUSDT: totalUSDT.toFixed(2),
        p2pcount,
        priceSource: source,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const CACHE_TTL_MS = 30 * 1000;
const rateCache = new Map();

const FIAT_CODES = new Set(["USD", "EUR", "GBP", "INR", "AED", "AUD", "CAD", "JPY", "CNY", "SGD"]);

const getPriceFromBinance = async (base, quote) => {
  const response = await fetchWithTimeout(
    `https://api.binance.com/api/v3/ticker/price?symbol=${base}${quote}`,
    { headers: { "User-Agent": "payment-gateway" } }
  );
  if (!response.ok) throw new Error(`Binance Error: ${response.status}`);
  const data = await response.json();
  if (data && data.price) return Number(data.price);
  return null;
};

const getPriceFromCoinGecko = async (base, quote) => {
  const id = COIN_IDS[base.toUpperCase()];
  if (!id) return null;
  const vs = FIAT_CODES.has(quote.toUpperCase()) ? quote.toLowerCase() : "usd";
  const response = await fetchWithTimeout(
    `${COINGECKO_URL}?ids=${id}&vs_currencies=${vs}`
  );
  if (!response.ok) throw new Error(`CoinGecko Error: ${response.status}`);
  const data = await response.json();
  if (data && data[id] && data[id][vs] != null) return Number(data[id][vs]);
  return null;
};

const getExchangeRate = async (currency1, currency2) => {
  const c1 = currency1.toUpperCase();
  const c2 = currency2.toUpperCase();

  if (c1 === c2) return 1;

  const key = `${c1}-${c2}`;
  const now = Date.now();
  const cached = rateCache.get(key);
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.rate;

  let rate = null;

  if (FIAT_CODES.has(c1) && FIAT_CODES.has(c2)) {
    const usdtInC1 = await getPriceFromCoinGecko("USD", c1);
    const usdtInC2 = await getPriceFromCoinGecko("USD", c2);
    if (usdtInC1 != null && usdtInC2 != null) rate = usdtInC1 / usdtInC2;
  } else if (FIAT_CODES.has(c1)) {
    const price = await getPriceFromCoinGecko(c2, c1);
    if (price != null) rate = 1 / price;
  } else if (FIAT_CODES.has(c2)) {
    rate = await getPriceFromCoinGecko(c1, c2);
  } else {
    try {
      rate = await getPriceFromBinance(c1, c2);
    } catch (err) {
      console.log("Binance Failed:", err.message);
    }
    if (rate == null) {
      try {
        rate = await getPriceFromCoinGecko(c1, c2);
      } catch (err) {
        console.log("CoinGecko Failed:", err.message);
      }
    }
  }

  if (rate != null) {
    rateCache.set(key, { rate, at: now });
    return rate;
  }

  return null;
};

// Quote TTL for fixed-price transactions. Configurable via env, never hardcoded
// at call sites.
const getQuoteTtlSeconds = () => {
  const parsed = parseInt(process.env.PRICE_QUOTE_TTL_SECONDS, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 900;
};

const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";

// Generic fiat/crypto -> crypto quote used by fixed-price transaction creation.
// Works for any currency pair supported by the pricing providers; same-currency
// pairs short-circuit to rate = 1 without any external provider call.
//
// Returns:
// {
//   rate, marketRate, cryptoAmount,          // exact decimal strings
//   fromCurrency, toCurrency,
//   quoteCreatedAt, quoteExpiresAt,          // Date
//   quoteTtlSeconds
// }
const getCryptoQuote = async ({
  fromCurrency,
  toCurrency,
  amount,
  decimals = 8,
  rateProvider = getExchangeRate,
}) => {
  const from = String(fromCurrency || "").toUpperCase().trim();
  const to = String(toCurrency || "").toUpperCase().trim();
  if (!from || !to) {
    const err = new Error("fromCurrency and toCurrency are required");
    err.code = PRICE_UNAVAILABLE;
    throw err;
  }

  const amountDec = parseDecimal(amount);
  if (amountDec.value <= 0n) {
    const err = new Error("amount must be greater than 0");
    err.code = PRICE_UNAVAILABLE;
    throw err;
  }

  const targetScale = Math.min(Math.max(Number.isFinite(decimals) ? decimals : 8, 0), 18);

  let rateDec;

  if (from === to) {
    // Same-currency payment: no external pricing provider involved.
    rateDec = { value: 1n, scale: 0 };
  } else {
    let rate = null;
    // One safe retry — providers already fall back across CoinGecko/DefiLlama/Binance.
    for (let attempt = 0; attempt < 2 && rate == null; attempt++) {
      try {
        rate = await rateProvider(from, to);
      } catch (err) {
        if (attempt === 1) {
          console.log(`Exchange rate lookup failed for ${from}/${to}:`, err.message);
        }
      }
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      const err = new Error(`Unable to get current exchange rate for ${from}/${to}`);
      err.code = PRICE_UNAVAILABLE;
      throw err;
    }

    rateDec = parseDecimal(String(rate));
  }

  const product = mulDecimal(amountDec, rateDec);
  const cryptoDec = ceilToScale(product, targetScale);

  const quoteCreatedAt = new Date();
  const ttlSeconds = getQuoteTtlSeconds();
  const quoteExpiresAt = new Date(quoteCreatedAt.getTime() + ttlSeconds * 1000);

  return {
    rate: formatDecimal(rateDec),
    marketRate: formatDecimal(rateDec),
    cryptoAmount: formatDecimal(cryptoDec),
    fromCurrency: from,
    toCurrency: to,
    quoteCreatedAt,
    quoteExpiresAt,
    quoteTtlSeconds: ttlSeconds,
  };
};

module.exports = {
  dashboardApi,
  getExchangeRate,
  getCryptoQuote,
  getQuoteTtlSeconds,
};