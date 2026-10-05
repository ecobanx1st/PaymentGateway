"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getOptionValue(option) {
  if (!option) {
    return "";
  }

  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option) {
  if (!option) {
    return "";
  }

  return typeof option === "string" ? option : option.label;
}

export default function Dropdown({
  label,
  labelDescription,
  options = [],
  value,
  defaultValue,
  placeholder = "Select option",
  onChange,
  disabled = false,
  multiple = false,
  inlineLabel,
  className = "",
  labelClassName = "",
  descriptionClassName = "",
  triggerClassName = "",
  menuClassName = "",
  optionClassName = "",
}) {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const firstValue = useMemo(() => getOptionValue(options[0]), [options]);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    left: 16,
    top: 16,
    width: 192,
  });
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? (multiple ? [] : firstValue),
  );
  const selectedValue = value ?? internalValue;
  const selectedValues = useMemo(
    () =>
      multiple
        ? (Array.isArray(selectedValue) ? selectedValue : [])
            .map((item) => String(item))
            .filter(Boolean)
        : [],
    [multiple, selectedValue],
  );
  const selectedOption = !multiple
    ? options.find((option) => getOptionValue(option) === selectedValue)
    : null;
  const selectedLabels = multiple
    ? options
        .filter((option) => selectedValues.includes(String(getOptionValue(option))))
        .map(getOptionLabel)
        .filter(Boolean)
    : [];
  const selectedLabel = multiple
    ? selectedLabels.length > 2
      ? `${selectedLabels.length} selected`
      : selectedLabels.join(", ")
    : selectedOption
      ? getOptionLabel(selectedOption)
      : "";

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function updateMenuPosition() {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 16;
      const menuWidth = Math.max(rect.width, 192);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        Math.max(window.innerWidth - menuWidth - viewportPadding, viewportPadding),
      );
      const top = Math.min(
        Math.max(rect.bottom + 8, viewportPadding),
        Math.max(window.innerHeight - viewportPadding - 256, viewportPadding),
      );

      setMenuPosition({ left, top, width: menuWidth });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  function handleSelect(option) {
    if (typeof option === "object" && option.disabled) {
      return;
    }

    const nextValue = getOptionValue(option);

    if (multiple) {
      const normalizedNextValue = String(nextValue);
      const nextValues = selectedValues.includes(normalizedNextValue)
        ? selectedValues.filter((item) => item !== normalizedNextValue)
        : [...selectedValues, normalizedNextValue];

      if (value === undefined) {
        setInternalValue(nextValues);
      }

      onChange?.(nextValues, option);
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, option);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={joinClasses("relative w-full", className)}>
      {(label || labelDescription) && (
        <div className="mb-2 flex flex-col gap-1">
          {label && (
            <p
              className={joinClasses(
                "text-mid font-medium text-text-secondary",
                labelClassName,
              )}
            >
              {label}
            </p>
          )}
          {labelDescription && (
            <p
              className={joinClasses(
                "text-small text-input-text",
                descriptionClassName,
              )}
            >
              {labelDescription}
            </p>
          )}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={joinClasses(
          "flex h-11 w-full items-center justify-between rounded-full border border-input-border bg-input-bg px-4 text-left text-mid outline-none transition focus:border-text-primary disabled:cursor-not-allowed disabled:opacity-50",
          selectedLabel ? "text-theme-text" : "text-input-text",
          triggerClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-1 truncate">
          {inlineLabel && (
            <span className="shrink-0 text-text-secondary">{inlineLabel}:</span>
          )}
          <span className="truncate">{selectedLabel || placeholder}</span>
        </span>
        <ChevronDown
          className={joinClasses("ml-3 h-4 w-4 shrink-0 text-theme-text transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable={multiple}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
          className={joinClasses(
            "fixed z-[100] max-h-64 overflow-y-auto rounded-rounded border border-input-border/40 bg-bg-secondary p-1 shadow-2xl shadow-black/30",
            menuClassName,
          )}
        >
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            const optionDisabled = typeof option === "object" && option.disabled;
            const selected = multiple
              ? selectedValues.includes(String(optionValue))
              : optionValue === selectedValue;

            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={optionDisabled}
                onClick={() => handleSelect(option)}
                className={joinClasses(
                  "flex w-full items-center justify-between gap-3 rounded-rounded px-3 py-2 text-left text-mid transition disabled:cursor-not-allowed disabled:opacity-40",
                  selected
                    ? "bg-text-primary/15 text-text-primary"
                    : "text-theme-text hover:bg-input-bg hover:text-text-primary",
                  optionClassName,
                )}
              >
                <span className="truncate">{optionLabel}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
