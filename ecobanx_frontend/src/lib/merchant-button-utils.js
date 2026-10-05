import brandLogo from "@/components/assets/darklogo.png";

export const CREATE_BUTTON_TRANSACTION_PATH = "/merchant/create_button_transaction";

export function getBackendBaseUrl() {
  const fromEnv =
    (typeof process !== "undefined" &&
      (process.env?.NEXT_PUBLIC_BACKEND_URL || process.env?.REACT_APP_BACKEND_URL)) ||
    "";
  const trimmed = String(fromEnv || "").trim().replace(/\/+$/, "");
  if (trimmed) return trimmed;
  return "http://localhost:3700/ecobanxApi";
}

export function getCreateButtonTransactionUrl() {
  return `${getBackendBaseUrl()}${CREATE_BUTTON_TRANSACTION_PATH}`;
}

// Kept for backward compatibility; new buttons use create_button_transaction.
export const MERCHANT_PAYMENT_ENDPOINT = getCreateButtonTransactionUrl();

export const ECO_BANX_BUTTON_TEXT = "Pay using";
export const ECO_BANX_LOGO_ALT = "Eco Banx";
export const ECO_BANX_LOGO_DATA_URL = brandLogo.src;

export function trimValue(value) {
  return String(value ?? "").trim();
}

export function formatAmountInput(value) {
  return String(value ?? "").replace(/[^0-9.]/g, "");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isPositiveNumber(value) {
  const trimmed = trimValue(value);
  if (!trimmed) return false;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) && numberValue > 0;
}

export function isNonNegativeNumber(value) {
  const trimmed = trimValue(value);
  if (!trimmed) return true;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) && numberValue >= 0;
}

export function isHttpUrl(value) {
  const trimmed = trimValue(value);
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

export function getOption(options, value) {
  return options.find((option) => option.value === value) || options[0];
}

export function safeFilename(name, fallback = "payment-button.html") {
  const safe = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe ? `${safe}.html` : fallback;
}

export function collectConfiguredFields(sections) {
  return sections.flatMap((section) => section.fields || []);
}

export function buildInitialValues(sections) {
  const values = {};

  collectConfiguredFields(sections).forEach((field) => {
    if (field.type === "currencyAmount") {
      values[field.id] = field.defaultValue ?? "";
      values[field.currencyId] = field.defaultCurrency ?? field.currencyOptions?.[0]?.value ?? "";
      return;
    }

    if (field.type === "imageUpload") {
      values[field.id] = null;
      values[field.dataUrlId] = field.defaultDataUrl || "";
      values[field.nameId] = "";
      return;
    }

    values[field.id] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
  });

  return values;
}

export function buildInitialRequiredFields(sections) {
  return collectConfiguredFields(sections).reduce((acc, field) => {
    if (field.requiredMode === "none") return acc;
    acc[field.id] = Boolean(field.required);
    return acc;
  }, {});
}

export function validateMerchantButtonForm({ sections, values, requiredFields, uploadErrors = {} }) {
  const errors = {};

  collectConfiguredFields(sections).forEach((field) => {
    const required = Boolean(requiredFields[field.id]);

    if (field.type === "currencyAmount") {
      if (required && !trimValue(values[field.id])) errors[field.id] = "This field is required.";
      if (field.validation === "positive" && !isPositiveNumber(values[field.id])) {
        errors[field.id] = "Enter an amount greater than zero.";
      }
      if (field.validation === "nonNegative" && !isNonNegativeNumber(values[field.id])) {
        errors[field.id] = "Enter zero or a positive amount.";
      }
      return;
    }

    if (field.disabledWhen?.(values)) return;

    if (required && field.type === "imageUpload" && !values[field.dataUrlId]) {
      errors[field.id] = "Image is required.";
      return;
    }

    if (required && field.type !== "checkbox" && field.type !== "imageUpload" && !trimValue(values[field.id])) {
      errors[field.id] = "This field is required.";
    }

    if (field.validation === "positive" && !isPositiveNumber(values[field.id])) {
      errors[field.id] = "Enter an amount greater than zero.";
    }

    if (field.validation === "nonNegative" && !isNonNegativeNumber(values[field.id])) {
      errors[field.id] = "Enter zero or a positive amount.";
    }

    if (field.validation === "url" && trimValue(values[field.id]) && !isHttpUrl(values[field.id])) {
      errors[field.id] = "Enter a valid HTTP or HTTPS URL.";
    }

    if (field.validation?.pattern && trimValue(values[field.id])) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(trimValue(values[field.id]))) {
        errors[field.id] = field.validation.patternError || "Invalid format.";
      }
    }

    if (uploadErrors[field.id]) {
      errors[field.id] = uploadErrors[field.id];
    }
  });

  return errors;
}

