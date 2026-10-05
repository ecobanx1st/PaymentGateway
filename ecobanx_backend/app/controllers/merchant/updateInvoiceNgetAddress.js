const QRCode = require("qrcode");
const mongoose = require("mongoose");
const { Transaction } = require("../../models/transactionModel");
const { DepositAddress } = require("../../models/depositAddressModel");
const { DepositHistory } = require("../../models/depositHistoryModel");
const { Buyer } = require("../../models/buyerSchema");
const {
  validateAssetNetwork,
  UNSUPPORTED_PAIR,
} = require("../../services/wallet/depositAddressService");
const {
  createEvmWallet,
  createSolanaWallet,
  createTronWallet,
} = require("../../services/wallet/helpers/walletHelpers");
const { encrypt } = require("../../services/encryption/encryptData");
const { validateAddress } = require("../../utils/validateAddress");
const { getCryptoQuote } = require("../../services/price/priceService");
const { buildCheckoutUrl } = require("../../services/transaction/transactionService");
const {
  notifyEvmTrackerStoreAddress,
} = require("../../services/tracker/evmTrackerService");
const { createNotification } = require("../../services/notification/notificationService");

const API_NETWORK_TO_DB_NETWORK = {
  ERC20: "ETH",
  BEP20: "BNB",
  TRC20: "TRX",
  MATIC20: "MATIC",
};

const resolveInternalNetworkSymbol = (network) => {
  const v = String(network || "").trim().toUpperCase();
  if (!v) return null;
  return API_NETWORK_TO_DB_NETWORK[v] || v;
};

const sanitize = (v) => String(v ?? "").trim();

const toDisplayStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") return "completed";
  if (s === "completed") return "completed";
  if (s === "failed") return "failed";
  if (s === "expired") return "expired";
  if (s === "cancelled") return "failed";
  if (s === "pending") return "pending";
  if (s === "created") return "created";
  return s || "pending";
};

