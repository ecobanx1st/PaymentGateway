"use client";

export default function MerchantFormRow({
  label,
  required = false,
  helperText = "",
  children,
  className = "",
}) {
  return (
    <div
      className={`p-4 lg:px-0 lg:py-5`}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.9fr)_auto] overflow-visible items-start lg:gap-6">
        <div>
          <p className="text-sm font-semibold tracking-tight text-theme-text sm:text-[15px]">
            {label}
          </p>
        </div>

        <div className="min-w-0 space-y-2">
          {children}
          {helperText ? (
            <p className="text-xs leading-5 text-secondary-text">{helperText}</p>
          ) : null}
          <div className="lg:hidden">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Required: {required ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${required ? "bg-primary/10 text-primary" : "bg-secondary-bg text-secondary-text"}`}
          >
            {required ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}