function hiddenInput(name, value, required) {
  const requiredAttribute = required ? " required" : "";
  return `    <input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}"${requiredAttribute} />`;
}

export function collectGeneratedFields({ sections, values, requiredFields }) {
  const generated = [];

  collectConfiguredFields(sections).forEach((field) => {
    if (field.generated === false || field.type === "buttonPreview" || field.type === "assetButton") return;
    if (field.disabledWhen?.(values)) return;

    if (field.type === "currencyAmount") {
      generated.push({
        name: field.generatedFieldName,
        value: values[field.id],
        required: Boolean(requiredFields[field.id]),
      });
      generated.push({
        name: field.currencyGeneratedFieldName,
        value: values[field.currencyId],
        required: Boolean(requiredFields[field.id]),
      });
      return;
    }

    if (field.type === "imageUpload") {
      if (values[field.dataUrlId]) {
        generated.push({
          name: field.generatedFieldName,
          value: values[field.dataUrlId],
          required: Boolean(requiredFields[field.id]),
        });
      }
      return;
    }

    const value = field.type === "checkbox" ? (values[field.id] ? "1" : "0") : values[field.id];
    const hasValue = field.type === "checkbox" || trimValue(value);
    if (!hasValue && !requiredFields[field.id]) return;

    generated.push({
      name: field.generatedFieldName,
      value,
      required: Boolean(requiredFields[field.id]),
    });
  });

  return generated;
}

function buildButtonMarkup(buttonAppearance) {
  const icon = buttonAppearance.iconDataUrl
    ? `\n      <img src="${escapeHtml(buttonAppearance.iconDataUrl)}" alt="${escapeHtml(buttonAppearance.iconAlt || "")}" class="hashpay-button-logo" />`
    : "";

  return `    <button type="submit" class="hashpay-payment-button">\n      <span class="hashpay-button-radio" aria-hidden="true"></span>\n      <span class="hashpay-button-text">${escapeHtml(buttonAppearance.text)}</span>${icon}\n    </button>`;
}

function buildTransactionBaseFromValues(values, toolType) {
  const amount = String(values.fiatAmount ?? values.donationAmount ?? values.requestAmount ?? "0");
  const currency1 = String(values.fiatCurrency ?? values.donationCurrency ?? "USD");
  const currency2 = String(values.cryptoCurrency ?? "USDT");
  const normalizedTool = toolType === "advanced" ? "advanced" : "simple";
  return {
    cmd: "create_transaction",
    amount,
    currency1,
    currency2,
    network: String(values.network ?? ""),
    merchant_id: String(values.merchantId ?? ""),
    item_name: String(values.itemName ?? values.donationName ?? ""),
    item_number: String(values.itemNumber ?? ""),
    invoice: String(values.invoice ?? ""),
    itemDescription: String(values.itemDescription ?? values.donationDescription ?? ""),
    item_quantity: String(values.itemQuantity ?? ""),
    tax_amount: String(values.taxAmount ?? ""),
    shipping_cost: String(values.shippingCostFirstItem ?? ""),
    success_url: String(values.successUrl ?? ""),
    cancel_url: String(values.cancelUrl ?? ""),
    ipn_url: String(values.ipnUrl ?? ""),
    buttonType: normalizedTool,
  };
}

