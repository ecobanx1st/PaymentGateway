"use client";

import { useEffect, useState } from "react";
import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Info,
  LoaderCircle,
  XCircle,
  Clock,
  Shield,
  HelpCircle,
  ChevronDown,
  Lock,
  ExternalLink
} from "lucide-react";
import { ActionButton, PaymentStatusShell } from "@/app/payment-status/PaymentStatusShell";
import {
  paymentHref,
  paymentQuery,
  readPaymentSession,
} from "@/app/payment-status/payment-data";
import Snackbar from "@/components/ui/Snackbar";
import { createPaymentSocket, PAYMENT_PAYLOAD_STATUS_CONFIRMED } from "@/lib/payment-socket";
import { createQrMatrix } from "@/lib/qr-code";

const DEFAULT_PAYMENT_SECONDS = 120;

const CHECKOUT_API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi";

const PAYMENT_STATUS_POLL_INTERVAL_MS = 15000;

const CHECKOUT_CONFIRMED_STATUS_CODE = 100;

function getCheckoutPayload(payload) {
  return payload?.result ?? payload?.data ?? payload ?? null;
}

function isPaymentConfirmedResult(result) {
  if (!result) return false;

  const status = result.status;
  if (status === CHECKOUT_CONFIRMED_STATUS_CODE) return true;
  if (typeof status === "string" && status.toLowerCase() === "confirmed") {
    return true;
  }
  return false;
}

function normalizePaymentConfirmation(source) {
  const network = source?.network;

  return {
    amount:
      source?.amount != null ? source.amount : source?.received_amount ?? null,
    currency: source?.currency ?? source?.symbol ?? source?.coin ?? null,
    network: typeof network === "string" ? network : network?.symbol || null,
    blockchainTxId: source?.txId ?? source?.txid ?? null,
    txnId: source?.txn_id ?? source?.txnId ?? null,
  };
}

async function fetchCheckoutStatus(txnId, token) {
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  const headers = { "Content-Type": "application/json" };

  if (normalizedToken) {
    headers.Authorization = normalizedToken.toLowerCase().startsWith("bearer ")
      ? normalizedToken
      : `Bearer ${normalizedToken}`;
    headers.usertoken = normalizedToken;
  }

  const response = await fetch(
    `${CHECKOUT_API_BASE_URL.replace(/\/+$/, "")}/checkout/tx_info`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ txn_id: txnId }),
    },
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Unable to check payment status.");
  }

  return payload;
}

function getPositiveSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

function getRemainingSeconds(payment) {
  const expiresAtTime = Date.parse(payment?.expiresAt || "");

  if (Number.isFinite(expiresAtTime)) {
    return Math.max(0, Math.ceil((expiresAtTime - Date.now()) / 1000));
  }

  return (
    getPositiveSeconds(payment?.timeout) ||
    DEFAULT_PAYMENT_SECONDS
  );
}

function getDurationSeconds(payment, remainingSeconds) {
  return (
    getPositiveSeconds(payment?.timeout) ||
    Math.max(remainingSeconds, DEFAULT_PAYMENT_SECONDS)
  );
}

function getTimerPayment(payment) {
  const expiresAtTime = Date.parse(payment?.expiresAt || "");

  if (Number.isFinite(expiresAtTime)) {
    return payment;
  }

  const timeout = getPositiveSeconds(payment?.timeout) || DEFAULT_PAYMENT_SECONDS;

  return {
    ...payment,
    expiresAt: new Date(Date.now() + timeout * 1000).toISOString(),
    timeout: String(timeout),
  };
}

function formatPaymentTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function QrCode({ value }) {
  const matrix = useMemo(() => {
    try {
      return createQrMatrix(value || "");
    } catch {
      return createQrMatrix("wallet-address-unavailable");
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      className="rounded-2xl bg-white p-3.5 shadow-[0_0_40px_rgba(255,255,255,0.12),0_12px_30px_rgba(0,0,0,0.3)] shrink-0"
    >
      <div
        aria-label="Payment wallet address QR code"
        className="grid h-36 w-36 sm:h-40 sm:w-40"
        style={{
          gridTemplateColumns: `repeat(${matrix.length}, minmax(0, 1fr))`,
        }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((filled, columnIndex) => (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={filled ? "bg-[#121016]" : "bg-white"}
            />
          )),
        )}
      </div>
    </motion.div>
  );
}

function TimerCard({ seconds, time, durationSeconds }) {
  const radius = 22;
  const stroke = 3;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(1, seconds / durationSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 w-full sm:w-[245px] hover:border-white/10 transition-colors duration-300">
      <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            className="text-white/5"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={24}
            cy={24}
          />
          <motion.circle
            className="text-primary"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={24}
            cy={24}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock size={15} className="text-white/60" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Time Left</span>
        <span className="text-lg font-bold text-white leading-none tabular-nums">{time}</span>
        <span className="mt-1.5 inline-flex items-center rounded-full bg-[#4B47FF]/15 px-2 py-0.5 text-[9px] font-semibold text-violet-300 border border-[#4B47FF]/20">
          Expires in {time}
        </span>
      </div>
    </div>
  );
}

function CopyCard({ title, value, onCopy, isCopied }) {
  return (
    <div className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]">
      <div className="min-w-0 pr-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</p>
        <p className="mt-1 truncate text-sm font-semibold text-white">
          {value}
        </p>
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-white/60 transition-all duration-300 hover:scale-105 hover:border-[#4B47FF]/40 hover:bg-[#4B47FF]/10 hover:text-[#4B47FF] active:scale-95 cursor-pointer"
          aria-label={`Copy ${title}`}
        >
          {isCopied ? (
            <CheckCircle2 size={16} className="text-green-400 animate-in fade-in zoom-in-75 duration-200" />
          ) : (
            <Copy size={16} className="transition-transform duration-200 group-hover:rotate-3" />
          )}
        </button>
      )}
    </div>
  );
}

