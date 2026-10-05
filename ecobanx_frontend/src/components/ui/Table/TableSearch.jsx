"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export default function TableSearch({
  placeholder = "Search...",
  value,
  defaultValue = "",
  onChange,
  onDebouncedChange,
  debounce = 0,
  clearable = true,
  className = "",
}) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlled ? value : internalValue;

  useEffect(() => {
    if (!debounce || typeof onDebouncedChange !== "function") return undefined;

    const timer = window.setTimeout(
      () => onDebouncedChange(currentValue),
      debounce,
    );
    return () => window.clearTimeout(timer);
  }, [currentValue, debounce, onDebouncedChange]);

  const handleChange = (event) => {
    const nextValue = event.target.value;

    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
    if (!debounce && typeof onDebouncedChange === "function") {
      onDebouncedChange(nextValue);
    }
  };

  const handleClear = () => {
    if (!controlled) setInternalValue("");
    onChange?.("");
    onDebouncedChange?.("");
  };

  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-full border border-input-border bg-input-bg pl-11 pr-11 text-sm text-text outline-none transition placeholder:text-secondary-text focus:border-theme-text"
      />
      {clearable && currentValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-secondary-text transition hover:bg-secondary-bg hover:text-text"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