function buildPaymentForm({ endpoint, checkoutPageUrl, sections, values, requiredFields, buttonAppearance, toolType }) {
  const hiddenInputs = collectGeneratedFields({ sections, values, requiredFields })
    .map((field) => hiddenInput(field.name, field.value, field.required))
    .join("\n");

  const basePayload = buildTransactionBaseFromValues(values, toolType);
  const configJson = JSON.stringify({ endpoint, checkoutPageUrl, button: basePayload }).replace(/</g, "\\u003c");

  return `<form method="POST" action="${escapeHtml(endpoint)}" class="hashpay-payment-form" id="hashpay-payment-form" data-create-transaction-url="${escapeHtml(endpoint)}">\n${hiddenInputs}\n\n${buildButtonMarkup(buttonAppearance)}\n  </form>\n\n  <div class="hashpay-popup-overlay" id="hashpay-popup" hidden>\n    <div class="hashpay-popup" role="dialog" aria-modal="true" aria-label="Buyer details">\n      <h2 class="hashpay-popup-title">Buyer details</h2>\n      <p class="hashpay-popup-sub">Enter your name and email to continue to checkout.</p>\n      <label class="hashpay-field"><span>First name</span><input id="hashpay-firstname" type="text" autocomplete="given-name" placeholder="First name" /></label>\n      <label class="hashpay-field"><span>Last name</span><input id="hashpay-lastname" type="text" autocomplete="family-name" placeholder="Last name" /></label>\n      <label class="hashpay-field"><span>Email</span><input id="hashpay-email" type="email" autocomplete="email" placeholder="you@example.com" /></label>\n      <p class="hashpay-error" id="hashpay-buyer-error" hidden></p>\n      <div class="hashpay-popup-actions">\n        <button type="button" class="hashpay-secondary-btn" id="hashpay-popup-close">Cancel</button>\n        <button type="button" class="hashpay-primary-btn" id="hashpay-buyer-continue">Continue</button>\n      </div>\n      <div class="hashpay-checkout-wrap" id="hashpay-checkout-wrap" hidden>\n        <p class="hashpay-checkout-summary" id="hashpay-checkout-summary"></p>\n        <button type="button" class="hashpay-primary-btn hashpay-checkout-btn" id="hashpay-checkout-btn">Checkout</button>\n        <p class="hashpay-status" id="hashpay-status" hidden></p>\n      </div>\n    </div>\n  </div>\n  <script type="application/json" id="hashpay-button-config">${configJson}</script>`;
}

