"use client";

export default function Toggle({
  checked = false,
  disabled = false,
  onChange,
  size = "md",
  ariaLabel,
  className = "",
}) {
  const isSm = size === "sm";
  const width = isSm ? 30 : 40;
  const height = isSm ? 16 : 20;
  const thumbSize = isSm ? 12 : 18;
  const thumbHeight = isSm ? 8 : 14;
  const offset = 1;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none ${
        checked ? "bg-[var(--primary)]" : "bg-primary-bg"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: `1.5px solid ${checked ? "var(--primary)" : "var(--inputborder)"}`,
      }}
    >
      <span
        className={`absolute rounded-full transition-transform duration-200 ${
          checked ? "bg-white" : "bg-gray-400"
        }`}
        style={{
          width: `${thumbSize}px`,
          height: `${thumbHeight}px`,
          transform: `translateX(${checked ? width - thumbSize - offset - 3 : offset - [-1]}px)`,
        }}
      />
    </button>
  );
}
