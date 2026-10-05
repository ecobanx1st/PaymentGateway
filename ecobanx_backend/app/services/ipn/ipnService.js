const mongoose = require("mongoose");
const { IpnHistory } = require("../../models/ipnHistoryModel");

const TIMEOUT_MS = 15000;

const sendIpnNotification = async (ipnUrl, payload) => {
  if (!ipnUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let success = false;
  let status = null;
  let responseBody = null;
  let error = null;

  try {
    const response = await fetch(ipnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    responseBody = await response.text();
    status = response.status;
    success = response.status >= 200 && response.status < 300;

    return { status, body: responseBody };
  } catch (err) {
    error = err.message;
    console.error("IPN send failed:", ipnUrl, err.message);
    return null;
  } finally {
    clearTimeout(timer);
    try {
      await IpnHistory.create({
        merchantId: payload?.merchant_id
          ? mongoose.Types.ObjectId.isValid(payload.merchant_id)
            ? payload.merchant_id
            : null
          : null,
        transactionId: payload?.transaction_id
          ? mongoose.Types.ObjectId.isValid(payload.transaction_id)
            ? payload.transaction_id
            : null
          : null,
        txnId: payload?.txn_id || null,
        url: ipnUrl,
        payload,
        success,
        status,
        responseBody,
        error,
      });
    } catch (logErr) {
      console.error("Failed to save IPN history:", logErr.message);
    }
  }
};

module.exports = { sendIpnNotification };