function buildButtonFlowScript() {
  return `<script>
(function () {
  var form = document.getElementById("hashpay-payment-form");
  var popup = document.getElementById("hashpay-popup");
  var closeBtn = document.getElementById("hashpay-popup-close");
  var continueBtn = document.getElementById("hashpay-buyer-continue");
  var checkoutWrap = document.getElementById("hashpay-checkout-wrap");
  var checkoutBtn = document.getElementById("hashpay-checkout-btn");
  var checkoutSummary = document.getElementById("hashpay-checkout-summary");
  var buyerError = document.getElementById("hashpay-buyer-error");
  var statusEl = document.getElementById("hashpay-status");
  var cfgEl = document.getElementById("hashpay-button-config");
  var cfg = { endpoint: "", checkoutPageUrl: "", button: {} };
  try { cfg = JSON.parse(cfgEl ? cfgEl.textContent : "{}"); } catch (e) {}
  var endpoint = cfg.endpoint || (form ? form.getAttribute("action") : "");
  var checkoutBase = cfg.checkoutPageUrl || "";
  var buyer = { firstname: "", lastname: "", email: "" };

  function showError(msg) {
    if (!buyerError) return;
    buyerError.textContent = msg;
    buyerError.hidden = !msg;
  }
  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.hidden = !msg;
  }
  function openPopup() { if (popup) popup.hidden = false; }
  function closePopup() { if (popup) popup.hidden = true; }
  function goToCheckoutPage(r) {
    // Checkout page loads the full create_button_transaction response itself.
    var txn = String((r && r.txn_id) || "");
    window.location.href = checkoutBase + (txn ? "?txn=" + encodeURIComponent(txn) : "");
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      showError("");
      if (checkoutWrap) checkoutWrap.hidden = true;
      setStatus("");
      openPopup();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (popup) {
    popup.addEventListener("click", function (ev) {
      if (ev.target === popup) closePopup();
    });
  }
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      var fn = document.getElementById("hashpay-firstname");
      var ln = document.getElementById("hashpay-lastname");
      var em = document.getElementById("hashpay-email");
      buyer.firstname = (fn && fn.value || "").trim();
      buyer.lastname = (ln && ln.value || "").trim();
      buyer.email = (em && em.value || "").trim();
      if (!buyer.firstname) { showError("Enter your first name."); return; }
      if (!buyer.lastname) { showError("Enter your last name."); return; }
      if (!buyer.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(buyer.email)) { showError("Enter a valid email address."); return; }
      showError("");
      if (checkoutSummary) {
        checkoutSummary.textContent = "Paying as " + buyer.firstname + " " + buyer.lastname + " (" + buyer.email + ")";
      }
      if (checkoutWrap) checkoutWrap.hidden = false;
    });
  }
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var b = (cfg && cfg.button) || {};
      var payload = {
        cmd: "create_transaction",
        amount: String(b.amount || "0"),
        currency1: String(b.currency1 || "USD"),
        currency2: String(b.currency2 || "USDT"),
        network: String(b.network || ""),
        buyer_firstname: buyer.firstname,
        buyer_lastname: buyer.lastname,
        buyer_email: buyer.email,
        ipn_url: String(b.ipn_url || ""),
        buttonType: String(b.buttonType || "simple"),
        item_name: String(b.item_name || ""),
        item_description: String(b.itemDescription || ""),
        item_number: String(b.item_number || ""),
        invoice: String(b.invoice || ""),
        item_quantity: String(b.item_quantity || ""),
        tax_amount: String(b.tax_amount || ""),
        shipping_cost: String(b.shipping_cost || ""),

      };
      if (b.success_url) payload.success_url = String(b.success_url);
      if (b.cancel_url) payload.cancel_url = String(b.cancel_url);
      if (b.merchant_id) payload.custom = String(b.merchant_id);
      checkoutBtn.disabled = true;
      setStatus("Creating transaction…");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return { success: false, message: "Invalid server response." }; }).then(function (data) {
          return { status: res.status, data: data };
        });
      }).then(function (out) {
        var data = out.data || {};
        if (data.success) {
          if (!checkoutBase) {
            setStatus("");
            showError("Checkout page URL is not configured in this button.");
            return;
          }
          setStatus("Payment created. Redirecting to checkout…");
          goToCheckoutPage(data.result || {});
        } else {
          setStatus("");
          showError((data && data.message) || "Failed to create transaction.");
        }
      }).catch(function (err) {
        showError((err && err.message) || "Network error. Please try again.");
      }).finally(function () {
        checkoutBtn.disabled = false;
      });
    });
  }
})();
</script>`;
}

