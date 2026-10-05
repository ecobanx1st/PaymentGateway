const crypto = require("crypto");
const { Transaction } = require("../../models/transactionModel");
const { DepositHistory } = require("../../models/depositHistoryModel");
const { getCryptoQuote } = require("../price/priceService");

const {
  validateAssetNetwork,
  getPaymentAddress,
  deleteGeneratedDepositAddress,
  UNSUPPORTED_PAIR,
} = require("../wallet/depositAddressService");
const {
  createEvmWallet,
  createSolanaWallet,
  createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");

const { validateAddress } = require("../../utils/validateAddress");


const API_NETWORK_TO_DB_NETWORK = {
  ERC20: "ETH",
  BEP20: "BNB",
  TRC20: "TRX",
  MATIC20: "MATIC",
};


class TransactionServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = "TransactionServiceError";
    this.statusCode = statusCode;
  }
}


const generateTxnId = () => {
  return `txn_${crypto.randomBytes(16).toString("hex")}`;
};

const buildCheckoutUrl = (txnId) => {
  const base =
    process.env.CHECKOUT_BASE_URL ||
    process.env.BACKEND_URL;

  if (!base) {
    return null;
  }

  return `${String(base).replace(/\/+$/, "")}/${txnId}`;
};
const resolveInternalNetworkSymbol = (network) => {
  const requestedNetwork = String(network || "")
    .trim()
    .toUpperCase();

  if (!requestedNetwork) {
    return null;
  }

  return (
    API_NETWORK_TO_DB_NETWORK[requestedNetwork] ||
    requestedNetwork
  );
};

