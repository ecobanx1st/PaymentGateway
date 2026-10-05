"use client";

import { Check } from "lucide-react";

export default function Checkbox({
  checked = false,
  onChange,
  ariaLabel,
  description = "",
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 transition hover:border-primary hover:bg-primary/5 ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition ${checked ? "border-primary bg-primary text-white" : "border-input-border bg-primary-bg text-transparent"}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          aria-label={ariaLabel}
          className="sr-only"
        />
        <Check size={13} strokeWidth={3} aria-hidden="true" />
      </span>

      {description ? (
        <span className="text-sm leading-6 text-secondary-text">{description}</span>
      ) : null}
    </label>
  );
}
