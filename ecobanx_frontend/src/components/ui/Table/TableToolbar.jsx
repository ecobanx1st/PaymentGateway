"use client";

import TableFilter from "./TableFilter";
import TableSearch from "./TableSearch";
import DateFilter from "../DateFilter";

export default function TableToolbar({
  search = true,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  searchDebounce = 0,
  filters = [],
  showFilter = true,
  filterValues = {},
  onFilterChange,
  className = "",
}) {
  const searchFilter = filters.find((filter) => filter.type === "search");
  const dropdownFilters = filters.filter((filter) => filter.type !== "search");

  const searchNode = searchFilter || search ? (
    <div className="w-full lg:max-w-2xl lg:flex-1">
      <TableSearch
        placeholder={searchFilter?.placeholder ?? searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        debounce={searchFilter?.debounce ?? searchDebounce}
        clearable={searchFilter?.clearable ?? true}
      />
    </div>
  ) : null;

  return (
    <div className={`mt-5 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center ${className}`}>
      {searchNode}

      {showFilter && dropdownFilters.length ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          {dropdownFilters.map((filter, index) => {
            const key = filter.key ?? filter.field ?? filter.label ?? index;
            const options = filter.options ?? filter.values ?? [];
            const isDropdown =
              filter.type === "select" ||
              filter.type === "date" ||
              options.length > 0;

            if (filter.type === "date") {
              return (
                <DateFilter
                  key={key}
                  placeholder={filter.placeholder ?? filter.label ?? "Select Date"}
                  value={filter.value ?? filterValues[key]}
                  onChange={(dateData) => onFilterChange?.(key, dateData)}
                  className="w-full sm:w-auto"
                />
              );
            }

            if (!isDropdown) return null;

            return (
              <TableFilter
                key={key}
                placeholder={filter.placeholder ?? filter.label ?? "Filter"}
                options={options}
                value={filter.value ?? filterValues[key]}
                onChange={(nextValue) => onFilterChange?.(key, nextValue)}
                searchable={filter.searchable ?? true}
                multiSelect={filter.multiSelect ?? false}
                selectAll={filter.selectAll ?? false}
                className="w-full sm:w-auto"
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