const createFixedPriceTransaction = async ({
  merchantId,
  data,
  apiKeyId = null,
}) => {
  const {
    amount,
    currency1,
    currency2,
    network,
  } = data;


  if (!merchantId) {
    throw new TransactionServiceError(
      "Merchant authentication is required",
      401
    );
  }

  if (!amount) {
    throw new TransactionServiceError(
      "Amount is required",
      400
    );
  }

  if (!currency1) {
    throw new TransactionServiceError(
      "Currency1 is required",
      400
    );
  }

  if (!currency2) {
    throw new TransactionServiceError(
      "Currency2 is required",
      400
    );
  }

  if (!network) {
    throw new TransactionServiceError(
      "Network is required",
      400
    );
  }

  const normalizedCurrency1 = String(currency1)
    .trim()
    .toUpperCase();

  const normalizedCurrency2 = String(currency2)
    .trim()
    .toUpperCase();

  const requestedNetwork = String(network)
    .trim()
    .toUpperCase();

  const internalNetworkSymbol =
    resolveInternalNetworkSymbol(requestedNetwork);

  if (!internalNetworkSymbol) {
    throw new TransactionServiceError(
      "Unsupported payment network",
      400
    );
  }

  console.log("create transaction network mapping:", {
    requestedNetwork,
    internalNetworkSymbol,
    currency2: normalizedCurrency2,
  });



  let pair;

  try {
    pair = await validateAssetNetwork(
      normalizedCurrency2,
      internalNetworkSymbol
    );
  } catch (err) {
    if (err.code === UNSUPPORTED_PAIR) {
      throw new TransactionServiceError(
        "Currently Deposit not available for this pair",
        400
      );
    }

    console.error(
      "validateAssetNetwork error:",
      err.message
    );

    throw new TransactionServiceError(
      "Internal server error",
      500
    );
  }


  if (
    !pair ||
    !pair.networkDoc ||
    !pair.networkEntry
  ) {
    throw new TransactionServiceError(
      "Currency/network combination is not supported",
      400
    );
  }

  console.log("matched asset/network:", {
    currency2: normalizedCurrency2,
    requestedNetwork,
    internalNetworkSymbol,
    networkId: pair.networkDoc._id,
    networkSymbol: pair.networkDoc.networkSymbol,
    networkType: pair.networkDoc.type,
    decimal: pair.networkEntry.decimal,
  });

  let quote;

  try {
    quote = await getCryptoQuote({
      fromCurrency: normalizedCurrency1,
      toCurrency: normalizedCurrency2,
      amount,
      decimals: pair.networkEntry.decimal,
    });
  } catch (err) {
    if (err.code === "PRICE_UNAVAILABLE") {
      console.warn(
        `No exchange rate for ${normalizedCurrency1}/${normalizedCurrency2}, falling back to 1:1`
      );
      try {
        quote = await getCryptoQuote({
          fromCurrency: normalizedCurrency1,
          toCurrency: normalizedCurrency2,
          amount,
          decimals: pair.networkEntry.decimal,
          rateProvider: async () => 1,
        });
      } catch (fallbackErr) {
        console.error(
          "getCryptoQuote fallback error:",
          fallbackErr.message
        );

        throw new TransactionServiceError(
          "Unable to get current exchange rate",
          502
        );
      }
    } else {
      console.error(
        "getCryptoQuote error:",
        err.message
      );

      throw new TransactionServiceError(
        "Unable to get current exchange rate",
        502
      );
    }
  }

  if (
    !quote ||
    quote.cryptoAmount === undefined ||
    quote.cryptoAmount === null ||
    !quote.rate
  ) {
    console.error(
      "Invalid quote response:",
      quote
    );

    throw new TransactionServiceError(
      "Unable to get current exchange rate",
      502
    );
  }

  let addressResult;

  if (data.address) {
    const validationNetwork =
      pair.networkDoc.type ||
      internalNetworkSymbol;

    const isValid = validateAddress(
      data.address,
      validationNetwork
    );

    if (!isValid) {
      throw new TransactionServiceError(
        "The provided address is not valid for the selected currency/network",
        400
      );
    }
    addressResult = {
      address: data.address,
      isNew: false,
      depositAddressId: null,
    };
  } else {
    try {
      addressResult = await getPaymentAddress({
        merchantId,
        coin: normalizedCurrency2,
        networkSymbol: internalNetworkSymbol,
        networkDoc: pair.networkDoc,
      });
    } catch (err) {
      console.error(
        "getPaymentAddress error:",
        err.message
      );

      throw new TransactionServiceError(
        "Unable to generate payment address",
        502
      );
    }
  }
  if (
    !addressResult ||
    !addressResult.address
  ) {
    throw new TransactionServiceError(
      "Unable to generate payment address",
      502
    );
  }
  const txnId = generateTxnId();
  const checkoutUrl = buildCheckoutUrl(txnId);


  try {
    const transaction =
      await Transaction.create({
        merchantId,
        apiKeyId,
        txnId,
        type: "payin",
        amount: Number(amount),
        currency1: normalizedCurrency1,
        amountInCurrency2: Number(
          quote.cryptoAmount
        ),
        cryptoAmount: quote.cryptoAmount,
        currency2: normalizedCurrency2,
        network: requestedNetwork,
        address: addressResult.address,
        exchangeRate: quote.rate,
        marketRate: quote.marketRate || quote.rate,
        quoteCreatedAt: quote.quoteCreatedAt,
        quoteExpiresAt: quote.quoteExpiresAt,
        timeout: quote.quoteTtlSeconds,
        expiresAt: quote.quoteExpiresAt,
        buyerEmail: data.buyer_email || null,
        buyerFirstname: data.buyer_firstname || null,
        buyerLastname: data.buyer_lastname || null,
        fullName: data.full_name || null,
        buyerName: data.buyer_name || null,
        itemName: data.item_name || null,
        itemNumber: data.item_number || null,
        invoice: data.invoice || null,
        custom: data.custom || null,
        item_description: data.item_description || null,
        item_quantity: data.item_quantity || null,
        tax_amount: data.tax_amount || null,
        shipping_cost: data.shipping_cost || null,
        ipnUrl: data.ipn_url || null,
        successUrl: data.success_url || null,
        cancelUrl: data.cancel_url || null,
        buttonType: data.buttonType || null,
        checkoutUrl,
      });

    await DepositHistory.create({
      merchantId,
      userId: merchantId,
      apiKeyId,
      address: transaction.address,
      amount: Number(quote.cryptoAmount),
      receivedAmount: 0,
      txId: txnId,
      from: null,
      contractAddress: pair.networkEntry.contractAddress || null,
      network: internalNetworkSymbol,
      symbol: normalizedCurrency2,
      decimal: pair.networkEntry.decimal ?? null,
      status: "pending",
      type: "payIn",
      buttonType: data.buttonType || null,
    });


    return {
      amount: String(amount),
      currency1: normalizedCurrency1,
      crypto_amount: Number(quote.cryptoAmount).toFixed(6),
      currency2: normalizedCurrency2,
      network: requestedNetwork,
      // exchange_rate:
      //   quote.rate,
      address: transaction.address,
      dest_tag: transaction.destTag || null,
      txn_id: transaction.txnId,
      confirms_needed: String(transaction.confirmsNeeded),
      timeout: quote.quoteTtlSeconds,
      quote_expires_at:
        quote.quoteExpiresAt
          ? quote.quoteExpiresAt.toISOString()
          : null,
      // checkout_url:
      //   checkoutUrl,
      qrcode_url: transaction.qrcodeUrl || null,
      status: transaction.status,
    };
  } catch (dbErr) {
    if (
      addressResult &&
      addressResult.isNew &&
      addressResult.depositAddressId
    ) {
      try {
        await deleteGeneratedDepositAddress(
          addressResult.depositAddressId
        );
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup generated deposit address:",
          cleanupErr.message
        );
      }
    }
    console.error(
      "createFixedPriceTransaction db error:",
      dbErr.message
    );
    throw new TransactionServiceError(
      "Internal server error",
      500
    );
  }
};

module.exports = {
  createFixedPriceTransaction,
  TransactionServiceError,
  generateTxnId,
  buildCheckoutUrl,
  resolveInternalNetworkSymbol,
};

