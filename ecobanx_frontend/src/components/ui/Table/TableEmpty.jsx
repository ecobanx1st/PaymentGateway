"use client";

import { Inbox } from "lucide-react";

export default function TableEmpty({
  title = "No data found",
  description = "Try adjusting your search or filters.",
  ctaLabel,
  onCta,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-input-bg px-6 py-10 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-bg text-primary">
        <Inbox size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-secondary-text">{description}</p>

      {ctaLabel && onCta ? (
        <button
          type="button"
          onClick={onCta}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-input-border bg-card px-4 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
        >
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
