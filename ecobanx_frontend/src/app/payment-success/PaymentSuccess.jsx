"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";
import {
  ActionButton,
  DetailRow,
  PaymentStatusShell,
} from "@/app/payment-status/PaymentStatusShell";
import { paymentQuery } from "@/app/payment-status/payment-data";

export default function PaymentSuccess() {
  const router = useRouter();
  const payment = paymentQuery(useSearchParams());
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          window.location.href = "https://www.hashcodex.com";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReturn = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    window.location.href = "https://www.hashcodex.com";
  };
  return (
    <PaymentStatusShell compact>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 17 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-emerald-300 shadow-[0_0_42px_rgba(52,211,153,0.22)]"
        >
          <CheckCircle2 size={50} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-6 text-2xl font-semibold"
        >
          Payment Successful
        </motion.h1>
        <p className="mt-2 text-sm text-white/55">
          Your payment has been confirmed successfully.
        </p>
        <span className="mt-5 inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          Confirmed on blockchain
        </span>
      </div>
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] px-4">
        <DetailRow
          label="Payment Amount"
          value={`${payment.amount} ${payment.coin}`}
        />
        <DetailRow label="Selected Coin" value={payment.coin} />
        <DetailRow label="Payment ID" value={payment.paymentId} />
        <DetailRow label="Transaction ID" value={payment.transactionId} />
        <DetailRow label="Date & Time" value={new Date().toLocaleString()} />
        <DetailRow label="Reference Number" value={payment.reference} />
      </div>
      <div className="mt-7 flex flex-col">
        <ActionButton
          onClick={handleReturn}
        >
          <ExternalLink size={18} />
          Return to Merchant
        </ActionButton>
        <p className="mt-3 text-center text-xs text-white/45 tracking-wide">
          Redirecting to Merchant in <span className="font-semibold text-white/60">{formatTime(timeLeft)}</span>
        </p>
      </div>
    </PaymentStatusShell>
  );
}
