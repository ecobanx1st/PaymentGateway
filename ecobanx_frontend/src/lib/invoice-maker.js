export const INVOICE_MAKER_ROUTE = "/User/merchant/payment-request-invoice-maker";
export const INVOICE_PREVIEW_ROUTE = `${INVOICE_MAKER_ROUTE}/preview`;
export const INVOICE_CHECKOUT_ROUTE = "/checkout/invoice";

export const invoiceFiatOptions = [
  { label: "USD", value: "USD" },
  // { label: "EUR", value: "EUR" },
  // { label: "GBP", value: "GBP" },
  // { label: "INR", value: "INR" },
];

export const invoiceCryptoOptions = [
  { label: "BTC", value: "BTC" },
  { label: "ETH", value: "ETH" },
  { label: "USDT", value: "USDT" },
  { label: "USDC", value: "USDC" },
  { label: "TRX", value: "TRX" },
];

export const defaultInvoiceValues = {
  merchantId: "",
  amount: "0",
  currency: "USD",
  requestAmount: "0",
  requestCurrency: "",
  network: "",
  requestDescription: "",
  invoice: "",
  taxAmount: "0.00000000",
  collectShippingAddress: false,
  shippingCost: "0.00000000",
  ipnUrl: "",
  allowBuyerNote: false,
  generatedOn: "",
  buyerName: "",
  buyerEmail: "",
  txn: "",
};

const invoiceParamMap = {
  merchantId: "merchant_id",
  amount: "amount",
  currency: "currency",
  requestAmount: "request_amount",
  requestCurrency: "request_currency",
  network: "network",
  requestDescription: "request_description",
  invoice: "invoice",
  taxAmount: "tax_amount",
  collectShippingAddress: "collect_shipping_address",
  shippingCost: "shipping_cost",
  ipnUrl: "ipn_url",
  allowBuyerNote: "allow_buyer_note",
  generatedOn: "generated_on",
  buyerName: "buyer_name",
  buyerEmail: "buyer_email",
  txn: "txn",
};

const coinNames = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether USD",
  USDC: "USD Coin",
  TRX: "TRON",
  BNB: "BNB",
  CHS: "Chris",
};

const coinIcons = {
  BTC: "/coins/btc.svg",
  ETH: "/coins/eth.svg",
  USDT: "/coins/usdt.svg",
  TRX: "/coins/trx.svg",
};

function trimValue(value) {
  return String(value ?? "").trim();
}

function firstParam(source, key, fallback = "") {
  const value = source?.[key];

  if (Array.isArray(value)) return trimValue(value[0] ?? fallback);
  if (value !== undefined && value !== null) return trimValue(value);

  return trimValue(fallback);
}

function paramValue(source, camelKey) {
  return firstParam(
    source,
    invoiceParamMap[camelKey],
    firstParam(source, camelKey, defaultInvoiceValues[camelKey]),
  );
}

