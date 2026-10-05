"use client";

import { useState } from "react";
import Toast from "./Toast";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses = {
  primary:
    "border border-transparent [background:var(--button-primary)] text-white shadow-sm hover:brightness-110 active:brightness-95 hover:scale-[1.02]",
  secondary:
    "border border-input-border bg-button-secondary text-theme-text shadow-sm hover:border-text-primary hover:bg-input-bg active:brightness-95",
};

export default function Button({
  children,
  label,
  variant = "primary",
  type = "button",
  beforeIcon,
  afterIcon,
  className = "",
  disabled = false,
  onClick,
  toastContent,
  toastColor = "success",
  toastDuration = 2500,
  ...props
}) {
  const [toastKey, setToastKey] = useState(0);
  const content = children ?? label;

  function handleClick(event) {
    onClick?.(event);

    if (!event.defaultPrevented && toastContent) {
      setToastKey((current) => current + 1);
    }
  }

  return (
    <>
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={joinClasses(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-mid font-medium leading-none transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant] ?? variantClasses.primary,
          className,
        )}
        {...props}
      >
        {beforeIcon && <span className="inline-flex shrink-0">{beforeIcon}</span>}
        {content && <span>{content}</span>}
        {afterIcon && <span className="inline-flex shrink-0">{afterIcon}</span>}
      </button>

      {toastKey > 0 && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toastKey}
            content={toastContent}
            color={toastColor}
            duration={toastDuration}
          />
        </div>
      )}
    </>
  );
}
