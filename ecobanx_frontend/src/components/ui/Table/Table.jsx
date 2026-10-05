"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import TableEmpty from "./TableEmpty";
import TableHeader from "./TableHeader";
import TableLoading from "./TableLoading";
import TablePagination from "./TablePagination";
import TableRowActions from "./TableRowActions";
import TableToolbar from "./TableToolbar";

const defaultChipMaps = {
  status: {
    Success: {
      dot: "bg-green-400",
      text: "text-green-400",
      bg: "bg-green-400/10",
    },
    Pending: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/15",
    },
    Confirmed: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    Failed: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
    Refunded: {
      dot: "bg-blue-400",
      text: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    Delivered: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    Retrying: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-100/15",
    },
    Disabled: {
      dot: "bg-secondary-text",
      text: "text-secondary-text",
      bg: "bg-secondary-bg",
    },
    Active: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    Resolved: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    "In progress": {
      dot: "bg-blue-400",
      text: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    Blocked: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
    Open: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/15",
    },
  },
  priority: {
    Low: {
      dot: "bg-primary-text",
      text: "text-primary-text",
      bg: "bg-primary-text/10",
    },
    Medium: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/15",
    },
    High: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
    Critical: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
  },
};

const DEFAULT_TABLE_PAGE_SIZE = 10;
const ROW_NUMBER_COLUMN_KEY = "__rowNumber__";
const ROW_NUMBER_COLUMN_KEYS = new Set([
  ROW_NUMBER_COLUMN_KEY,
  "rowNumber",
  "serialNumber",
  "serial",
  "srNo",
  "sno",
  "no",
  "index",
]);

function toPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? Math.floor(number)
    : fallback;
}

function toNonNegativeInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0
    ? Math.floor(number)
    : fallback;
}

function isRowNumberColumn(column) {
  return ROW_NUMBER_COLUMN_KEYS.has(String(column?.key ?? ""));
}

function hasRowNumberColumn(columns = []) {
  return columns.some(isRowNumberColumn);
}

function mergeMaps(baseMap, customMap) {
  return { ...baseMap, ...(customMap ?? {}) };
}

function getChipTheme(field, value, chipMaps) {
  const merged = {
    status: mergeMaps(defaultChipMaps.status, chipMaps?.status),
    priority: mergeMaps(defaultChipMaps.priority, chipMaps?.priority),
  };

  return merged[field]?.[value];
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(flattenValue).join(" ");
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (isObject(value)) {
    return Object.values(value).map(flattenValue).join(" ");
  }
  return "";
}

function getRowKey(row, index, keyGetter) {
  if (typeof keyGetter === "function") {
    return keyGetter(row, index);
  }

  return row?.id ?? row?.key ?? row?.uuid ?? index;
}

function renderChip(value, field, chipMaps) {
  const theme = getChipTheme(field, value, chipMaps);

  if (!theme) {
    return <span className="font-medium text-text">{value}</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${theme.bg} ${theme.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
      {value}
    </span>
  );
}

function isDateColumn(column) {
  const key = String(column?.key || "");
  const title = String(column?.title || "");

  return (
    column?.type === "date" ||
    /(^|\.|_)(date|createdAt|updatedAt|lastAttempt)$/i.test(key) ||
    /\b(date|created|updated|attempt)\b/i.test(title)
  );
}

function getDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== "string" && typeof value !== "number") return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function renderDateCell(value) {
  if (!value || value === "-") {
    return <span className="text-secondary-text">-</span>;
  }

  const date = getDateValue(value);

  if (!date) {
    return <span className="text-secondary-text">{value}</span>;
  }

  const day = date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const fullDate = date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <time
      dateTime={date.toISOString()}
      title={fullDate}
      className="inline-flex items-center gap-2 rounded-full border border-input-border bg-secondary-bg/70 px-2.5 py-1 text-xs font-semibold text-theme-text"
    >
      <span>{day}</span>
      <span className="h-1 w-1 rounded-full bg-secondary-text/50" />
      <span className="font-medium text-secondary-text">{time}</span>
    </time>
  );
}

