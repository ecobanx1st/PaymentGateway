"use client";

import Link from "next/link";
import { isValidElement } from "react";

function renderIcon(icon, className = "h-4 w-4") {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") {
    const Icon = icon;
    return <Icon className={className} />;
  }
  return icon;
}

function getActionTooltip(action, label, row) {
  const tooltip =
    typeof action.tooltip === "function" ? action.tooltip(row) : action.tooltip;
  const title = typeof action.title === "function" ? action.title(row) : action.title;
  const ariaLabel =
    typeof action.ariaLabel === "function" ? action.ariaLabel(row) : action.ariaLabel;

  return tooltip || title || ariaLabel || label || "Action";
}

function ActionTooltip({ label }) {
  if (!label) return null;

  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] whitespace-nowrap rounded-[8px] border border-input-border bg-primary-bg px-2.5 py-1 text-[11px] font-semibold text-theme-text opacity-0 shadow-[0_10px_24px_rgba(8,19,12,0.16)] transition group-hover/action:opacity-100 group-focus-within/action:opacity-100"
    >
      {label}
    </span>
  );
}

function getToneClasses(tone = "default") {
  switch (tone) {
    case "primary":
      return "border-primary-text/20 bg-primary-text/10 text-secondary-text hover:border-primary-text hover:bg-primary-text/25";
    case "danger":
      return "border-red-200 bg-red-100 text-red-400 hover:border-red-400 hover:bg-red-400/25";
    case "success":
      return "border-primary-text/20 bg-primary-text/10 text-primary-text hover:border-primary-text hover:bg-primary-text/15";
    case "warning":
      return "border-red-400/20 bg-red-400/10 text-red-400 hover:border-red-400 hover:bg-red-400/15";
    case "ghost":
      return "border-transparent bg-transparent text-secondary-text hover:bg-transparent hover:text-primary-text";
    case "api-action":
      return "border-input-border bg-transparent text-secondary-text hover:border-primary-text hover:text-primary-text";
    default:
      return "border-input-border bg-primary-bg text-secondary-text hover:border-primary-border hover:text-primary-text";
  }
}

export default function TableRowActions({ actions = [], row, className = "" }) {
  if (!actions?.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {actions.map((action, index) => {
        const key = action.key ?? action.label ?? index;
        const disabled = action.disabled?.(row) ?? action.disabled ?? false;
        const label =
          typeof action.label === "function" ? action.label(row) : action.label;
        const tone =
          typeof action.tone === "function" ? action.tone(row) : action.tone;
        const classNameValue =
          typeof action.className === "function"
            ? action.className(row)
            : action.className;
        const iconValue =
          typeof action.icon === "function" && action.renderIcon !== false
            ? action.icon(row)
            : action.icon;
        const isApiAction = tone === "api-action";
        const radiusClass = isApiAction ? "rounded-[10px]" : "rounded-full";
        const sizeClass = isApiAction
          ? "h-9 w-9 px-0"
          : action.iconOnly || !label
            ? "h-10 w-10 px-0"
            : "h-9";
        const baseClass = `inline-flex min-h-9 items-center justify-center gap-2 ${radiusClass} border px-3 text-xs font-semibold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${getToneClasses(tone)} ${classNameValue ?? ""}`;

        const tooltipLabel = getActionTooltip(action, label, row);

        if (action.href) {
          const href =
            typeof action.href === "function" ? action.href(row) : action.href;
          return (
            <span key={key} className="group/action relative inline-flex">
              <Link
                href={href}
                aria-label={action.ariaLabel ?? label}
                title={tooltipLabel}
                className={baseClass}
                target={action.target}
                rel={action.rel}
              >
                {renderIcon(iconValue)}
                {action.iconOnly || !label ? null : <span>{label}</span>}
              </Link>
              <ActionTooltip label={tooltipLabel} />
            </span>
          );
        }

        return (
          <span key={key} className="group/action relative inline-flex">
            <button
              type="button"
              disabled={disabled}
              onClick={() => action.onClick?.(row)}
              aria-label={action.ariaLabel ?? label}
              title={tooltipLabel}
              className={baseClass}
            >
              {renderIcon(iconValue)}
              {action.iconOnly || !label ? null : <span>{label}</span>}
            </button>
            <ActionTooltip label={tooltipLabel} />
          </span>
        );
      })}
    </div>
  );
}
