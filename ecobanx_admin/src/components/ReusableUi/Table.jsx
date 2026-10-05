"use client";

import {
  Check,
  Eye,
  History,
  Pause,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import Dropdown from "./Dropdown";
import Input from "./Input";
import TableFilters from "./TableFilters";
import { Database } from "lucide-react";
function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const statusClasses = {
  completed: "bg-emerald-500/15 text-emerald-400",
  confirmed: "bg-emerald-500/15 text-emerald-400",
  consolidated: "bg-sky-500/15 text-sky-300",
  success: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-300",
  requested: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
  rejected: "bg-red-500/15 text-red-400",
  processing: "bg-sky-500/15 text-sky-300",
  verified: "bg-emerald-500/15 text-emerald-400",
  active: "bg-emerald-500/15 text-emerald-400",
  enabled: "bg-emerald-500/15 text-emerald-400",
  disabled: "bg-zinc-500/20 text-text-secondary",
  native: "bg-emerald-500/15 text-emerald-400",
  token: "bg-blue-500/15 text-blue-300",
  evm: "bg-blue-500/15 text-blue-300",
  btc: "bg-amber-500/15 text-amber-300",
  svm: "bg-violet-500/15 text-violet-300",
  suspended: "bg-zinc-500/20 text-text-secondary",
  "soft deleted": "bg-zinc-500/20 text-text-secondary",
  refunded: "bg-blue-500/15 text-blue-300",
  uploaded: "bg-emerald-500/15 text-emerald-400",
  missing: "bg-red-500/15 text-red-400",
  "needs review": "bg-amber-500/15 text-amber-300",
  blocked: "bg-red-500/15 text-red-400",
  flagged: "bg-amber-500/15 text-amber-300",
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-red-500/15 text-red-400",
  open: "bg-blue-500/15 text-blue-300",
  "in progress": "bg-amber-500/15 text-amber-300",
  resolved: "bg-emerald-500/15 text-emerald-400",
  closed: "bg-zinc-500/20 text-text-secondary",
};

const actionIcons = {
  check: Check,
  approve: Check,
  delete: Trash2,
  edit: Pencil,
  reject: X,
  view: Eye,
  pause: Pause,
  history: History,
};

const defaultActions = [
  { key: "approve", label: "Approve", icon: "check" },
  { key: "pause", label: "Pause", icon: "pause" },
  { key: "history", label: "History", icon: "history" },
];

const actionStyleClasses = {
  approve:
    "border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300",
  check:
    "border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300",
  delete:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  harddelete:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  harddeleteasset:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  harddeletenetwork:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  reject:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  cancel:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  rejected:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  suspend:
    "border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300",
  softdelete:
    "border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
  softdeleteasset:
    "border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
  softdeletenetwork:
    "border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
  view: "border-text-primary/50 text-text-primary hover:border-text-primary hover:bg-text-primary/10 hover:text-text-primary",
  edit: "border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300",
  history:
    "border-text-primary/50 text-text-primary hover:border-text-primary hover:bg-text-primary/10 hover:text-text-primary",
};

function normalizeActionKey(value) {
  return String(value || "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function humanizeActionLabel(value) {
  const label = String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return label || "Action";
}

function getActionIdentifier(action) {
  return normalizeActionKey(
    action?.key ?? action?.action ?? action?.name ?? action?.label,
  );
}

function isTruthyActionValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  return !["", "0", "false", "no", "disabled", "hidden"].includes(
    normalizedValue,
  );
}

function isActionAllowed(action) {
  if (!action || typeof action !== "object") {
    return isTruthyActionValue(action);
  }

  const allowedValue =
    action.enabled ??
    action.allowed ??
    action.visible ??
    action.show ??
    action.can;

  return allowedValue === undefined ? true : isTruthyActionValue(allowedValue);
}

function normalizeActionItem(action, fallbackKey) {
  if (typeof action === "string") {
    const key = action.trim();

    return key
      ? { key, label: humanizeActionLabel(key), icon: normalizeActionKey(key) }
      : null;
  }

  if (!action || typeof action !== "object" || !isActionAllowed(action)) {
    return null;
  }

  const key =
    action.key ?? action.action ?? action.name ?? fallbackKey ?? action.label;

  if (!key) {
    return null;
  }

  return {
    ...action,
    key,
    label: action.label ?? humanizeActionLabel(key),
    icon: action.icon ?? normalizeActionKey(key),
  };
}

function normalizeActionSource(actionSource) {
  if (Array.isArray(actionSource)) {
    return actionSource
      .map((action) => normalizeActionItem(action))
      .filter(Boolean);
  }

  if (typeof actionSource === "string") {
    return actionSource
      .split(",")
      .map((action) => normalizeActionItem(action))
      .filter(Boolean);
  }

  if (actionSource && typeof actionSource === "object") {
    return Object.entries(actionSource)
      .filter(([, value]) => isActionAllowed(value))
      .map(([key, value]) =>
        value && typeof value === "object"
          ? normalizeActionItem(value, key)
          : normalizeActionItem(key),
      )
      .filter(Boolean);
  }

  return null;
}

function getRowActionSource(row) {
  return (
    row?.actions ??
    row?.raw?.actions ??
    row?.availableActions ??
    row?.raw?.availableActions ??
    row?.permissions ??
    row?.raw?.permissions
  );
}

function resolveRowActions(row, actions) {
  const fallbackActions = actions ?? defaultActions;
  const rowActionSource = getRowActionSource(row);
  const normalizedRowActions = normalizeActionSource(rowActionSource);

  if (normalizedRowActions === null) {
    return fallbackActions;
  }

  const fallbackByKey = new Map(
    fallbackActions.map((action) => [getActionIdentifier(action), action]),
  );

  return normalizedRowActions.map((rowAction) => {
    const matchedAction = fallbackByKey.get(getActionIdentifier(rowAction));

    if (!matchedAction) {
      return rowAction;
    }

    return {
      ...rowAction,
      ...matchedAction,
      disabled: rowAction.disabled ?? matchedAction.disabled,
      className: rowAction.className ?? matchedAction.className,
    };
  });
}

function getActionTone(action) {
  const key = normalizeActionKey(action.key ?? action.label);
  const label = normalizeActionKey(action.label);

  if (key.includes("approve") || label.includes("approve")) {
    return "success";
  }

  if (key.includes("softdelete") || label.includes("softdelete")) {
    return "warning";
  }

  if (
    key.includes("harddelete") ||
    key.includes("delete") ||
    key.includes("reject") ||
    key.includes("cancel") ||
    label.includes("harddelete") ||
    label.includes("delete") ||
    label.includes("reject") ||
    label.includes("cancel")
  ) {
    return "danger";
  }

  return "primary";
}

function actionNeedsConfirmation(action) {
  const key = normalizeActionKey(action.key ?? action.label);
  const label = normalizeActionKey(action.label);

  return (
    key.includes("approve") ||
    key.includes("delete") ||
    key.includes("reject") ||
    key.includes("cancel") ||
    label.includes("approve") ||
    label.includes("delete") ||
    label.includes("reject") ||
    label.includes("cancel")
  );
}

function actionNeedsReason(action) {
  const key = normalizeActionKey(action.key ?? action.label);
  const label = normalizeActionKey(action.label);

  return (
    key.includes("reject") ||
    key.includes("cancel") ||
    label.includes("reject") ||
    label.includes("cancel")
  );
}

function getConfirmationCopy(action) {
  const key = normalizeActionKey(action.key ?? action.label);
  const labelKey = normalizeActionKey(action.label);
  const label = action.label || action.key || "this action";

  if (key.includes("approve") || labelKey.includes("approve")) {
    return {
      title: "Confirm approval",
      description: `Are you sure you want to ${String(label).toLowerCase()}?`,
      confirmLabel: "Approve",
      reasonLabel: "Reason",
    };
  }

  if (key.includes("softdelete") || labelKey.includes("softdelete")) {
    return {
      title: "Confirm soft delete",
      description: `Are you sure you want to ${String(label).toLowerCase()}?`,
      confirmLabel: "Soft delete",
      reasonLabel: "Reason",
    };
  }

  if (key.includes("harddelete") || labelKey.includes("harddelete")) {
    return {
      title: "Confirm Delete",
      description: `Are you sure you want to ${String(label).toLowerCase()}?`,
      confirmLabel: "Delete",
      reasonLabel: "Reason",
    };
  }

  if (key.includes("delete") || labelKey.includes("delete")) {
    return {
      title: "Confirm delete",
      description: `Are you sure you want to ${String(label).toLowerCase()}?`,
      confirmLabel: "Delete",
      reasonLabel: "Reason",
    };
  }

  if (key.includes("reject") || labelKey.includes("reject")) {
    return {
      title: "Confirm rejection",
      description: `Add a reason before you ${String(label).toLowerCase()}.`,
      confirmLabel: "Reject",
      reasonLabel: "Rejection reason",
    };
  }

  return {
    title: "Confirm cancellation",
    description: `Add a reason before you ${String(label).toLowerCase()}.`,
    confirmLabel: "Confirm",
    reasonLabel: "Cancellation reason",
  };
}

function getActionStyle(action) {
  const key = normalizeActionKey(action.key ?? action.label);
  const label = normalizeActionKey(action.label);

  if (actionStyleClasses[key]) {
    return actionStyleClasses[key];
  }

  if (key.includes("approve") || label.includes("approve")) {
    return actionStyleClasses.approve;
  }

  if (key.includes("softdelete") || label.includes("softdelete")) {
    return actionStyleClasses.softdelete;
  }

  if (
    key.includes("delete") ||
    key.includes("reject") ||
    key.includes("cancel") ||
    label.includes("delete") ||
    label.includes("reject") ||
    label.includes("cancel")
  ) {
    return actionStyleClasses.delete;
  }

  if (
    key.includes("view") ||
    key.includes("edit") ||
    label.includes("view") ||
    label.includes("edit")
  ) {
    return actionStyleClasses.view;
  }

  return "";
}
function getColumnKey(column) {
  return typeof column === "string" ? column : column.key;
}

function getColumnHeader(column) {
  return typeof column === "string" ? column : (column.header ?? column.label);
}

function getColumnType(column) {
  return typeof column === "object" ? column.type : undefined;
}

const rowNumberColumnKeys = new Set([
  "rownumber",
  "serialnumber",
  "serial",
  "srno",
  "sno",
  "no",
  "index",
]);

function isRowNumberColumn(column) {
  return rowNumberColumnKeys.has(
    String(getColumnKey(column) ?? "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase(),
  );
}

function getPositiveNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function resolvePaginationPage(pagination) {
  return getPositiveNumber(pagination?.page ?? pagination?.currentPage, 1);
}

function resolvePaginationPageSize(pagination) {
  return getPositiveNumber(pagination?.limit ?? pagination?.pageSize, 10);
}

function resolveGeneratedRowNumber(pagination, rowIndex) {
  const currentPage = resolvePaginationPage(pagination);
  const pageSize = resolvePaginationPageSize(pagination);

  return (currentPage - 1) * pageSize + rowIndex + 1;
}

function getTableColumns(columns, pagination) {
  const rowNumberColumn = {
    key: "sno",
    header: "S.No",
    type: "rowNumber",
    headClassName: "w-[72px] min-w-[72px] text-center",
    cellClassName: "w-[72px] min-w-[72px] text-center text-text-secondary",
    render: (_value, _row, rowIndex) =>
      resolveGeneratedRowNumber(pagination, rowIndex),
  };
  const normalizedColumns = columns.map((column) => {
    if (!isRowNumberColumn(column)) {
      return column;
    }

    return {
      ...(typeof column === "object" ? column : { key: column }),
      header:
        typeof column === "object" ? (getColumnHeader(column) ?? "S.No") : "S.No",
      type: "rowNumber",
      headClassName: joinClasses(
        "w-[72px] min-w-[72px] text-center",
        typeof column === "object" && column.headClassName,
      ),
      cellClassName: joinClasses(
        "w-[72px] min-w-[72px] text-center text-text-secondary",
        typeof column === "object" && column.cellClassName,
      ),
      render: rowNumberColumn.render,
    };
  });

  return normalizedColumns.some(isRowNumberColumn)
    ? normalizedColumns
    : [rowNumberColumn, ...normalizedColumns];
}

function getCellValue(row, column, rowIndex) {
  const key = getColumnKey(column);

  if (typeof column === "object" && column.render) {
    return column.render(row[key], row, rowIndex);
  }

  return row[key];
}

function getSkeletonWidth(column, columnIndex) {
  const columnType = getColumnType(column);

  if (columnType === "rowNumber") {
    return "w-8";
  }

  if (columnType === "actions") {
    return "w-20";
  }

  return columnIndex % 3 === 0
    ? "w-28"
    : columnIndex % 3 === 1
      ? "w-40"
      : "w-24";
}

function TableSkeletonRows({ columns, rowCount }) {
  return Array.from({ length: rowCount }, (_item, rowIndex) => (
    <tr key={`table-skeleton-${rowIndex}`} className="border-b border-input-border/20">
      {columns.map((column, columnIndex) => {
        const columnKey = getColumnKey(column);
        const columnType = getColumnType(column);

        return (
          <td
            key={`${columnKey}-${rowIndex}`}
            className={joinClasses(
              "px-3 py-5",
              columnType === "actions" &&
                "sticky right-0 z-10 bg-card-bg after:absolute after:inset-y-0 after:-right-5 after:w-5 after:bg-card-bg after:content-['']",
              typeof column === "object" && column.cellClassName,
            )}
          >
            <span
              className={joinClasses(
                "block h-3 animate-pulse rounded-full bg-input-border/60",
                getSkeletonWidth(column, columnIndex),
              )}
            />
          </td>
        );
      })}
    </tr>
  ));
}

function StatusBadge({ value }) {
   const status = String(value ?? "")
     .trim()
     .toLowerCase();

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-small font-medium leading-none",
        statusClasses[status] ?? "",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

function getActionTooltip(action, label, row) {
  const tooltip =
    typeof action.tooltip === "function" ? action.tooltip(row) : action.tooltip;
  const title =
    typeof action.title === "function" ? action.title(row) : action.title;
  const ariaLabel =
    typeof action.ariaLabel === "function"
      ? action.ariaLabel(row)
      : action.ariaLabel;

  return tooltip || title || ariaLabel || label || "Action";
}

function ActionTooltip({ label }) {
  if (!label) {
    return null;
  }

  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-0 z-[80] -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] whitespace-nowrap rounded-[8px] border border-input-border bg-bg-primary px-2.5 py-1 text-[11px] font-semibold text-theme-text opacity-0 shadow-[0_10px_24px_rgba(8,19,12,0.16)] transition group-hover/action:opacity-100 group-focus-within/action:opacity-100"
    >
      {label}
    </span>
  );
}
function TableActions({ row, actions, onAction }) {
  const rowActions = resolveRowActions(row, actions);
  const [confirmation, setConfirmation] = useState(null);

  function runAction(action, actionRow, details = {}) {
    const actionKey = action.key ?? action.label;

    action.onClick?.(actionRow, details);
    onAction?.(actionKey, actionRow, details);
  }

  function handleActionClick(action) {
    if (!actionNeedsConfirmation(action)) {
      runAction(action, row);
      return;
    }

    setConfirmation({ action, row });
  }

  const confirmationCopy = confirmation
    ? getConfirmationCopy(confirmation.action)
    : null;

  return (
    <>
      <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
        {rowActions.map((action) => {
          const actionKey = action.key ?? action.label;
          const Icon = action.iconNode
            ? null
            : (actionIcons[action.icon] ?? Check);
          const icon = action.iconNode ?? <Icon className="h-3 w-3" />;

          const tooltipLabel = getActionTooltip(action, action.label, row);

          return (
            <span key={actionKey} className="group/action relative inline-flex">
              <button
                type="button"
                aria-label={action.ariaLabel ?? action.label}
                title={tooltipLabel}
                disabled={action.disabled}
                onClick={() => handleActionClick(action)}
                className={joinClasses(
                  "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border bg-input-bg text-small transition disabled:cursor-not-allowed disabled:opacity-50",
                  getActionStyle(action) ||
                    "border-text-secondary/20 text-text-secondary hover:border-text-primary hover:text-text-primary",
                  action.className,
                )}
              >
                {icon}
              </button>
              <ActionTooltip label={tooltipLabel} />
            </span>
          );
        })}
      </div>

      <ConfirmationDialog
        open={Boolean(confirmation)}
        title={confirmationCopy?.title}
        description={confirmationCopy?.description}
        confirmLabel={confirmationCopy?.confirmLabel}
        reasonLabel={confirmationCopy?.reasonLabel}
        reasonPlaceholder="Type the reason"
        requireReason={
          confirmation ? actionNeedsReason(confirmation.action) : false
        }
        tone={confirmation ? getActionTone(confirmation.action) : "primary"}
        onClose={() => setConfirmation(null)}
        onConfirm={(details) => {
          if (confirmation) {
            runAction(confirmation.action, confirmation.row, details);
          }
          setConfirmation(null);
        }}
      />
    </>
  );
}

function getPageNumbers(currentPage, totalPages) {
  const pageNumbers = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 2
    ) {
      pageNumbers.push(page);
    } else if (pageNumbers[pageNumbers.length - 1] !== "ellipsis") {
      pageNumbers.push("ellipsis");
    }
  }

  return pageNumbers;
}

