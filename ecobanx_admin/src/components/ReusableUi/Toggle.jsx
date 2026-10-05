"use client";

import { useState } from "react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  className = "",
  knobClassName = "",
  ...props
}) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const selected = controlled ? checked : internalChecked;

  function handleClick() {
    if (disabled) {
      return;
    }

    const nextChecked = !selected;

    if (!controlled) {
      setInternalChecked(nextChecked);
    }

    onChange?.(nextChecked);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={selected}
      disabled={disabled}
      onClick={handleClick}
      className={joinClasses(
        "relative h-5 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        selected ? "[background:var(--button-primary)]" : "bg-slate-300",
        className,
      )}
      {...props}
    >
      <span
        className={joinClasses(
          "absolute left-1 top-1/2 -translate-y-1/2 rounded-full transition",
          selected
            ? "h-3 w-5 translate-x-4 bg-white"
            : "h-3 w-5 translate-x-0 bg-white",
          knobClassName,
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
