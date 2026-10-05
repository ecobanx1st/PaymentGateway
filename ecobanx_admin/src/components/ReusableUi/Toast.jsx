"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const toastColors = {
  primary: "var(--text-primary)",
  success: "var(--text-primary)",
  error: "rgb(248 113 113)",
  warning: "rgb(250 204 21)",
  info: "rgb(96 165 250)",
};

function getToastColor(color) {
  return toastColors[color] ?? color ?? toastColors.primary;
}

export default function Toast({
  content,
  color = "primary",
  open,
  defaultOpen = true,
  duration = 0,
  onClose,
  className = "",
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const visible = controlled ? open : internalOpen;
  const resolvedColor = getToastColor(color);

  useEffect(() => {
    if (!visible || !duration) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (!controlled) {
        setInternalOpen(false);
      }
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [controlled, duration, onClose, visible]);

  function handleClose() {
    if (!controlled) {
      setInternalOpen(false);
    }
    onClose?.();
  }

  if (!visible || !content) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={joinClasses(
        "flex justify-evenly items-center w-fit max-w-md gap-3 rounded-rounded border border-input-border/50 bg-card-bg p-4 text-mid  text-theme-text shadow-2xl shadow-black/30 animate-bounce",
        className,
      )}
      style={{ "--toast-color": resolvedColor }}
    >
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--toast-color)] shadow-[0_0_18px_var(--toast-color)]" />
      <div className="min-w-0 flex-1 leading-6">{content}</div>
      <button
        type="button"
        aria-label="Close notification"
        onClick={handleClose}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-text-secondary transition hover:bg-input-bg hover:text-theme-text"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
