"use client";

import { useMemo } from "react";
import Dropdown from "../dropdown";

function normalizeOptions(options, values) {
  return (options.length ? options : values).map((item) =>
    typeof item === "string" ? { label: item, value: item } : item,
  );
}

export default function TableFilter({
  placeholder = "Filter",
  options = [],
  values = [],
  value,
  onChange,
  searchable = true,
  multiSelect = false,
  selectAll = false,
  className = "",
}) {
  const normalizedOptions = useMemo(
    () => normalizeOptions(options, values),
    [options, values],
  );

  return (
    <Dropdown
      placeholder={placeholder}
      options={normalizedOptions}
      value={value}
      onChange={onChange}
      searchable={searchable}
      multiSelect={multiSelect}
      selectAll={selectAll}
      clearable
      className={`w-full sm:w-auto rounded-full ${className}`}
    />
  );
}
