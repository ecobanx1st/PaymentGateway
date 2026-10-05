"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const toneConfig = {
  success: {
    title: "Success",
    icon: CheckCircle2,
    accent: "var(--success)",
    glow: "rgba(34, 197, 94, 0.18)",
  },
  error: {
    title: "Action needed",
    icon: AlertCircle,
    accent: "var(--danger)",
    glow: "rgba(239, 68, 68, 0.18)",
  },
  warning: {
    title: "Check this",
    icon: AlertCircle,
    accent: "var(--warning)",
    glow: "rgba(245, 158, 11, 0.18)",
  },
  info: {
    title: "Notice",
    icon: Info,
    accent: "var(--primary)",
    glow: "rgba(75, 71, 255, 0.2)",
  },
};

export default function Snackbar({
  open = false,
  message = "",
  onClose,
  tone = "info",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => onClose?.(), 2400);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  const isError = tone === "error" || tone === "warning";
  const resolvedTone = toneConfig[tone] ?? toneConfig.info;
  const Icon = resolvedTone.icon;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] px-4 sm:top-5">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key={`${tone}-${message}`}
            initial={{ opacity: 0, y: -26, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, scale: 0.96, filter: "blur(6px)" }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 34,
              mass: 0.82,
            }}
            role={isError ? "alert" : "status"}
            aria-live={isError ? "assertive" : "polite"}
            className="pointer-events-auto relative mx-auto flex w-full max-w-[28rem] items-start gap-3 overflow-hidden rounded-2xl border p-4"
            style={{
              background: "var(--snackbar-bg)",
              borderColor: "var(--snackbar-border)",
              boxShadow: `var(--snackbar-shadow), 0 0 0 1px color-mix(in srgb, ${resolvedTone.accent} 18%, transparent)`,
            }}
          >
            <span
              className="absolute inset-y-3 left-0 w-1 rounded-r-full"
              style={{ backgroundColor: resolvedTone.accent }}
            />
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${resolvedTone.glow}, color-mix(in srgb, ${resolvedTone.accent} 8%, var(--snackbar-bg)))`,
                color: resolvedTone.accent,
                boxShadow: `0 10px 24px ${resolvedTone.glow}`,
              }}
            >
              <Icon size={19} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-bold leading-5"
                style={{ color: "var(--snackbar-title)" }}
              >
                {resolvedTone.title}
              </p>
              <p
                className="mt-1 text-sm font-medium leading-5"
                style={{ color: "var(--snackbar-text)" }}
              >
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent transition hover:border-input-border hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
              style={{ color: "var(--snackbar-text)" }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