function Pagination({ pagination }) {
  if (!pagination) {
    return null;
  }

  const page = resolvePaginationPage(pagination);
  const pageSize = resolvePaginationPageSize(pagination);
  const total = getPositiveNumber(pagination.totalDocs ?? pagination.total, 0);
  const from = pagination.from ?? (total === 0 ? 0 : (page - 1) * pageSize + 1);
  const to = pagination.to ?? Math.min(page * pageSize, total);
  const totalPages = getPositiveNumber(
    pagination.totalPages,
    Math.max(1, Math.ceil(total / pageSize)),
  );
  const pageNumbers = getPageNumbers(page, totalPages);
  const canPrevious = page > 1;
  const canNext = page < totalPages;
  const pageSizeOptions = Array.from(
    new Set([...(pagination.pageSizeOptions ?? [10, 20, 50]), pageSize]),
  ).map((option) => ({
    label: String(option),
    value: option,
  }));
  const onPageSizeChange = pagination.onPageSizeChange;

  return (
    <div className="flex flex-col gap-3 border-t border-input-border/40 px-5 py-4 text-small text-text-secondary sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {typeof onPageSizeChange === "function" ? (
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Dropdown
              value={pageSize}
              options={pageSizeOptions}
              onChange={(_value, option) =>
                onPageSizeChange(Number(option.value))
              }
              className="w-12"
              triggerClassName="h-auto min-h-0 rounded-full bg-transparent px-3 py-1.5 text-small"
              menuClassName="z-[120]"
              optionClassName="text-small"
            />
          </div>
        ) : null}
        <p>
          {from}-{to} of {total}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canPrevious}
          onClick={() => pagination.onPageChange?.(1)}
          className="rounded-full border border-input-border bg-transparent px-3 py-1.5 text-small text-theme-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          First
        </button>
        <button
          type="button"
          disabled={!canPrevious}
          onClick={() => pagination.onPageChange?.(page - 1)}
          className="rounded-full border border-input-border bg-transparent px-3 py-1.5 text-small text-theme-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-small text-text-secondary"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              disabled={pageNumber === page}
              onClick={() => pagination.onPageChange?.(pageNumber)}
              className={`rounded-full px-3 py-1.5 text-small transition disabled:cursor-default ${
                pageNumber === page
                  ? "bg-text-primary text-white"
                  : "border border-input-border bg-transparent text-theme-text hover:border-text-secondary"
              }`}
            >
              {pageNumber}
            </button>
          ),
        )}
        <span className="rounded-full bg-input-bg px-3 py-1.5 text-small text-theme-text">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => pagination.onPageChange?.(page + 1)}
          className="rounded-full border border-input-border bg-transparent px-3 py-1.5 text-small text-theme-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => pagination.onPageChange?.(totalPages)}
          className="rounded-full border border-input-border bg-transparent px-3 py-1.5 text-small text-theme-text transition hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  );
}