function booleanParam(source, camelKey) {
  const value = paramValue(source, camelKey).toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeSlug(value, fallback = "invoice") {
  const slug = trimValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

  return slug || fallback;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function numericAmount(value) {
  const numberValue = Number(trimValue(value));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function formatDecimalInput(value) {
  return String(value ?? "")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");
}

export function isPositiveAmount(value) {
  const numberValue = Number(trimValue(value));
  return Number.isFinite(numberValue) && numberValue > 0;
}

export function isNonNegativeAmount(value) {
  const trimmed = trimValue(value);
  if (!trimmed) return true;

  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) && numberValue >= 0;
}

export function isHttpUrl(value) {
  const trimmed = trimValue(value);
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeInvoiceValues(source = {}) {
  return {
    merchantId: paramValue(source, "merchantId"),
    amount: paramValue(source, "amount"),
    currency: paramValue(source, "currency"),
    requestAmount: paramValue(source, "requestAmount"),
    requestCurrency: paramValue(source, "requestCurrency"),
    network: paramValue(source, "network"),
    requestDescription: paramValue(source, "requestDescription"),
    invoice: paramValue(source, "invoice"),
    taxAmount: paramValue(source, "taxAmount"),
    collectShippingAddress: booleanParam(source, "collectShippingAddress"),
    shippingCost: paramValue(source, "shippingCost"),
    ipnUrl: paramValue(source, "ipnUrl"),
    allowBuyerNote: booleanParam(source, "allowBuyerNote"),
    generatedOn: paramValue(source, "generatedOn"),
    buyerName: paramValue(source, "buyerName"),
    buyerEmail: paramValue(source, "buyerEmail"),
    txn: firstParam(source, "txn", firstParam(source, "txn_id", defaultInvoiceValues.txn)),
  };
}

export function formatInvoiceAmount(value, currency = "") {
  const formatted = numericAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });

  return currency ? `${formatted} ${currency}` : formatted;
}

export function validateInvoiceValues(values, extraErrors = {}) {
  const normalized = normalizeInvoiceValues(values);
  const errors = { ...extraErrors };

  if (!normalized.merchantId) errors.merchantId = "Merchant ID is required.";
  if (!isPositiveAmount(normalized.amount)) {
    errors.amount = "Enter an amount greater than zero.";
  }
  if (!isPositiveAmount(normalized.requestAmount)) {
    errors.requestAmount = "Enter a request amount greater than zero.";
  }
  if (!normalized.requestCurrency) {
    errors.requestCurrency = "Select a crypto asset.";
  }
  if (!normalized.network) {
    errors.network = "Select a network.";
  }
  if (!normalized.requestDescription) {
    errors.requestDescription = "Request description is required.";
  }
  if (!normalized.invoice) errors.invoice = "Invoice ID is required.";
  if (!isNonNegativeAmount(normalized.taxAmount)) {
    errors.taxAmount = "Enter zero or a positive tax amount.";
  }
  if (!isNonNegativeAmount(normalized.shippingCost)) {
    errors.shippingCost = "Enter zero or a positive shipping cost.";
  }
  if (normalized.ipnUrl && !isHttpUrl(normalized.ipnUrl)) {
    errors.ipnUrl = "Enter a valid HTTP or HTTPS IPN URL.";
  }
  if (normalized.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.buyerEmail)) {
    errors.buyerEmail = "Enter a valid email address.";
  }

  return errors;
}

export function buildInvoiceSearchParams(values) {
  const normalized = normalizeInvoiceValues(values);
  normalized.generatedOn = normalized.generatedOn || todayIsoDate();
  const params = new URLSearchParams();

  Object.entries(invoiceParamMap).forEach(([key, paramName]) => {
    const value = normalized[key];
    const stringValue =
      typeof value === "boolean" ? (value ? "1" : "0") : trimValue(value);

    if (!stringValue && (key === "ipnUrl" || key === "shippingCost" || key === "buyerName" || key === "buyerEmail" || key === "txn")) return;
    params.set(paramName, stringValue);
  });

  if (normalized.txn) {
    params.set("txn", normalized.txn);
  }

  return params;
}

export function buildInvoicePreviewUrl(values) {
  return `${INVOICE_PREVIEW_ROUTE}?${buildInvoiceSearchParams(values).toString()}`;
}

export function buildInvoiceCheckoutUrl(values, origin = "") {
  const prefix = trimValue(origin).replace(/\/+$/g, "");
  const txn = trimValue(values?.txn || values?.txn_id);
  if (txn) {
    return `${prefix}${INVOICE_CHECKOUT_ROUTE}?txn=${encodeURIComponent(txn)}`;
  }
  return `${prefix}${INVOICE_CHECKOUT_ROUTE}?${buildInvoiceSearchParams(values).toString()}`;
}

