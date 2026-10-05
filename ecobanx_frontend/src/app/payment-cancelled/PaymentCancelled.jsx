"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import {
  ActionButton,
  PaymentStatusShell,
} from "@/app/payment-status/PaymentStatusShell";

export default function PaymentCancelled() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(120);
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
          initial={{ opacity: 0, scale: 0.55 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 17 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/25 bg-amber-400/10 text-amber-300 shadow-[0_0_42px_rgba(251,191,36,0.14)]"
        >
          <AlertTriangle size={47} />
        </motion.div>
        <h1 className="mt-6 text-2xl font-semibold">Payment Cancelled</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
          The payment process has been cancelled. No funds have been received.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ActionButton
          onClick={handleReturn}
        >
          <ExternalLink size={18} />
          Return to Merchant
        </ActionButton>
      </div>
      <p className="mt-3 text-center text-xs text-white/45 tracking-wide">
        Redirecting to Merchant in <span className="font-semibold text-white/60">{formatTime(timeLeft)}</span>
      </p>
    </PaymentStatusShell>
  );
}