export function generatePaymentButtonHtml({
  title,
  endpoint = MERCHANT_PAYMENT_ENDPOINT,
  checkoutPageUrl = "",
  sections,
  values,
  requiredFields,
  buttonAppearance,
  toolType = "simple",
  previewOnly = false,
}) {
  const paymentForm = buildPaymentForm({ endpoint, checkoutPageUrl, sections, values, requiredFields, buttonAppearance, toolType });
  const flowScript = previewOnly ? "" : buildButtonFlowScript();
  const tabTitle = title || "Eco Banx Payment";
  const css = `
    :root { color-scheme: light; --hashpay-primary: #0500FF; --hashpay-primary-hover: #0400CC; --hashpay-text: #0f1f15; --hashpay-muted: #5f6d62; --hashpay-bg: #f5f9f6; --hashpay-card: #ffffff; --hashpay-border: rgba(5, 0, 255, 0.28); }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--hashpay-bg); color: var(--hashpay-text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: clamp(14px, 5vw, 24px); }
    .hashpay-payment-card { width: min(100%, 440px); min-width: 0; border: ${previewOnly ? "0" : "1px solid var(--hashpay-border)"}; border-radius: 18px; background: var(--hashpay-card); padding: ${previewOnly ? "0" : "clamp(16px, 5vw, 24px)"}; box-shadow: ${previewOnly ? "none" : "0 24px 70px rgba(8, 19, 12, 0.14), 0 0 48px rgba(75, 71, 255, 0.08)"}; }
    .hashpay-payment-title { margin: 0; font-size: 20px; line-height: 1.25; font-weight: 800; }
    .hashpay-payment-meta { margin: 8px 0 20px; color: var(--hashpay-muted); font-size: 14px; line-height: 1.5; }
    .hashpay-payment-form { margin: 0; display: flex; justify-content: center; }
    .hashpay-payment-button { display: inline-flex; min-height: 48px; width: min(100%, 280px); min-width: 0; max-width: 100%; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 12px; border: 0; border-radius: 10px; background: #0500FF; color: #fff; padding: 10px 14px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 14px 32px rgba(5, 0, 255, 0.24); transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease; }
    .hashpay-payment-button:hover { background: #0400CC; transform: translateY(-1px); }
    .hashpay-payment-button:focus-visible { outline: 3px solid rgba(5, 0, 255, 0.28); outline-offset: 3px; }
    .hashpay-button-radio { width: 14px; height: 14px; border: 2px solid #fff; border-radius: 999px; background: radial-gradient(circle, #2563EB 0 37%, #fff 41% 100%); flex: 0 0 auto; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.45); }
    .hashpay-button-text { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; text-align: center; line-height: 1.2; }
    .hashpay-button-logo { width: min(118px, 42vw); height: 31px; min-width: 0; object-fit: contain; flex: 0 1 auto; }
    .hashpay-popup-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.55); display: grid; place-items: center; padding: 16px; z-index: 50; }
    .hashpay-popup-overlay[hidden] { display: none; }
    .hashpay-popup { width: min(100%, 400px); background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 24px 70px rgba(0,0,0,0.25); }
    .hashpay-popup-title { margin: 0; font-size: 18px; font-weight: 800; }
    .hashpay-popup-sub { margin: 6px 0 14px; font-size: 13px; color: #5f6d62; }
    .hashpay-field { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
    .hashpay-field span { display: block; margin-bottom: 4px; }
    .hashpay-field input { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; font-size: 14px; }
    .hashpay-error { color: #dc2626; font-size: 13px; }
    .hashpay-popup-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; }
    .hashpay-primary-btn { background: #0500FF; color: #fff; border: 0; border-radius: 10px; padding: 10px 16px; font-weight: 800; cursor: pointer; }
    .hashpay-primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .hashpay-secondary-btn { background: #f3f4f6; color: #111827; border: 0; border-radius: 10px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
    .hashpay-checkout-wrap { margin-top: 14px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    .hashpay-checkout-wrap[hidden] { display: none; }
    .hashpay-checkout-summary { font-size: 13px; color: #374151; }
    .hashpay-checkout-btn { width: 100%; margin-top: 8px; }
    .hashpay-status { font-size: 13px; color: #374151; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(tabTitle)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="hashpay-payment-card" aria-label="Payment button">
    <!-- POST ${escapeHtml(endpoint)} : create_button_transaction -->
    <!-- CHECKOUT ${escapeHtml(checkoutPageUrl)} -->
    ${paymentForm}
  </main>
${flowScript}
</body>
</html>`;
}

export async function copyHtmlToClipboard(html) {
  await navigator.clipboard.writeText(html);
}

export function downloadHtmlFile(html, filename) {
  let objectUrl = "";
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
