"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock3, ExternalLink, Plus } from "lucide-react";
import {
  ActionButton,
  PaymentStatusShell,
} from "@/app/payment-status/PaymentStatusShell";

export default function PaymentTimeout() {
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
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-violet-300/25 bg-primary/10 text-primary shadow-[0_0_42px_rgba(5, 0, 255,0.2)]"
        >
          <Clock3 size={47} />
        </motion.div>
        <h1 className="mt-6 text-2xl font-semibold">Payment Timeout</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
          The payment window has expired. No payment confirmation was received
          within the allowed time.
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