export function buildCreateButtonTransactionPayload(values, origin = "") {
  const normalized = normalizeInvoiceValues(values);
  const nameParts = String(normalized.buyerName || "").trim().split(/\s+/);
  const buyer_firstname = nameParts[0] || "Customer";
  const buyer_lastname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Buyer";
  const buyer_email = normalized.buyerEmail || "customer@ecobanx.net";
  const siteOrigin = trimValue(origin) || (typeof window !== "undefined" ? window.location.origin : "");
  const fallbackIpn = siteOrigin ? `${siteOrigin}/api/ipn` : "https://ecobanx.net/api/ipn";

  const payload = {
    cmd: "create_transaction",
    amount: String(normalized.amount || "0"),
    currency1: String(normalized.currency || "USD"),
    currency2: String(normalized.requestCurrency || "USDT"),
    network: String(normalized.network || ""),
    buyer_firstname,
    buyer_lastname,
    buyer_email,
    ipn_url: normalized.ipnUrl || fallbackIpn,
    buttonType: "simple",
    item_name: normalized.invoice ? `Invoice ${normalized.invoice}` : "Invoice payment",
    item_description: normalized.requestDescription || "Invoice payment",
    item_number: normalized.invoice || "",
    invoice: normalized.invoice || "",
    custom: normalized.merchantId || "",
  };

  if (siteOrigin) {
    payload.success_url = `${siteOrigin}/payment-success`;
    payload.cancel_url = `${siteOrigin}/payment-cancelled`;
  }

  return payload;
}

export const CREATE_INVOICE_TRANSACTION_PATH = "/merchant/create_invoice_transaction";
export const UPDATE_INVOICE_TRANSACTION_PATH = "/merchant/update_invoice_transaction";
export const UPDATE_INVOICE_PUBLIC_PATH = "/checkout/invoice/update";
export const INVOICE_DETAIL_ROUTE = "/invoice";

export function buildCreateInvoiceTransactionPayload(values, origin = "") {
  const normalized = normalizeInvoiceValues(values);
  const siteOrigin = trimValue(origin) || (typeof window !== "undefined" ? window.location.origin : "");
  const payload = {
    amount: String(normalized.amount || "0"),
    currency1: String(normalized.currency || "USD"),
    currency2: String(normalized.requestCurrency || "USDT"),
    network: String(normalized.network || ""),
    item_name: normalized.invoice ? `Invoice ${normalized.invoice}` : "Invoice payment",
    item_description: normalized.requestDescription || "Invoice payment",
    item_number: normalized.invoice || "",
    invoice: normalized.invoice || "",
    custom: normalized.merchantId || "",
    requestAmount: String(normalized.requestAmount || "0"),
    requestCurrency: String(normalized.requestCurrency || ""),
    requestDescription: normalized.requestDescription || "",
    taxAmount: String(normalized.taxAmount || "0"),
    shippingCost: String(normalized.shippingCost || "0"),
  };
  if (normalized.ipnUrl) payload.ipn_url = normalized.ipnUrl;
  if (siteOrigin) {
    payload.success_url = `${siteOrigin}/payment-success`;
    payload.cancel_url = `${siteOrigin}/payment-cancelled`;
  }
  return payload;
}

export function buildUpdateInvoicePayload(invoiceId, buyer) {
  return {
    invoiceId: String(invoiceId || ""),
    firstname: String(buyer?.firstname || "").trim(),
    lastname: String(buyer?.lastname || "").trim(),
    email: String(buyer?.email || "").trim().toLowerCase(),
  };
}

export function mapInvoiceDisplayStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed" || s === "completed") return "completed";
  if (s === "failed") return "failed";
  if (s === "expired") return "expired";
  if (s === "cancelled") return "failed";
  if (s === "pending") return "pending";
  if (s === "created") return "created";
  return s || "pending";
}

export function buildInvoiceDetailUrl(invoiceId) {
  return `${INVOICE_DETAIL_ROUTE}/${encodeURIComponent(String(invoiceId || ""))}`;
}

