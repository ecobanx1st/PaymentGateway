"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

function normalizeOptions(options, values) {
  const source = options.length ? options : values;

  return source.map((item) =>
    typeof item === "string" ? { label: item, value: item } : item,
  );
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

function getSearchFields(item) {
  return [
    item?.label,
    item?.value,
    item?.dialCode,
    item?.code,
    item?.iso2,
    item?.countryCode,
  ]
    .map(normalizeSearchText)
    .filter(Boolean);
}

function getMatchRank(item, query) {
  if (!query) return 0;

  const fields = getSearchFields(item);
  const parts = query.split(/\s+/).filter(Boolean);
  const haystack = fields.join(" ");

  if (!parts.every((part) => haystack.includes(part))) return -1;

  const hasPrefixMatch = fields.some(
    (field) =>
      field.startsWith(query) ||
      field.split(/\s+/).some((word) => word.startsWith(query)),
  );

  return hasPrefixMatch ? 0 : 1;
}

export default function Dropdown({
  label,
  required = false,
  placeholder = "Select",
  options = [],
  values = [],
  value = null,
  onChange,
  error = "",
  className = "",
  triggerClassName = "",
  multiSelect = false,
  searchable = true,
  selectAll = false,
  clearable = false,
  onSearch,
  searching = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const normalizedOptions = useMemo(
    () => normalizeOptions(options, values),
    [options, values],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filtered = normalizedOptions
    .map((item, index) => ({ item, index }))
    .map(({ item, index }) => ({
      item,
      index,
      rank: getMatchRank(item, normalizeSearchText(search)),
    }))
    .filter(({ rank }) => rank !== -1)
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ item }) => item);

  const isSelected = (item) => {
    if (!multiSelect) return value?.value === item.value;

    return value?.some((selectedItem) => selectedItem.value === item.value);
  };

  const hasSelection = multiSelect
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  const displayText = () => {
    if (!multiSelect) return value?.label || placeholder;

    if (!value || value.length === 0) return placeholder;
    if (value.length === normalizedOptions.length) return "All Selected";

    return value.map((item) => item.label).join(", ");
  };

  const handleSelect = (item) => {
    if (!multiSelect) {
      onChange?.(item);
      setOpen(false);
      return;
    }

    let selected = value || [];

    if (isSelected(item)) {
      selected = selected.filter(
        (selectedItem) => selectedItem.value !== item.value,
      );
    } else {
      selected = [...selected, item];
    }

    onChange?.(selected);
  };

  const handleSelectAll = () => {
    if (value?.length === normalizedOptions.length) {
      onChange?.([]);
    } else {
      onChange?.(normalizedOptions);
    }
  };

  const handleClear = () => {
    onChange?.(multiSelect ? [] : null);
    setSearch("");
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={dropdownRef}>
      {label ? (
        <label className="text-sm font-medium text-secondary-text">
          {label}
          {required ? <span className="ml-1 text-red-400">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          title={displayText()}
          className={`flex h-11 w-full items-center justify-between gap-7 rounded-full border border-input-border bg-input-bg px-3 transition focus:border-theme-text ${triggerClassName}`}
        >
          <span className="truncate text-theme-text">{displayText()}</span>

          <ChevronDown
            size={18}
            className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-full w-max max-w-xs overflow-hidden rounded-2xl border border-input-border bg-secondary-bg shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
            {clearable && hasSelection && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-secondary-text transition hover:bg-input-bg hover:text-text"
                >
                  <X size={13} />
                  Clear
                </button>
              </div>
            )}

            {searchable ? (
              <div className=" border-border p-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text"
                  />

                  <input
                    value={search}
                    onChange={(event) => {
                      const nextValue = event.target.value;

                      setSearch(nextValue);
                      onSearch?.(nextValue);
                    }}
                    placeholder="Search..."
                    className="h-11 w-full rounded-xl border border-input-border bg-input-bg pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                  />
                </div>
              </div>
            ) : null}

            {multiSelect && selectAll ? (
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex w-full items-center justify-between border-input-border px-4 py-3 text-sm hover:bg-input-bg"
              >
                Select All
                {value?.length === normalizedOptions.length ? (
                  <Check size={18} className="text-primary" />
                ) : null}
              </button>
            ) : null}

            <ul className="max-h-60 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-5 text-center text-sm text-secondary-text">
                  {searching ? "Loading..." : "No Data Found"}
                </li>
              ) : null}

              {filtered.map((item) => (
                <li
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition hover:bg-input-bg"
                >
                  <span>{item.label}</span>

                  {isSelected(item) ? (
                    <Check size={18} className="text-primary" />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {error && (
        <span className="min-h-[18px] text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