const updateInvoiceNgetAddress = async (req, reply) => {
  try {
    const body = req.validatedData || req.body || {};
    const params = req.params || {};

    const invoiceIdRaw =
      body.invoiceId ||
      body.buttonmakerId ||
      body.transactionId ||
      body.txnId ||
      body.txn_id ||
      params.invoiceId ||
      params.id ||
      null;
    const invoiceId = sanitize(invoiceIdRaw);
    if (!invoiceId) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "invoiceId is required",
      });
    }

    const firstname = sanitize(body.firstname || body.buyer_firstname);
    const lastname = sanitize(body.lastname || body.buyer_lastname);
    const email = sanitize(body.email || body.buyer_email).toLowerCase();
    if (!firstname || !lastname || !email) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "firstname, lastname and email are required",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "Invalid email address",
      });
    }

    const merchantIdFromAuth =
      req.user?.merchantId || req.user?._id || req.user?.id || null;

    // Find Invoice (stored as Transaction with status created/pending/...).
    let invoice = null;
    if (mongoose.Types.ObjectId.isValid(invoiceId)) {
      const filter = { _id: invoiceId };
      if (merchantIdFromAuth) filter.merchantId = merchantIdFromAuth;
      invoice = await Transaction.findOne(filter);
    }
    if (!invoice) {
      const filter = { txnId: invoiceId };
      if (merchantIdFromAuth) filter.merchantId = merchantIdFromAuth;
      invoice = await Transaction.findOne(filter);
    }
    if (!invoice) {
      return reply.code(404).send({
        success: false,
        result: null,
        message: "Invoice not found",
      });
    }

    const merchantId = invoice.merchantId;

    if (invoice.address && String(invoice.status) !== "created") {
      let qrcode = invoice.qrcodeUrl || null;
      try {
        qrcode =
          qrcode ||
          (await QRCode.toDataURL(invoice.address, {
            errorCorrectionLevel: "M",
            width: 256,
            margin: 2,
          }));
      } catch (qrErr) {
        console.error("updateInvoice existing qrcode failed:", qrErr?.message || qrErr);
      }
      return reply.code(200).send({
        success: true,
        result: {
          invoiceId: String(invoice._id),
          transactionId: invoice.txnId,
          txn_id: invoice.txnId,
          address: invoice.address,
          qrcode,
          coin: invoice.currency2,
          currency2: invoice.currency2,
          network: invoice.network,
          expiry: invoice.quoteExpiresAt || invoice.expiresAt || null,
          expiresAt: invoice.expiresAt || null,
          quote_expires_at: invoice.quoteExpiresAt
            ? new Date(invoice.quoteExpiresAt).toISOString()
            : null,
          timeout: invoice.timeout ?? null,
          status: "pending",
          paymentType: "INVOICE",
          displayStatus: toDisplayStatus(invoice.status),
        },
        message: "Invoice already has a payment address",
      });
    }

    const amount = Number(invoice.amount);
    const currency1 = String(invoice.currency1 || "").trim().toUpperCase();
    const currency2 = String(invoice.currency2 || "").trim().toUpperCase();
    const requestedNetwork = String(invoice.network || "").trim().toUpperCase();
    if (!Number.isFinite(amount) || amount <= 0 || !currency1 || !currency2 || !requestedNetwork) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "Saved invoice has invalid amount/asset/network",
      });
    }
    const internalNetworkSymbol = resolveInternalNetworkSymbol(requestedNetwork);
    if (!internalNetworkSymbol) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "Unsupported payment network",
      });
    }

    let pair;
    try {
      pair = await validateAssetNetwork(currency2, internalNetworkSymbol);
    } catch (err) {
      if (err && err.code === UNSUPPORTED_PAIR) {
        return reply.code(400).send({
          success: false,
          result: null,
          message: "Currently Deposit not available for this pair",
        });
      }
      throw err;
    }
    if (!pair || !pair.networkDoc || !pair.networkEntry) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "Currency/network combination is not supported",
      });
    }
    const networkDoc = pair.networkDoc;

    invoice.buyerFirstname = firstname;
    invoice.buyerLastname = lastname;
    invoice.buyerEmail = email;
    invoice.fullName = `${firstname} ${lastname}`.trim();
    await invoice.save();

    try {
      await Buyer.findOneAndUpdate(
        { transactionId: invoice._id },
        {
          $set: {
            merchantId: merchantId || null,
            email,
            firstname,
            lastname,
            fullName: `${firstname} ${lastname}`.trim(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (buyerErr) {
      console.error("updateInvoice buyer upsert failed:", buyerErr?.message || buyerErr);
    }

    let quote;
    try {
      quote = await getCryptoQuote({
        fromCurrency: currency1,
        toCurrency: currency2,
        amount: String(amount),
        decimals: pair.networkEntry.decimal,
      });
    } catch (err) {
      if (err && err.code === "PRICE_UNAVAILABLE") {
        console.warn(
          `updateInvoice: no rate for ${currency1}/${currency2}, falling back to 1:1`
        );
        try {
          quote = await getCryptoQuote({
            fromCurrency: currency1,
            toCurrency: currency2,
            amount: String(amount),
            decimals: pair.networkEntry.decimal,
            rateProvider: async () => 1,
          });
        } catch (fallbackErr) {
          console.error("updateInvoice getCryptoQuote fallback error:", fallbackErr?.message || fallbackErr);
          return reply.code(502).send({
            success: false,
            result: null,
            message: "Unable to get current exchange rate",
          });
        }
      } else {
        console.error("updateInvoice getCryptoQuote error:", err?.message || err);
        return reply.code(502).send({
          success: false,
          result: null,
          message: "Unable to get current exchange rate",
        });
      }
    }
    if (!quote || quote.cryptoAmount == null || !quote.rate) {
      return reply.code(502).send({
        success: false,
        result: null,
        message: "Unable to get current exchange rate",
      });
    }

    const networkType = String(networkDoc.type || "").trim().toUpperCase();
    let wallet = null;
    if (networkType === "EVM") {
      wallet = createEvmWallet();
    } else if (networkType === "SOL" || networkType === "SOLANA") {
      wallet = createSolanaWallet();
    } else if (networkType === "TRX" || networkType === "TRON") {
      wallet = await createTronWallet();
    } else {
      return reply.code(400).send({
        success: false,
        result: null,
        message: `Unsupported network type: ${networkDoc.type}`,
      });
    }
    if (!wallet || !wallet.address || !wallet.privateKey) {
      return reply.code(502).send({
        success: false,
        result: null,
        message: "Unable to generate payment address",
      });
    }
    if (!validateAddress(wallet.address, networkDoc.type || internalNetworkSymbol)) {
      return reply.code(502).send({
        success: false,
        result: null,
        message: `Generated address is invalid for network ${networkDoc.networkSymbol}`,
      });
    }

    const lastAddress = await DepositAddress.findOne({ merchantId })
      .sort({ addressIndex: -1 })
      .select("addressIndex")
      .lean();
    const addressIndex = lastAddress ? lastAddress.addressIndex + 1 : 1;
    const depositAddressDoc = await DepositAddress.create({
      merchantId,
      transactionId: invoice._id,
      coin: currency2,
      network: networkDoc.networkSymbol,
      networkId: networkDoc._id,
      isAddressLive: "true",
      address: wallet.address,
      encryptedPrivateKey: encrypt(wallet.privateKey),
      walletIndex: 0,
      addressIndex,
      paymentStatus: "pending",
    });

    const checkoutUrl = buildCheckoutUrl(invoice.txnId);
    invoice.amountInCurrency2 = Number(quote.cryptoAmount);
    invoice.cryptoAmount = String(quote.cryptoAmount);
    invoice.exchangeRate = String(quote.rate);
    invoice.marketRate = String(quote.marketRate || quote.rate);
    invoice.quoteCreatedAt = quote.quoteCreatedAt || new Date();
    invoice.quoteExpiresAt = quote.quoteExpiresAt || null;
    invoice.expiresAt = quote.quoteExpiresAt || null;
    invoice.timeout = quote.quoteTtlSeconds ?? invoice.timeout ?? null;
    invoice.address = depositAddressDoc.address;
    invoice.network = requestedNetwork;
    invoice.paymentType = "INVOICE";
    invoice.buttonType = null;
    invoice.checkoutUrl = checkoutUrl || invoice.checkoutUrl || null;
    invoice.status = "pending";
    await invoice.save();

    try {
      const existingHistory = await DepositHistory.findOne({ txId: String(invoice.txnId).toLowerCase() }).lean();
      if (!existingHistory) {
        await DepositHistory.create({
          merchantId,
          userId: merchantId,
          apiKeyId: invoice.apiKeyId || null,
          address: invoice.address,
          amount: Number(quote.cryptoAmount),
          receivedAmount: 0,
          txId: String(invoice.txnId).toLowerCase(),
          from: null,
          contractAddress: pair.networkEntry.contractAddress || null,
          network: internalNetworkSymbol,
          symbol: currency2,
          decimal: pair.networkEntry.decimal ?? null,
          status: "pending",
          type: "payIn",
          buttonType: null,
          paymentType: "INVOICE",
        });
      }
    } catch (historyErr) {
      if (historyErr?.code !== 11000) {
        console.error("updateInvoice deposit history failed:", historyErr?.message || historyErr);
      }
    }

    if (/^0x[a-fA-F0-9]{40}$/.test(invoice.address)) {
      notifyEvmTrackerStoreAddress(invoice.address, true).catch((trackerErr) => {
        console.error("updateInvoice evm tracker notify failed:", trackerErr?.message || trackerErr);
      });
    }

    try {
      await createNotification({
        user_id: merchantId,
        admin_id: null,
        role: "user",
        title: "Invoice Payment Address Generated",
        description: `Payment address ${invoice.address} created for invoice ${invoice.invoice || String(invoice._id)} (${amount} ${currency1} ~ ${quote.cryptoAmount} ${currency2} on ${requestedNetwork}).`.trim(),
        type: "payIn",
        category: "TRANSACTION",
        status: "info",
        isRead: false,
        seen: false,
        createdBy: null,
      });
    } catch (notificationError) {
      console.error("updateInvoice notification failed:", notificationError?.message || notificationError);
    }

    let qrcode = null;
    try {
      qrcode = await QRCode.toDataURL(invoice.address, {
        errorCorrectionLevel: "M",
        width: 256,
        margin: 2,
      });
    } catch (qrErr) {
      console.error("updateInvoice qrcode failed:", qrErr?.message || qrErr);
    }

    return reply.code(200).send({
      success: true,
      result: {
        invoiceId: String(invoice._id),
        transactionId: invoice.txnId,
        txn_id: invoice.txnId,
        address: invoice.address,
        qrcode,
        coin: currency2,
        currency2,
        network: requestedNetwork,
        expiry: invoice.quoteExpiresAt || invoice.expiresAt || null,
        expiresAt: invoice.expiresAt || null,
        quote_expires_at: invoice.quoteExpiresAt
          ? new Date(invoice.quoteExpiresAt).toISOString()
          : null,
        timeout: invoice.timeout ?? null,
        status: "pending",
        paymentType: "INVOICE",
        displayStatus: "pending",
      },
      message: "Invoice updated successfully",
    });
  } catch (error) {
    req.log?.error?.(error);
    console.error("updateInvoiceNgetAddress error:", error);
    return reply.code(500).send({
      success: false,
      result: null,
      message: "Failed to update invoice",
    });
  }
};

module.exports = {
  updateInvoiceNgetAddress,
};
