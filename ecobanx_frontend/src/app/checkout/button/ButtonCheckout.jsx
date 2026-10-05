"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createQrMatrix, qrMatrixToDataUrl } from "@/lib/qr-code";
import { createPaymentSocket, PAYMENT_PAYLOAD_STATUS_CONFIRMED } from "@/lib/payment-socket";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";

const FALLBACK_SECONDS = 15 * 60;

function resolveSeconds(exp) {
  const raw = String(exp || "").trim();
  if (!raw) return FALLBACK_SECONDS;
  if (/^\d+$/.test(raw)) return Math.max(0, parseInt(raw, 10));
  const target = new Date(raw).getTime();
  if (!Number.isFinite(target)) return FALLBACK_SECONDS;
  return Math.max(0, Math.floor((target - Date.now()) / 1000));
}

function formatTime(totalSecs) {
  const safe = Math.max(0, totalSecs);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function mapResultToCheckout(r, txn) {
  const cryptoAmount = String(r.crypto_amount ?? "");
  const asset = String(r.currency2 ?? "");
  const fiatAmount = String(r.amount ?? "");
  const fiatCcy = String(r.currency1 ?? "");
  return {
    address: String(r.address ?? ""),
    txn: String(r.txn_id ?? txn),
    invoiceId: String(r.invoiceId ?? ""),
    amount: cryptoAmount && asset ? `${cryptoAmount} ${asset}` : "",
    asset,
    network: String(r.network ?? ""),
    fiat: fiatAmount ? `${fiatAmount} ${fiatCcy}`.trim() : "",
    exp: String(r.quote_expires_at ?? r.expiresAt ?? r.timeout ?? ""),
    qrcode: String(r.qrcode ?? ""),
    status: String(r.status ?? "pending"),
    successUrl: String(r.success_url ?? ""),
    cancelUrl: String(r.cancel_url ?? ""),
    checkoutToken: r.checkout_token || "",
  };
}

function readDirectParams(searchParams) {
  const get = (key) => searchParams.get(key) || "";
  const address = get("address");
  if (!address) return null;
  return {
    address,
    txn: "",
    amount: get("amount"),
    asset: get("asset"),
    network: get("network"),
    fiat: get("fiat"),
    exp: get("exp"),
    qrcode: "",
    successUrl: "",
    cancelUrl: "",
  };
}

export default function ButtonCheckout({ txnOverride = "" }) {
  const searchParams = useSearchParams();
  const txnFromQuery = searchParams.get("txn") || "";
  const txn = String(txnOverride || txnFromQuery || "").trim();
  // Older generated buttons carry the details directly in the URL —
  // resolve once up front (no fetch needed for those).
  const [checkout, setCheckout] = useState(() => (txn ? null : readDirectParams(searchParams)));
  const [loadError, setLoadError] = useState(() =>
    !txn && !readDirectParams(searchParams) ? "Invalid checkout link. Missing payment details." : ""
  );
  const [status, setStatus] = useState("pending");
  const [remaining, setRemaining] = useState(() => {
    const direct = txn ? null : readDirectParams(searchParams);
    return resolveSeconds(direct?.exp);
  });
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);
  const [checkoutToken, setCheckoutToken] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  useEffect(() => {
    if (!txn) return undefined;
    let cancelled = false;

    fetch(
      `${String(BACKEND_URL).replace(/\/+$/, "")}/checkout/button-txn/${encodeURIComponent(txn)}`,
      { cache: "no-store" }
    )
      .then((res) =>
        res
          .json()
          .catch(() => null)
          .then((data) => ({ ok: res.ok, data }))
      )
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data?.success) {
          setLoadError("Transaction not found. Please start a new payment.");
          return;
        }
        const next = mapResultToCheckout(data.result || {}, txn);
        if (!next.address) {
          setLoadError("Transaction has no payment address yet.");
          return;
        }
        setCheckout(next);
        setCheckoutToken(next.checkoutToken || "");
        setRemaining(resolveSeconds(next.exp));
        if (next.status) setStatus(next.status);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Unable to load payment details. Please try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [txn]);

  // Initialize socket connection for real-time updates
  useEffect(() => {
    if (!txn || !checkout || !checkoutToken) return undefined;

    const paymentSocket = createPaymentSocket(checkoutToken);
    setSocket(paymentSocket);

    paymentSocket.on("connect", () => {
      console.log("Socket connected:", paymentSocket.id);
      paymentSocket.emit("join_txn", { txn_id: txn });
    });

    paymentSocket.on("payment_confirmed", (payload) => {
      console.log("Payment confirmed via socket:", payload);
      if (payload.status === PAYMENT_PAYLOAD_STATUS_CONFIRMED || payload.status === "confirmed") {
        setStatus("confirmed");
      } else if (payload.status === "failed") {
        setStatus("failed");
        // Show toast with mismatch reason
        if (payload.mismatchReason) {
          setToast({ show: true, message: payload.mismatchReason, type: "error" });
        }
      }
    });

    paymentSocket.on("join_txn_error", (error) => {
      console.error("Failed to join transaction room:", error);
    });

    return () => {
      paymentSocket.emit("leave_txn", { txn_id: txn });
      paymentSocket.disconnect();
      setSocket(null);
    };
  }, [txn, checkout, checkoutToken]);

  useEffect(() => {
    if (remaining <= 0 || status !== "pending") return undefined;
    const id = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [remaining, status]);

  // Terminal status: confirmed -> success URL, failed/expired/cancelled -> cancel URL.
  const successUrl = checkout?.successUrl ?? "";
  const cancelUrl = checkout?.cancelUrl ?? "";
  const isConfirmed = status === "confirmed";
  const expired = remaining <= 0 && status === "pending";
  const isFailed =
    status === "expired" || status === "cancelled" || status === "failed" || expired;
  useEffect(() => {
    if (!isConfirmed && !isFailed) return undefined;
    const target = isConfirmed ? successUrl : cancelUrl;
    if (!target) return undefined;
    const id = window.setTimeout(() => {
      window.location.href = target;
    }, 2500);
    return () => window.clearTimeout(id);
  }, [isConfirmed, isFailed, successUrl, cancelUrl]);

  const address = checkout?.address ?? "";
  const serverQrcode = checkout?.qrcode ?? "";
  const qrDataUrl = useMemo(() => {
    if (serverQrcode) return serverQrcode;
    if (!address) return "";
    try {
      return qrMatrixToDataUrl(createQrMatrix(address));
    } catch {
      return "";
    }
  }, [serverQrcode, address]);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const area = document.createElement("textarea");
      area.value = address;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        // Clipboard unavailable; address remains selectable as text.
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (loadError || (checkout && !address)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
        <p className="text-sm text-white/70">
          {loadError || "Invalid checkout link. Missing payment details."}
        </p>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
        Loading checkout...
      </main>
    );
  }

  const amountParts = String(checkout.amount || "").trim().split(/\s+/);
  const amountNum = Number(amountParts[0]);
  const amountDisplay =
    amountParts[0] && Number.isFinite(amountNum)
      ? `${amountNum.toFixed(8)}${amountParts.length > 1 ? ` ${amountParts.slice(1).join(" ")}` : ""}`
      : "-";
  const rows = [
    { label: "Address", value: address, copy: true },
    { label: "Transaction ID", value: checkout.txn || "-", copy: false },
    // { label: "Amount", value: checkout.amount || "-", copy: false },
    {
    label: "Amount",
    value: amountDisplay,
    copy: false,
    },
    { label: "Asset", value: checkout.asset || "-", copy: false },
    { label: "Network", value: checkout.network || "-", copy: false },
    { label: "Status", value: status, copy: false },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        {toast.show && (
          <div className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-400" role="alert">
            {toast.message}
          </div>
        )}
        <h1 className="text-xl font-extrabold">Complete your payment</h1>
        <p className="mt-1 text-sm text-white/60">
          Send the exact amount to the address below before the timer ends.
        </p>

        {status === "pending" ? (
          <div className="mt-4 flex items-baseline gap-2 rounded-xl bg-black/40 px-4 py-3">
            <span className="text-2xl font-extrabold tabular-nums">{formatTime(remaining)}</span>
            <span className="text-xs text-white/50">payment window</span>
          </div>
        ) : null}

        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Generated QR data URL.
          <img
            src={qrDataUrl}
            alt="Payment QR code"
            className="mx-auto mt-4 h-52 w-52 rounded-xl border border-white/10 bg-white p-2"
          />
        ) : null}

        <dl className="mt-4 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl bg-black/30 px-4 py-2.5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                {row.label}
              </dt>
              <dd className="mt-0.5 flex items-center gap-2 break-all text-sm">
                <span className="min-w-0 flex-1">{row.value}</span>
                {row.copy ? (
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                ) : null}
              </dd>
            </div>
          ))}
          {/* {checkout.fiat ? (
            <div className="rounded-xl bg-black/30 px-4 py-2.5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Fiat value
              </dt>
              <dd className="mt-0.5 text-sm">{checkout.fiat}</dd>
            </div>
          ) : null} */}
        </dl>

        {isConfirmed ? (
          <p className="mt-4 rounded-xl bg-green-500/15 px-4 py-3 text-sm font-bold text-green-400" role="status">
            Payment confirmed. Thank you!{successUrl ? " Redirecting…" : ""}
          </p>
        ) : status === "cancelled" ? (
          <p className="mt-4 text-sm font-bold text-red-400" role="alert">
            Payment cancelled.{cancelUrl ? " Redirecting…" : ""}
          </p>
        ) : expired ? (
          <p className="mt-4 text-sm font-bold text-red-400" role="alert">
            Payment window expired. Please start a new payment.
          </p>
        ) : null}
        {checkout?.invoiceId ? (
          <a
            href={`/invoice/${encodeURIComponent(checkout.invoiceId)}`}
            className="mt-4 block text-center text-sm font-bold text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Back to invoice
          </a>
        ) : null}
      </section>
    </main>
  );
}
