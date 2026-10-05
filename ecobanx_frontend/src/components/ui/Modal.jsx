"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open = false,
  title,
  description,
  children,
  onClose,
  className = "",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-4 sm:py-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--shell-overlay)] backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[18px] border border-input-border bg-primary-bg p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:max-h-[calc(100dvh-3rem)] sm:p-6 ${className}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? (
              <h3
                id="modal-title"
                className="text-xl font-semibold tracking-tight text-theme-text"
              >
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-2 text-sm leading-6 text-secondary-text">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div data-lenis-prevent="true" className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