function renderAvatarCell(value, row, column) {
  const avatar = isObject(value) ? value : {};
  const src = avatar.src ?? avatar.image ?? value;
  const label =
    avatar.label ?? avatar.name ?? row[column.key] ?? row.name ?? "";
  const alt = avatar.alt ?? label ?? "Avatar";

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-bg text-sm font-semibold text-text">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{String(label).slice(0, 2).toUpperCase()}</span>
        )}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </div>
  );
}

function renderImageCell(value, row, column) {
  const image = isObject(value) ? value : {};
  const src = image.src ?? value;
  const alt = image.alt ?? image.label ?? row[column.key] ?? "Image";

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-xl object-cover"
      loading="lazy"
    />
  );
}

function renderIconCell(value, row, column) {
  const icon = isObject(value) ? (value.icon ?? value) : value;
  const label = isObject(value) ? (value.label ?? row[column.key]) : null;

  const iconNode =
    typeof icon === "function"
      ? (() => {
          const Icon = icon;
          return <Icon size={16} />;
        })()
      : icon;

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary-bg text-secondary-text">
        {iconNode}
      </span>
      {label ? <span className="truncate">{label}</span> : null}
    </div>
  );
}

function SelectionCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-primary/20"
      aria-label="Select row"
    />
  );
}

function buildHeaderButton(label, onClick, variant = "ghost") {
  const baseClass =
    "inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition";

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} border-primary bg-primary text-white hover:bg-primary-hover`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} border-input-border bg-input-bg text-text hover:border-primary hover:text-primary`}
    >
      {label}
    </button>
  );
}

function compareValues(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  const leftString = String(left).toLowerCase();
  const rightString = String(right).toLowerCase();
  return leftString.localeCompare(rightString);
}

