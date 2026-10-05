"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Button from "./Button";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ConfirmationDialog({
  open = false,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  requireReason = false,
  confirmDisabled = false,
  confirmLoading = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter reason",
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function handleConfirm() {
    const trimmedReason = reason.trim();

    if (requireReason && !trimmedReason) {
      setError("Reason is required.");
      return;
    }

    onConfirm?.({ reason: trimmedReason });
    setReason("");
    setError("");
  }

  function handleClose() {
    setReason("");
    setError("");
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-large font-semibold text-theme-text">
              {title}
            </h2>
            <p className="text-small text-text-secondary">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Close confirmation"
            onClick={handleClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {requireReason && (
            <div>
              <label className="mb-2 block text-mid font-medium text-text-secondary">
                {reasonLabel}
              </label>
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setError("");
                }}
                placeholder={reasonPlaceholder}
                className="min-h-28 w-full resize-none rounded-[8px] border border-input-border bg-input-bg px-4 py-3 text-mid text-theme-text outline-none transition placeholder:text-input-text focus:border-text-primary"
              />
              {error && <p className="mt-2 text-small text-red-400">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handleClose}
          >
            {cancelLabel}
          </Button>
          <Button
            className={joinClasses(
              "w-full sm:w-auto",
              tone === "danger" &&
                "!border-red-500/30 !bg-red-500/15 !text-red-300 hover:!border-red-400",
              tone === "success" &&
                "!border-emerald-500/30 !bg-emerald-500/15 !text-emerald-300 hover:!border-emerald-400",
              tone === "warning" &&
                "!border-amber-500/30 !bg-amber-500/15 !text-amber-300 hover:!border-amber-400",
            )}
            disabled={confirmDisabled}
            onClick={handleConfirm}
            beforeIcon={confirmLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
