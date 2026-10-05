"use client";

import { isValidElement } from "react";

function renderIcon(icon, size) {
  if (!icon) return null;

  if (isValidElement(icon)) {
    return <span className="shrink-0 text-current">{icon}</span>;
  }

  if (typeof icon === "function" || typeof icon === "object") {
    const Icon = icon;
    return <Icon size={size} strokeWidth={2.5} className="shrink-0 text-current" />;
  }

  return null;
}

export default function TabButton({
  children,
  className = "",
  disabled = false,
  icon,
  iconSize = 15,
  onClick,
  rightIcon,
  role = "tab",
  selected = false,
  type = "button",
  value,
  ...props
}) {
  const stateClasses = selected
    ? "border-primary text-primary-text "
    : "border-primary/20 text-theme-text hover:border-primary/50 hover:text-theme-text";

  return (
    <button
      type={type}
      role={role}
      aria-selected={role === "tab" ? selected : undefined}
      aria-pressed={role === "tab" ? undefined : selected}
      disabled={disabled}
      onClick={onClick}
      className={`group inline-flex min-h-10 max-w-full items-center justify-center gap-2 border-b-4 px-4 py-2 text-sm font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-45 ${stateClasses} ${className}`}
      {...props}
    >
      {renderIcon(icon, iconSize)}
      <span className="min-w-0 truncate">{children ?? value}</span>
      {renderIcon(rightIcon, iconSize)}
    </button>
  );
}
