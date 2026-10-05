const PAYMENT_SESSION_STORAGE_KEY = "ecobanx.depositPayment";

export function savePaymentSession(payment) {
  if (typeof window === "undefined") return;

  const value = JSON.stringify(payment);

  try {
    window.sessionStorage.setItem(PAYMENT_SESSION_STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  try {
    window.localStorage.removeItem(PAYMENT_SESSION_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function readStoredPayment(storage) {
  try {
    const value = storage.getItem(PAYMENT_SESSION_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function readPaymentSession() {
  if (typeof window === "undefined") return null;

  return readStoredPayment(window.sessionStorage);
}

function getPaymentValue(savedPayment, key, fallback = "") {
  const savedValue = savedPayment?.[key];

  return savedValue !== undefined && savedValue !== null && savedValue !== ""
    ? String(savedValue)
    : fallback;
}

export function paymentQuery() {
  const savedPayment = readPaymentSession();
  const get = (key, fallback) => getPaymentValue(savedPayment, key, fallback);

  return {
    amount: get("amount", "10.00000000"),
    coin: get("coin", "USDT"),
    paymentId: get("paymentId", "HP-8F2A-91D4"),
    wallet: get("wallet", "0x8856cD8A2b4f...7E92"),
    transactionId: get("transactionId", "0x7b2d...94c1"),
    reference: get("reference", "HASH-2026-0814"),
    expiresAt: get("expiresAt"),
    timeout: get("timeout"),
  };
}

export function paymentHref(path, payment) {
  savePaymentSession(payment);
  return path;
}