function FaqItem({ question, answer, icon: Icon, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/5 py-2.5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-1 text-left cursor-pointer transition-colors duration-200 hover:text-white group"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-white/40 group-hover:text-white/60 shrink-0 transition-colors duration-200" />}
          <span className="text-xs sm:text-sm font-semibold text-white/80 transition-colors duration-200 group-hover:text-white">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40 shrink-0"
        >
          <ChevronDown size={15} />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pb-2.5 pl-7 pr-4 text-xs leading-relaxed text-white/50">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

function FAQSection() {
  const [openId, setOpenId] = useState(null);

  const faqs = [
    {
      id: "faq-1",
      question: "What should I do next?",
      answer: "Send the exact amount to the wallet address or scan the QR code.",
      icon: HelpCircle
    },
    {
      id: "faq-2",
      question: "Why does payment confirmation take up to one minute?",
      answer: "We check the blockchain once every minute for security and accuracy.",
      icon: Shield
    },
    {
      id: "faq-3",
      question: "What if I accidentally don't send enough?",
      answer: "The payment must match the exact amount. Please try again.",
      icon: Clock
    },
    {
      id: "faq-4",
      question: "What happens if I close this page?",
      answer: "You can reopen this payment before it expires. The countdown continues from the original payment window.",
      icon: Info
    },
    {
      id: "faq-5",
      question: "Can I pay using another wallet?",
      answer: "Yes, you can use any wallet that supports the specified cryptocurrency.",
      icon: Copy
    }
  ];

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mt-1 border-t border-white/5 pt-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Frequently Asked Questions</h3>
      <div className="flex flex-col">
        {faqs.map((faq) => (
          <FaqItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            icon={faq.icon}
            isOpen={openId === faq.id}
            onToggle={() => handleToggle(faq.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-5 flex flex-col items-center gap-1.5 text-center text-[10px] text-white/30 font-medium z-10 select-none">
      <div className="flex items-center gap-1 text-white/35">
        <Lock size={10} className="text-white/30" />
        <span>Secure payment powered by </span>
        <span className="text-violet-400/90 font-bold">Hashcodex</span>
      </div>
      <div>Keep this page open for the fastest payment confirmation.</div>
    </div>
  );
}

export default function PaymentProcessing() {
  const router = useRouter();
  const payment = useMemo(() => paymentQuery(), []);
  const timerPayment = useMemo(() => getTimerPayment(payment), [payment]);
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(timerPayment));
  const [copied, setCopied] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [redirectTime, setRedirectTime] = useState(30);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", tone: "info" });
  const durationSeconds = getDurationSeconds(timerPayment, seconds);
  const txnId = payment.transactionId;
  const paymentProcessedRef = useRef(false);
  const redirectTimerRef = useRef(null);
  const paymentSocketRef = useRef(null);
  const statusPollRef = useRef(null);

  const redirectToMerchant = useCallback(() => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (txnId) {
      paymentSocketRef.current?.emit("leave_txn", { txn_id: txnId });
      paymentSocketRef.current?.disconnect();
    }

    window.location.href = "https://www.hashcodex.com";
  }, [txnId]);

  const startRedirectTimer = useCallback(() => {
    if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);

    setRedirectTime(30);

    redirectTimerRef.current = window.setInterval(() => {
      setRedirectTime((previous) => {
        if (previous <= 1) {
          clearInterval(redirectTimerRef.current);
          redirectTimerRef.current = null;
          redirectToMerchant();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
  }, [redirectToMerchant]);

  const handlePaymentSuccess = useCallback(
    (paymentData) => {
      if (paymentProcessedRef.current) return;
      paymentProcessedRef.current = true;

      console.log("[Checkout] PAYMENT SUCCESS:", paymentData);

      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
        statusPollRef.current = null;
      }

      setConfirmedPayment(normalizePaymentConfirmation(paymentData || {}));
      setPaymentConfirmed(true);
      setToast({
        open: true,
        message: "Payment confirmed successfully!",
        tone: "success",
      });
      startRedirectTimer();
    },
    [startRedirectTimer],
  );

  const runStatusCheck = useCallback(async () => {
    if (paymentProcessedRef.current || !txnId) return;

    const savedPayment = readPaymentSession();
    const checkoutToken = savedPayment?.checkoutToken || "";
    if (!checkoutToken) return;

    try {
      const response = await fetchCheckoutStatus(txnId, checkoutToken);
      console.log("[Checkout] API payment status:", response);

      const result = getCheckoutPayload(response);
      if (isPaymentConfirmedResult(result)) {
        handlePaymentSuccess(result);
      }
    } catch (error) {
      console.log(
        "[Checkout] API status check error:",
        error?.message || error,
      );
    }
  }, [txnId, handlePaymentSuccess]);

  useEffect(() => {
    console.log("[Checkout] txnId:", txnId);

    const savedPayment = readPaymentSession();
    const checkoutToken = savedPayment?.checkoutToken || "";

    if (!txnId || !checkoutToken) return undefined;

    const socket = createPaymentSocket(checkoutToken);
    paymentSocketRef.current = socket;
    const emitJoinTxn = () => {
      console.log("[Checkout] joining txn:", txnId);
      socket.emit("join_txn", { txn_id: txnId });
    };
    const handleConnect = () => {
      console.log("[Checkout] socket connected:", socket.id);
      emitJoinTxn();
    };
    const handleJoinedTxn = (data) => {
      console.log("[Checkout] joined txn room:", data);
    };
    const handleJoinTxnError = (data) => {
      console.error("[Checkout] failed to join transaction room:", data);
    };
    const handleConnectError = (error) => {
      console.error("[Checkout] socket connection error:", error?.message || error);
    };
    const handleDisconnect = (reason) => {
      console.log("[Checkout] socket disconnected:", reason);
    };
    const handlePaymentConfirmed = (data) => {
      console.log("[Checkout] payment_confirmed:", data);

      if (!data?.txn_id) return;
      if (String(data.txn_id) !== String(txnId)) {
        console.log(
          "Ignoring confirmation for different transaction:",
          data.txn_id,
        );
        return;
      }
      if (data.status !== PAYMENT_PAYLOAD_STATUS_CONFIRMED) return;

      handlePaymentSuccess(data);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("joined_txn", handleJoinedTxn);
    socket.on("join_txn_error", handleJoinTxnError);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("payment_confirmed", handlePaymentConfirmed);

    return () => {
      socket.emit("leave_txn", { txn_id: txnId });
      paymentSocketRef.current = null;
      socket.off("connect", handleConnect);
      socket.off("joined_txn", handleJoinedTxn);
      socket.off("join_txn_error", handleJoinTxnError);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("payment_confirmed", handlePaymentConfirmed);
      socket.disconnect();
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [txnId, handlePaymentSuccess]);

  useEffect(() => {
    const savedPayment = readPaymentSession();
    if (!txnId || !savedPayment?.checkoutToken) return undefined;

    runStatusCheck();
    statusPollRef.current = window.setInterval(
      runStatusCheck,
      PAYMENT_STATUS_POLL_INTERVAL_MS,
    );

    return () => {
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
        statusPollRef.current = null;
      }
    };
  }, [txnId, runStatusCheck]);

  const handleReturn = () => {
    redirectToMerchant();
  };

  const handlePaymentReceivedButton = () => {
    if (paymentProcessedRef.current) return;

    runStatusCheck();
    setToast({
      open: true,
      message: "Checking payment status...",
      tone: "info",
    });
  };

  useEffect(() => {
    const updateTimer = () => {
      if (paymentProcessedRef.current) return Number.POSITIVE_INFINITY;

      const remainingSeconds = getRemainingSeconds(timerPayment);

      setSeconds(remainingSeconds);

      if (remainingSeconds <= 0) {
        router.replace(paymentHref("/payment-timeout", timerPayment));
      }

      return remainingSeconds;
    };

    if (updateTimer() <= 0) return undefined;

    const timer = window.setInterval(() => {
      if (updateTimer() <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router, timerPayment]);

  const time = formatPaymentTime(seconds);
  const copy = async (value) => { 
    await navigator.clipboard?.writeText(value); 
    setCopied(value); 
    window.setTimeout(() => setCopied(""), 1200); 
  };

  return (
    <PaymentStatusShell logoOutside={true} footer={<Footer />}>
      <div className="flex flex-col gap-4">
        
        {/* Top Header Row: QR + Text Info + Timer Card */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 text-left">
          <div className="flex justify-center md:justify-start">
            <QrCode value={payment.wallet} />
          </div>
          
          <div className="flex flex-col text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
              Send payment to continue
            </h1>
            <p className="mt-2 text-xs md:text-sm leading-relaxed text-white/50 max-w-sm">
              Scan the QR code with your wallet or copy the payment details.
            </p>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <TimerCard
              seconds={seconds}
              time={time}
              durationSeconds={durationSeconds}
            />
          </div>
        </div>

        {/* Copy Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.18 }} 
          className="grid gap-3 grid-cols-1 sm:grid-cols-3"
        >
          <CopyCard 
            title="Amount" 
            value={`${payment.amount} ${payment.coin}`} 
            onCopy={copy} 
            isCopied={copied === `${payment.amount} ${payment.coin}`} 
          />
          <CopyCard 
            title="Wallet Address" 
            value={payment.wallet} 
            onCopy={copy} 
            isCopied={copied === payment.wallet} 
          />
          <CopyCard 
            title="Payment ID" 
            value={payment.paymentId} 
            onCopy={copy} 
            isCopied={copied === payment.paymentId} 
          />
        </motion.div>

        {/* Waiting Status Combined Banner Card */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4.5">
          {paymentConfirmed ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.22)]">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Payment Received</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">Payment confirmed successfully.</p>
                    <span className="mt-2 inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      Confirmed on blockchain
                    </span>
                  </div>
                </div>
                {confirmedPayment?.amount != null ? (
                  <div className="shrink-0 rounded-xl border border-emerald-300/20 bg-black/20 px-4 py-3 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Received</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-emerald-100">
                      {confirmedPayment.amount} {confirmedPayment.currency || ""}
                    </p>
                  </div>
                ) : null}
              </div>
              {(confirmedPayment?.network || confirmedPayment?.blockchainTxId || confirmedPayment?.txnId) ? (
                <div className="grid gap-2.5 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-xs">
                  {confirmedPayment?.network ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/50">Network</span>
                      <span className="font-medium text-white">
                        {confirmedPayment.network}
                      </span>
                    </div>
                  ) : null}
                  {confirmedPayment?.blockchainTxId || confirmedPayment?.txnId ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/50">Transaction ID</span>
                      <span className="max-w-[55%] truncate text-right font-medium text-white">
                        {confirmedPayment.blockchainTxId || confirmedPayment.txnId}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                <span className="text-xs font-medium text-white/60">Redirecting to Merchant in</span>
                <span className="text-lg font-bold tabular-nums text-white">{formatPaymentTime(redirectTime)}</span>
              </div>
              <ActionButton onClick={handleReturn}>
                <ExternalLink size={16} />Return to Merchant
              </ActionButton>
            </motion.div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Column: Info message details */}
            <div className="flex gap-3.5 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Info size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Waiting for blockchain confirmation...</h3>
                <div className="mt-1.5 text-xs leading-relaxed text-white/50 space-y-0.5">
                  <p>After completing your payment, please wait while we verify your transaction.</p>
                  <p>Our blockchain verification service checks transactions once every minute.</p>
                  <p>Even if your payment is successful, it may take up to one minute before this page updates.</p>
                  <p className="font-medium text-blue-400/90">Please do not refresh or close this page.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Mini active status indicator */}
            <div className="flex items-center gap-3.5 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 md:border-l md:border-white/10 md:pl-8 text-left shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-primary/20 border-t-primary shadow-[0_0_12px_rgba(5, 0, 255,0.2)]"
              >
                <LoaderCircle size={16} className="text-primary" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-white text-xs leading-none">Checking Payment</h4>
                <p className="text-[10px] text-white/40 mt-1 max-w-[150px] leading-tight">Checking blockchain every minute...</p>
              </div>
            </div>

          </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton variant="secondary" onClick={() => router.push(paymentHref("/payment-cancelled", payment))}>
            <XCircle size={16} />Cancel Payment
          </ActionButton>
          <ActionButton variant="primary" onClick={handlePaymentReceivedButton}>
            <CheckCircle2 size={16} />Payment Received (Success)
          </ActionButton>
        </div>

        {/* Collapsible FAQ accordion Section */}
        <FAQSection />

      </div>
      <Snackbar
        open={toast.open}
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </PaymentStatusShell>
  );
}
