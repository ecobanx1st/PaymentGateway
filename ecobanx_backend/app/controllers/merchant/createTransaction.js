const {
  createFixedPriceTransaction,
  generateTxnId,
  TransactionServiceError,
} = require("../../services/transaction/transactionService");
const {
  notifyEvmTrackerStoreAddress,
} = require("../../services/tracker/evmTrackerService");
const { Transaction } = require("../../models/transactionModel");
const QRCode = require("qrcode");

const createTransaction = async (req, reply) => {
  try {
    const data = req.validatedData;
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    const merchantId = req.user.merchantId || req.user._id 

    const result = await createFixedPriceTransaction({
      merchantId,
      data,
      apiKeyId: req.user?.apiKeyId || null,
    });

    // When an address is created/assigned for this transaction,
    if (result?.address) {
      notifyEvmTrackerStoreAddress(result.address, true).catch((trackerErr) => {
        console.error("createTransaction: evm tracker notify failed:", trackerErr?.message || trackerErr);
      });

      try {
        result.qrcode = await QRCode.toDataURL(result.address, {
          errorCorrectionLevel: "M",
          width: 256,
          margin: 2,
        });
      } catch (qrErr) {
        console.error("createTransaction: qrcode generation failed:", qrErr?.message || qrErr);
      }
    }

    return reply.code(200).send({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return reply.code(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    req.log.error({ err: error }, "createTransaction error");
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};


const createInvoiceTransaction = async (req, reply) => {
  try {
    const data = req.validatedData || req.body || {};
    if (!req.user) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "Unauthorized",
      });
    }
    const merchantId = req.user.merchantId || req.user._id || req.user.id;
    if (!merchantId) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "Unauthorized",
      });
    }

    const amountRaw = data.amount ?? data.amountInCurrency ?? data.requestAmount;
    const amountNum = Number(String(amountRaw ?? "").trim());
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "amount must be greater than 0",
      });
    }
    const currency1 = String(data.currency1 || data.currency || data.fiatName || "USD").trim().toUpperCase();
    const currency2 = String(data.currency2 || data.requestCurrency || data.assetSymbol || "").trim().toUpperCase();
    const network = String(data.network || data.NetworkName || "").trim().toUpperCase();
    if (!currency1 || !currency2 || !network) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "currency1, currency2 and network are required",
      });
    }

    const txnId = generateTxnId();
    const requestAmountRaw = data.requestAmount ?? data.request_amount;
    const requestAmountNum = requestAmountRaw != null && String(requestAmountRaw).trim() !== ""
      ? Number(String(requestAmountRaw).trim())
      : NaN;
    const cryptoHint = Number.isFinite(requestAmountNum) && requestAmountNum > 0 ? requestAmountNum : 0;
    const invoiceDoc = await Transaction.create({
      merchantId,
      apiKeyId: req.user?.apiKeyId || null,
      txnId,
      type: "payin",
      amount: amountNum,
      currency1,
      amountInCurrency2: cryptoHint,
      cryptoAmount: Number.isFinite(requestAmountNum) && requestAmountNum > 0 ? String(requestAmountNum) : null,
      currency2,
      network,
      address: null,
      buyerEmail: data.buyer_email || data.buyerEmail || null,
      buyerFirstname: data.buyer_firstname || data.buyerFirstname || null,
      buyerLastname: data.buyer_lastname || data.buyerLastname || null,
      fullName: data.full_name || null,
      buyerName: data.buyer_name || null,
      itemName: data.item_name || data.itemName || null,
      itemNumber: data.item_number || data.itemNumber || null,
      invoice: data.invoice || null,
      custom: data.custom || String(data.merchantId || "") || null,
      item_description: data.item_description || data.itemDescription || data.requestDescription || null,
      item_quantity: data.item_quantity != null && data.item_quantity !== "" ? Number(data.item_quantity) : null,
      tax_amount: data.tax_amount != null && data.tax_amount !== "" ? Number(data.tax_amount) : (data.taxAmount != null && data.taxAmount !== "" ? Number(data.taxAmount) : null),
      shipping_cost: data.shipping_cost != null && data.shipping_cost !== "" ? Number(data.shipping_cost) : (data.shippingCost != null && data.shippingCost !== "" ? Number(data.shippingCost) : null),
      ipnUrl: data.ipn_url || data.ipnUrl || null,
      successUrl: data.success_url || data.successUrl || null,
      cancelUrl: data.cancel_url || data.cancelUrl || null,
      // Invoices never store buttonType (button flows only).
      buttonType: null,
      paymentType: "INVOICE",
      status: "created",
      timeout: null,
      quoteCreatedAt: null,
      quoteExpiresAt: null,
      expiresAt: null,
      checkoutUrl: null,
      qrcodeUrl: null,
    });

    const saved = invoiceDoc.toObject ? invoiceDoc.toObject() : invoiceDoc;
    return reply.code(201).send({
      success: true,
      result: {
        invoiceId: String(saved._id),
        txn_id: saved.txnId,
        invoice: saved,
      },
      message: "Invoice created successfully",
    });
  } catch (error) {
    req.log?.error({ err: error }, "createInvoiceTransaction error");
    return reply.code(500).send({
      success: false,
      result: null,
      message: "Internal server error",
    });
  }
};

module.exports = { createTransaction, createInvoiceTransaction };
