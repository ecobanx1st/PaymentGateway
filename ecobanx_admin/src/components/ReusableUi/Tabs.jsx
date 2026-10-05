"use client";

import { useMemo, useState } from "react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getTabValue(tab) {
  if (typeof tab === "string") {
    return tab;
  }

  return tab.value ?? tab.id ?? tab.label;
}

function getTabLabel(tab) {
  return typeof tab === "string" ? tab : tab.label;
}

const variantClasses = {
  pill: {
    wrapper: "flex flex-wrap items-center gap-3",
    tab: "cursor-pointer rounded-full border px-5 py-2 text-mid font-medium shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    selected: "border-text-primary bg-text-primary text-white",
    idle: "border-input-border bg-white text-text-secondary hover:border-text-primary hover:text-text-primary",
  },
  underline: {
    wrapper:
      "flex flex-nowrap items-center gap-7 overflow-x-auto border-b border-input-border/40",
    tab: "shrink-0 border-b-2 px-0 py-3 text-mid font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
    selected: "border-text-primary text-text-primary",
    idle: "border-transparent text-text-secondary hover:text-text-primary",
  },
};

export default function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  className = "",
  tabClassName = "",
  variant = "pill",
}) {
  const firstValue = useMemo(() => getTabValue(tabs[0]), [tabs]);
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstValue);
  const selectedValue = value ?? internalValue;
  const styles = variantClasses[variant] ?? variantClasses.pill;

  function handleChange(nextValue, tab) {
    if (tab?.disabled) {
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, tab);
  }

  return (
    <div role="tablist" className={joinClasses(styles.wrapper, className)}>
      {tabs.map((tab) => {
        const tabValue = getTabValue(tab);
        const label = getTabLabel(tab);
        const disabled = typeof tab === "object" && tab.disabled;
        const isSelected = tabValue === selectedValue;

        return (
          <button
            key={tabValue}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => handleChange(tabValue, tab)}
            className={joinClasses(
              styles.tab,
              isSelected ? styles.selected : styles.idle,
              tabClassName,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
