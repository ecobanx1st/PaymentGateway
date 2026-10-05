"use client";

import { useMemo } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function WithdrawProgress({
  min = 0,
  max = 100,
  value = 0,
  onChange,
  step = 1,
  disabled = false,
  showPercentage = true,
  showQuickActions = true,
  className = "",
}) {
  const safeMin = Number.isFinite(Number(min)) ? Number(min) : 0;
  const safeMax = Number.isFinite(Number(max)) ? Number(max) : safeMin;
  const range = Math.max(safeMax - safeMin, 0);
  const numericValue = clamp(toNumber(value), safeMin, safeMax);
  const percent = range > 0 ? ((numericValue - safeMin) / range) * 100 : 0;

  const quickActions = useMemo(() => [25, 50, 75, 100], []);

  const updateValue = (nextValue) => {
    if (disabled) return;
    const clamped = clamp(nextValue, safeMin, safeMax);
    onChange?.(clamped);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="relative pt-2">
          <div className="h-2 rounded-full bg-secondary-text/30">
            <div
              className="h-full rounded-full bg-primary-text transition-all duration-200 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            className="pointer-events-none absolute left-0 right-0 top-3"
            aria-hidden="true"
          >
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-text shadow-[0_8px_24px_rgba(75, 71, 255,0.25)] transition-[left] duration-200 ease-out"
              style={{ left: `${percent}%` }}
            />
          </div>

          <input
            type="range"
            min={safeMin}
            max={safeMax}
            step={step}
            value={numericValue}
            onChange={(event) => updateValue(Number(event.target.value))}
            disabled={disabled}
            aria-label="Withdraw amount"
            className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-input-bg opacity-0 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
          <span>{formatAmount(safeMin)}</span>
          <span>{formatAmount(safeMax)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-secondary-text">
            Withdraw progress
          </p>
          <p className="mt-1 text-xs text-secondary-text">
            Current withdraw amount:{" "}
            <span className="font-semibold text-theme-text">
              {formatAmount(numericValue)}
            </span>
          </p>
        </div>

        {showPercentage ? (
          <div className="rounded-full border border-input-border bg-input-bg px-3 py-1 text-xs font-semibold text-primary">
            {Math.round(percent)}%
          </div>
        ) : null}
      </div>
    </div>
  );
}