export function buildCheckoutDetailUrl(transactionId) {
  return `/checkout/${encodeURIComponent(String(transactionId || ""))}`;
}

export function getInvoiceFilename(values) {
  return `ecobanx-${safeSlug(values?.invoice)}.html`;
}

export function getInvoiceCheckoutPayload(values) {
  const normalized = normalizeInvoiceValues(values);
  const requestCurrency = normalized.requestCurrency || "USDT";

  return {
    id: normalized.invoice || "HP-INVOICE",
    paymentId: normalized.invoice || "HP-INVOICE",
    txn: normalized.txn || "",
    itemName: normalized.invoice
      ? `Invoice ${normalized.invoice}`
      : "Payment request invoice",
    itemDescription:
      normalized.requestDescription || "Secure Eco Banx invoice payment",
    paymentAmount: normalized.amount || "0",
    paymentCurrency: normalized.currency || "USD",
    merchantId: normalized.merchantId,
    invoice: normalized.invoice,
    network: normalized.network,
    taxAmount: normalized.taxAmount,
    shippingCost: normalized.shippingCost,
    collectShippingAddress: normalized.collectShippingAddress,
    allowBuyerNote: normalized.allowBuyerNote,
    acceptedCoins: [
      {
        symbol: requestCurrency,
        name: coinNames[requestCurrency] || requestCurrency,
        amount: normalized.requestAmount || "0",
        icon: coinIcons[requestCurrency] || "/coins/usdt.svg",
      },
    ],
  };
}

export function getInvoiceBillSummary(values) {
  const normalized = normalizeInvoiceValues(values);
  const subtotal = numericAmount(normalized.amount);
  const tax = numericAmount(normalized.taxAmount);
  const shipping = numericAmount(normalized.shippingCost);
  const total = subtotal + tax + shipping;
  const issueDate = normalized.generatedOn || "Today";

  return {
    values: normalized,
    issueDate,
    dueDate: "Due on receipt",
    status: "Unpaid",
    subtotal,
    tax,
    shipping,
    total,
    subtotalLabel: formatInvoiceAmount(subtotal, normalized.currency),
    taxLabel: formatInvoiceAmount(tax, normalized.currency),
    shippingLabel: formatInvoiceAmount(shipping, normalized.currency),
    totalLabel: formatInvoiceAmount(total, normalized.currency),
    requestLabel: formatInvoiceAmount(
      normalized.requestAmount,
      normalized.requestCurrency,
    ),
  };
}