export default function Table({
  title = "",
  subtitle = "",
  description = "",
  columns = [],
  data,
  rows,
  loading = false,
  search = true,
  searchPlaceholder = "Search...",
  searchDebounce = 0,
  filters = [],
  showFilter = false,
  showViewAll = false,
  viewAllLabel = "View All",
  onViewAll,
  showAddButton = false,
  addButtonLabel = "Add New",
  onAdd,
  showExportButton = false,
  exportButtonLabel = "Export",
  onExport,
  actions = null,
  headerActions = null,
  rowActions = null,
  pagination = null,
  selectable = false,
  bordered = true,
  striped = false,
  hover = true,
  stickyHeader = false,
  emptyMessage = "",
  emptyState = "",
  emptyTitle = "No data found",
  emptyCtaLabel,
  onEmptyCta,
  bgClassName = "",
  className = "",
  tableClassName = "",
  minWidth = 760,
  chipFields = ["status", "priority"],
  chipMaps,
  getRowKey: getRowKeyProp,
  selectedRowKeys,
  onSelectedRowKeysChange,
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  summary,
  pages,
}) {
  const sourceData = useMemo(() => data ?? rows ?? [], [data, rows]);
  const subtitleText = subtitle || description || "";
  const emptyMessageText = emptyMessage || emptyState || "No data available.";
  const [searchValue, setSearchValue] = useState("");
  const [filterState, setFilterState] = useState({});
  const [sortState, setSortState] = useState(null);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState([]);

  const controlledSelection = selectedRowKeys !== undefined;
  const selectedKeys = controlledSelection
    ? selectedRowKeys
    : internalSelectedKeys;

  const normalizedFilters = useMemo(
    () =>
      filters.map((filter) => ({
        ...filter,
        key: filter.key ?? filter.field ?? filter.label,
      })),
    [filters],
  );

  const resolvedFilterValues = useMemo(() => {
    const values = {};

    for (const filter of normalizedFilters) {
      if (!filter.key) continue;
      if (filter.value !== undefined) {
        values[filter.key] = filter.value;
      } else if (filterState[filter.key] !== undefined) {
        values[filter.key] = filterState[filter.key];
      } else if (filter.defaultValue !== undefined) {
        values[filter.key] = filter.defaultValue;
      }
    }

    return values;
  }, [filterState, normalizedFilters]);

  const filteredData = useMemo(() => {
    let next = [...sourceData];

    if (search && searchValue.trim()) {
      const needle = searchValue.trim().toLowerCase();
      next = next.filter((row) =>
        columns.some((column) => {
          if (
            column.searchable === false ||
            column.type === "actions" ||
            column.type === "checkbox"
          ) {
            return false;
          }

          const value =
            typeof column.sortAccessor === "function"
              ? column.sortAccessor(row)
              : row?.[column.key];

          return flattenValue(value).toLowerCase().includes(needle);
        }),
      );
    }

    for (const filter of normalizedFilters) {
      if (!filter.field || !filter.key) continue;
      const value = resolvedFilterValues[filter.key];
      const selectedValue = value?.value ?? value;

      if (Array.isArray(value) && value.length === 0) continue;
      if (
        selectedValue === undefined ||
        selectedValue === null ||
        selectedValue === ""
      )
        continue;

      next = next.filter((row) => {
        const rowValue = row[filter.field];

        if (typeof filter.filterFn === "function") {
          return filter.filterFn(rowValue, value, row);
        }

        if (Array.isArray(value)) {
          const rowString = flattenValue(rowValue);
          return value.some(
            (item) => rowString === flattenValue(item?.value ?? item),
          );
        }

        return flattenValue(rowValue) === flattenValue(selectedValue);
      });
    }

    if (sortState?.column) {
      const sortColumn = columns.find(
        (column) => column.key === sortState.column,
      );
      if (sortColumn) {
        next.sort((left, right) => {
          const leftValue =
            typeof sortColumn.sortAccessor === "function"
              ? sortColumn.sortAccessor(left)
              : left?.[sortColumn.key];
          const rightValue =
            typeof sortColumn.sortAccessor === "function"
              ? sortColumn.sortAccessor(right)
              : right?.[sortColumn.key];

          const result = compareValues(leftValue, rightValue);
          return sortState.direction === "asc" ? result : -result;
        });
      }
    }

    return next;
  }, [
    columns,
    normalizedFilters,
    resolvedFilterValues,
    search,
    searchValue,
    sortState,
    sourceData,
  ]);

  const rowActionList = Array.isArray(rowActions)
    ? rowActions
    : typeof rowActions === "function"
      ? rowActions
      : (rowActions?.actions ?? []);
  const rowActionNode =
    rowActions && !Array.isArray(rowActions) && typeof rowActions !== "function"
      ? rowActions
      : null;
  const rowActionEnabled = Boolean(
    rowActionNode ||
    typeof rowActions === "function" ||
    (Array.isArray(rowActionList) && rowActionList.length > 0),
  );

  const headerActionsContent = useMemo(() => {
    const nodes = [];

    if (showViewAll && typeof onViewAll === "function") {
      nodes.push(<span key="view-all">{buildHeaderButton(viewAllLabel, onViewAll)}</span>);
    }

    if (showExportButton && typeof onExport === "function") {
      nodes.push(<span key="export">{buildHeaderButton(exportButtonLabel, onExport)}</span>);
    }

    if (showAddButton && typeof onAdd === "function") {
      nodes.push(<span key="add">{buildHeaderButton(addButtonLabel, onAdd, "primary")}</span>);
    }

    if (headerActions) {
      nodes.push(<span key="header-actions">{headerActions}</span>);
    }

    if (actions) {
      nodes.push(<span key="actions">{actions}</span>);
    }

    return nodes.length ? <>{nodes}</> : null;
  }, [
    actions,
    addButtonLabel,
    exportButtonLabel,
    headerActions,
    onAdd,
    onExport,
    onViewAll,
    showAddButton,
    showExportButton,
    showViewAll,
    viewAllLabel,
  ]);

  const controlledPage = toPositiveInteger(
    pagination?.page ?? pagination?.currentPage ?? page,
    1,
  );
  const controlledTotalPages = toPositiveInteger(
    pagination?.totalPages ?? totalPages,
    1,
  );
  const controlledPageSize = toPositiveInteger(
    pagination?.limit ?? pagination?.pageSize ?? pageSize,
    DEFAULT_TABLE_PAGE_SIZE,
  );
  const controlledTotalItems = toNonNegativeInteger(
    pagination?.totalDocs ?? pagination?.totalItems ?? totalItems,
    filteredData.length,
  );
  const rowNumberStart = (controlledPage - 1) * controlledPageSize;

  const displayedColumns = useMemo(() => {
    const next = [];
    const renderRowNumber = (_value, _row, rowIndex) =>
      rowNumberStart + rowIndex + 1;
    const normalizedColumns = columns.map((column) =>
      isRowNumberColumn(column)
        ? {
            ...column,
            title: column.title ?? "S.No",
            width: column.width ?? 72,
            align: column.align ?? "center",
            cellClassName:
              column.cellClassName ?? "font-semibold text-theme-text",
            render: renderRowNumber,
          }
        : column,
    );

    if (selectable) {
      next.push({
        key: "__select__",
        title: "",
        type: "checkbox",
        width: 48,
      });
    }

    if (!hasRowNumberColumn(columns)) {
      next.push({
        key: ROW_NUMBER_COLUMN_KEY,
        title: "S.No",
        width: 72,
        align: "center",
        cellClassName: "font-semibold text-theme-text",
        render: renderRowNumber,
      });
    }

    next.push(...normalizedColumns);

    if (rowActionEnabled) {
      next.push({ key: "__actions__", title: "Actions", type: "actions" });
    }

    return next;
  }, [columns, rowActionEnabled, rowNumberStart, selectable]);
  const resolvedMinWidth =
    typeof minWidth === "number" ? `${minWidth}px` : minWidth;
  const wrapperClassName = bordered
    ? `bg-primary-bg rounded-[18px] border border-input-border p-4 sm:p-6 ${bgClassName} ${className}`
    : `rounded-[18px] bg-input-bg p-4 shadow-[0_18px_42px_rgba(8,19,12,0.08)] ${bgClassName} ${className}`;

  const selectedRowSet = new Set(selectedKeys);
  const visibleRowKeys = filteredData.map((row, index) =>
    getRowKey(row, index, getRowKeyProp),
  );
  const allVisibleSelected =
    selectable &&
    visibleRowKeys.length > 0 &&
    visibleRowKeys.every((key) => selectedRowSet.has(key));
  const someVisibleSelected =
    selectable && visibleRowKeys.some((key) => selectedRowSet.has(key));

  const updateSelection = (nextKeys) => {
    if (!controlledSelection) {
      setInternalSelectedKeys(nextKeys);
    }
    onSelectedRowKeysChange?.(nextKeys);
  };

  const toggleRowSelection = (rowKey) => {
    const next = selectedRowSet.has(rowKey)
      ? selectedKeys.filter((key) => key !== rowKey)
      : [...selectedKeys, rowKey];
    updateSelection(next);
  };

  const toggleAllVisible = () => {
    const next = allVisibleSelected
      ? selectedKeys.filter((key) => !visibleRowKeys.includes(key))
      : Array.from(new Set([...selectedKeys, ...visibleRowKeys]));
    updateSelection(next);
  };

  const hasToolbar = false;

  const renderCell = (row, column, rowIndex) => {
    const value = row?.[column.key];

    if (column.render) {
      return column.render(value, row, rowIndex);
    }

    if (
      column.type === "status" ||
      chipFields.includes(column.key) ||
      column.type === "priority"
    ) {
      return renderChip(
        value,
        column.type === "priority" ? "priority" : column.key,
        chipMaps,
      );
    }

    if (isDateColumn(column)) {
      return renderDateCell(value);
    }

    if (column.type === "avatar") {
      return renderAvatarCell(value, row, column);
    }

    if (column.type === "image") {
      return renderImageCell(value, row, column);
    }

    if (column.type === "icon") {
      return renderIconCell(value, row, column);
    }

    return value;
  };

  return (
    <section className={wrapperClassName}>
      <TableHeader
        title={title}
        subtitle={subtitleText}
        actions={headerActionsContent}
      />

      {hasToolbar ? (
        <TableToolbar
          search={search}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchDebounce={searchDebounce}
          filters={normalizedFilters}
          showFilter={showFilter}
          filterValues={resolvedFilterValues}
          onFilterChange={(key, nextValue) => {
            setFilterState((current) => ({ ...current, [key]: nextValue }));
          }}
        />
      ) : null}

      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <TableLoading
            columns={displayedColumns}
            rows={5}
            minWidth={resolvedMinWidth}
          />
        ) : filteredData.length ? (
          <div
            style={{ minWidth: resolvedMinWidth }}
            className={tableClassName}
          >
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[11px] tracking-wider uppercase text-secondary-text">
                  {displayedColumns.map((column) => {
                    const isSelectionColumn = column.type === "checkbox";
                    const isActionColumn = column.type === "actions";
                    const isSortable = Boolean(column.sortable);

                    return (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-4 pb-4 font-semibold sm:px-6 ${
                          stickyHeader
                            ? "sticky top-0 z-10 bg-input-bg/95 backdrop-blur"
                            : ""
                        } ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                              ? "text-right"
                              : "text-left"
                        } ${column.className ?? ""}`}
                        style={
                          column.width ? { width: column.width } : undefined
                        }
                      >
                        {isSelectionColumn ? (
                          <SelectionCheckbox
                            checked={allVisibleSelected}
                            indeterminate={
                              someVisibleSelected && !allVisibleSelected
                            }
                            onChange={toggleAllVisible}
                          />
                        ) : isActionColumn ? (
                          column.title
                        ) : isSortable ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSortState((current) => {
                                if (current?.column === column.key) {
                                  return {
                                    column: column.key,
                                    direction:
                                      current.direction === "asc"
                                        ? "desc"
                                        : "asc",
                                  };
                                }

                                return { column: column.key, direction: "asc" };
                              })
                            }
                            className="inline-flex items-center gap-1 text-left"
                          >
                            <span>{column.title}</span>
                            {sortState?.column === column.key ? (
                              sortState.direction === "asc" ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="opacity-60" />
                            )}
                          </button>
                        ) : (
                          column.title
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row, rowIndex) => {
                  const rowKey = getRowKey(row, rowIndex, getRowKeyProp);
                  const selected = selectedRowSet.has(rowKey);

                  return (
                    <tr
                      key={rowKey}
                      className={`border-t border-input-border text-secondary-text ${
                        hover ? "transition hover:bg-secondary-bg/80" : ""
                      } ${striped && rowIndex % 2 === 1 ? "bg-input-bg" : ""} ${
                        selected ? "bg-secondary-bg" : ""
                      }`}
                    >
                      {displayedColumns.map((column) => {
                        if (column.type === "checkbox") {
                          return (
                            <td
                              key={`${rowKey}-select`}
                              className="px-4 py-4 align-middle sm:px-6"
                            >
                              <SelectionCheckbox
                                checked={selected}
                                onChange={() => toggleRowSelection(rowKey)}
                              />
                            </td>
                          );
                        }

                        if (column.type === "actions") {
                          const actionsForRow =
                            typeof rowActions === "function"
                              ? rowActions(row, rowIndex)
                              : rowActionList;

                          return (
                            <td
                              key={`${rowKey}-actions`}
                              className={`px-4 py-4 border-t text-md border-input-border align-middle sm:px-6 ${column.cellClassName ?? ""}`}
                            >
                              {rowActionNode ? (
                                rowActionNode
                              ) : (
                                <TableRowActions
                                  actions={actionsForRow}
                                  row={row}
                                />
                              )}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={`${rowKey}-${column.key}`}
                            className={`px-4 py-4 text-md  border-t border-input-border align-middle text-secondary-text sm:px-6 ${
                              column.align === "center"
                                ? "text-center"
                                : column.align === "right"
                                  ? "text-right"
                                  : "text-left"
                            } ${column.cellClassName ?? ""}`}
                          >
                            {renderCell(row, column, rowIndex)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty
            title={emptyTitle}
            description={emptyMessageText}
            ctaLabel={emptyCtaLabel}
            onCta={onEmptyCta}
          />
        )}
      </div>

      {pagination ? (
        <TablePagination
          page={controlledPage}
          totalPages={controlledTotalPages}
          pageSize={controlledPageSize}
          totalItems={controlledTotalItems}
          onPageChange={pagination.onPageChange ?? onPageChange}
          onPageSizeChange={pagination.onPageSizeChange ?? onPageSizeChange}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
          pageSizeOptions={pagination.pageSizeOptions ?? pageSizeOptions}
          pages={pagination.pages ?? pages}
          summary={pagination.summary ?? summary}
        />
      ) : null}
    </section>
  );
}
