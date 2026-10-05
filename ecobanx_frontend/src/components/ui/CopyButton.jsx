"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
  variant = "default",
  onCopied,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.(value);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!copied) return undefined;

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const baseStyles = variant === "input-green"
    ? copied
      ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] rounded-[10px]"
      : "border-[var(--primary)]/30 bg-transparent text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-[10px]"
    : copied
      ? "border-primary bg-primary/10 text-primary rounded-full"
      : "border-input-border bg-primary-bg text-secondary-text hover:border-primary hover:text-primary rounded-full";

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? copiedLabel : label}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex h-7 w-7 items-center justify-center border transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${baseStyles} ${className}`}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
}