export function buildInvoicePreviewHtml(values, checkoutUrl) {
  const summary = getInvoiceBillSummary(values);
  const normalized = summary.values;
  const checkout = trimValue(checkoutUrl) || buildInvoiceCheckoutUrl(normalized);
  const shippingText = normalized.collectShippingAddress ? "Required" : "Not collected";
  const noteText = normalized.allowBuyerNote ? "Allowed" : "Not allowed";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Eco Banx Invoice ${escapeHtml(normalized.invoice || "")}</title>
    <style>
      :root { color-scheme: light; --primary: #0500ff; --text: #111827; --muted: #667085; --border: #e5e7eb; --card: #ffffff; --bg: #f7f7fb; --soft: #f8fafc; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 32px; }
      main { width: min(100%, 920px); margin: 0 auto; }
      .invoice { border: 1px solid var(--border); border-radius: 22px; background: var(--card); padding: 34px; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12); }
      .top { display: flex; justify-content: space-between; gap: 32px; border-bottom: 2px solid #111827; padding-bottom: 26px; }
      .brand { font-size: 26px; font-weight: 900; letter-spacing: 0.04em; }
      .muted { color: var(--muted); }
      h1 { margin: 0; font-size: 42px; line-height: 1; letter-spacing: 0.08em; }
      .meta { margin-top: 16px; display: grid; gap: 8px; text-align: right; font-size: 14px; }
      .meta div { display: flex; justify-content: flex-end; gap: 14px; }
      .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding: 28px 0; }
      .box { border: 1px solid var(--border); border-radius: 16px; background: var(--soft); padding: 18px; }
      .box h2 { margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); }
      .box p { margin: 4px 0; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 14px; }
      th { background: #111827; color: white; padding: 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      td { border-bottom: 1px solid var(--border); padding: 16px 14px; font-size: 14px; vertical-align: top; }
      th:last-child, td:last-child { text-align: right; }
      .totals { margin-left: auto; width: min(100%, 360px); padding-top: 18px; }
      .total-row { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--border); padding: 12px 0; font-size: 14px; }
      .grand { border: 0; color: var(--text); font-size: 20px; font-weight: 900; }
      .payment { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; border-radius: 18px; background: #f1ecff; padding: 20px; }
      .payment strong { display: block; margin-top: 4px; font-size: 20px; }
      a { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 999px; background: var(--primary); color: white; padding: 0 20px; font-weight: 800; text-decoration: none; }
      .fine { margin-top: 22px; border-top: 1px solid var(--border); padding-top: 18px; font-size: 13px; line-height: 1.7; color: var(--muted); }
      @media (max-width: 720px) { body { padding: 16px; } .invoice { padding: 22px; } .top, .parties { grid-template-columns: 1fr; display: grid; } .meta { text-align: left; } .meta div { justify-content: space-between; } h1 { font-size: 32px; } }
    </style>
  </head>
  <body>
    <main>
      <section class="invoice">
        <div class="top">
          <div>
            <div class="brand">ECO BANX</div>
            <p class="muted">Secure crypto payment invoice</p>
          </div>
          <div>
            <h1>INVOICE</h1>
            <div class="meta">
              <div><span class="muted">Invoice No.</span><strong>${escapeHtml(normalized.invoice || "INV-0001")}</strong></div>
              <div><span class="muted">Issue date</span><strong>${escapeHtml(summary.issueDate)}</strong></div>
              <div><span class="muted">Status</span><strong>${escapeHtml(summary.status)}</strong></div>
            </div>
          </div>
        </div>

        <div class="parties">
          <div class="box">
            <h2>Bill From</h2>
            <p><strong>Eco Banx Merchant</strong></p>
            <p>Merchant ID: ${escapeHtml(normalized.merchantId)}</p>
            <p>IPN: ${escapeHtml(normalized.ipnUrl || "Account default")}</p>
          </div>
          <div class="box">
            <h2>Bill To</h2>
            <p><strong>Customer / Buyer</strong></p>
            <p>Buyer details collected at checkout</p>
            <p>Shipping address: ${escapeHtml(shippingText)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(normalized.requestDescription || "Payment request")}</td>
              <td>1</td>
              <td>${escapeHtml(summary.subtotalLabel)}</td>
              <td>${escapeHtml(summary.subtotalLabel)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal</span><strong>${escapeHtml(summary.subtotalLabel)}</strong></div>
          <div class="total-row"><span>Tax</span><strong>${escapeHtml(summary.taxLabel)}</strong></div>
          <div class="total-row"><span>Shipping</span><strong>${escapeHtml(summary.shippingLabel)}</strong></div>
          <div class="total-row grand"><span>Total due</span><strong>${escapeHtml(summary.totalLabel)}</strong></div>
        </div>

        <div class="payment">
          <div>
            <span class="muted">Requested crypto payment</span>
            <strong>${escapeHtml(summary.requestLabel)}</strong>
          </div>
          <a href="${escapeHtml(checkout)}">Open checkout</a>
        </div>

        <p class="fine">
          Buyer note: ${escapeHtml(noteText)}. This invoice was generated by Eco Banx Merchant Tools.
          Payment is completed through the secure checkout link above.
        </p>
      </section>
    </main>
  </body>
</html>`;
}