export { Pagination };

export default function Table({
  title,
  description,
  thead,
  tdata,
  columns = thead ?? [],
  data = tdata ?? [],
  rowKey = "id",
  searchValue = "",
  searchPlaceholder = "",
  onSearchChange,
  showSearch = true,
  filters = [],
  filterValues = {},
  onFilterChange,
  onFiltersReset,
  filterActions,
  filterTitle,
  filterDescription,
  filterClassName = "",
  filterGridClassName = "",
  actions,
  onAction,
  onRowClick,
  pagination,
  loading = false,
  skeletonRows,
  emptyTitle = "No data found",
  emptyMessage = "There are no records available at the moment. New entries will appear here once data is available.",
  className = "",
  tableClassName = "",
}) {
  const hasFilters = Array.isArray(filters) && filters.length > 0;
  const showTitle = title || description;
  const showFilters = showSearch || hasFilters;
  const showHeader = showTitle || showFilters;
  const tableColumns = getTableColumns(columns, pagination);
  const skeletonRowCount =
    skeletonRows ?? Math.min(resolvePaginationPageSize(pagination), 10);
  const tableFilters = searchPlaceholder
    ? filters.map((filter) =>
        String(filter?.type || "").toLowerCase() === "search"
          ? { ...filter, placeholder: searchPlaceholder }
          : filter,
      )
    : filters;

  return (
    <div className={joinClasses("w-full space-y-4", className)}>
      <section className="w-full overflow-visible rounded-rounded border border-input-border/40 bg-card-bg">
        {showHeader && (
          <div className="relative z-50 flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
            {showTitle ? (
              <div className="min-w-0 space-y-1">
                {title && (
                  <h2 className="text-lg capitalize font-semibold text-theme-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
            ) : null}

            {showFilters && (
              <div className="flex min-w-0 w-full justify-start lg:w-auto lg:justify-end">
                {hasFilters ? (
                  <TableFilters
                    title={filterTitle}
                    description={filterDescription}
                    filters={tableFilters}
                    values={filterValues}
                    onChange={onFilterChange}
                    onReset={onFiltersReset}
                    actions={filterActions}
                    className={joinClasses("w-full lg:w-auto", filterClassName)}
                    gridClassName={joinClasses(
                      "lg:justify-end",
                      filterGridClassName,
                    )}
                  />
                ) : showSearch ? (
                  <Input
                    type="search"
                    value={searchValue}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder={searchPlaceholder}
                    beforeIcon={<Search className="h-3.5 w-3.5" />}
                    className="w-full sm:w-64"
                    inputClassName="!h-auto px-3 py-2 pl-8 text-small"
                  />
                ) : null}
              </div>
            )}
            </div>
        )}

      <div className="overflow-x-auto px-5 pb-4">
        <table
          className={joinClasses(
            "w-full min-w-[760px] border-collapse",
            tableClassName,
          )}
        >
          <thead>
            <tr className="border-b border-input-border/40">
              {tableColumns.map((column) => {
                const columnType = getColumnType(column);

                return (
                  <th
                    key={getColumnKey(column)}
                    className={joinClasses(
                      "px-3 py-4 text-left text-mid font-semibold text-text-secondary",
                      columnType === "actions" &&
                        "sticky right-0 z-20 bg-card-bg after:absolute after:inset-y-0 after:-right-5 after:w-5 after:bg-card-bg after:content-['']",
                      typeof column === "object" && column.headClassName,
                    )}
                  >
                    {getColumnHeader(column)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows
                columns={tableColumns}
                rowCount={skeletonRowCount}
              />
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={joinClasses(
                    "group transition",
                    onRowClick && "cursor-pointer hover:bg-input-bg/40",
                  )}
                >
                  {tableColumns.map((column, columnIndex) => {
                    const columnKey = getColumnKey(column);
                    const columnType = getColumnType(column);
                    const value = getCellValue(row, column, rowIndex);

                    return (
                      <td
                        key={columnKey}
                        className={joinClasses(
                          "px-3 py-5 text-mid font-normal",
                          columnIndex === 0
                            ? "text-text-secondary"
                            : "text-theme-text",
                          columnType === "actions" &&
                            "sticky right-0 z-30 bg-card-bg after:absolute after:inset-y-0 after:-right-5 after:w-5 after:bg-card-bg after:content-[''] group-hover:bg-input-bg group-hover:after:bg-input-bg",
                          typeof column === "object" && column.cellClassName,
                        )}
                      >
                        {columnType === "status" ? (
                          <StatusBadge value={value} />
                        ) : null}
                        {columnType === "actions" ? (
                          <TableActions
                            row={row}
                            actions={actions}
                            onAction={onAction}
                          />
                        ) : null}
                        {columnType !== "status" && columnType !== "actions"
                          ? value
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-input-border bg-input-bg">
                      <Database className="h-8 w-8 text-text-secondary" />
                    </div>

                    <h3 className="text-mid font-semibold text-theme-text">
                      {emptyTitle}
                    </h3>

                    <p className="mt-2 max-w-sm text-center text-small text-text-secondary">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination pagination={pagination} />}
      </section>
    </div>
  );
}
