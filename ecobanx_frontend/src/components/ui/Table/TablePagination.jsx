"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Dropdown from "../dropdown";

function buildPageRange(page, totalPages) {
  if (!totalPages || totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const range = [];

  for (const value of pages) {
    if (value > 1 && value < totalPages) {
      range.push(value);
    }
  }

  range.sort((left, right) => left - right);

  const items = [1];
  let previous = 1;

  for (const value of range) {
    if (value - previous > 1) {
      items.push("...");
    }

    if (value !== 1 && value !== totalPages) {
      items.push(value);
    }

    previous = value;
  }

  if (previous < totalPages - 1) {
    items.push("...");
  }

  if (totalPages !== 1) {
    items.push(totalPages);
  }

  return items;
}

function PageButton({ children, active, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-input-border px-2 text-xs font-semibold transition focus:outline-none focus:ring-1 focus:ring-theme-text disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? " bg-secondary-text/70 text-white"
          : " text-secondary-text hover:border-primary-text hover:text-primary-text"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function TablePagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onPrevious,
  onNext,
  pageSizeOptions = [10, 20, 50, 100],
  pages,
  summary,
  className = "",
}) {
  const pageCount = Math.max(1, Number(totalPages) || 1);
  const currentPage = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const resolvedPageSize = Number(pageSize) || 10;
  const pageItems = pages ?? buildPageRange(currentPage, pageCount);
  const resolvedPageSizeOptions = Array.from(
    new Set([resolvedPageSize, ...pageSizeOptions]),
  ).sort((left, right) => left - right);
  const pageSizeDropdownOptions = resolvedPageSizeOptions.map((option) => ({
    label: String(option),
    value: option,
  }));
  const selectedPageSizeOption =
    pageSizeDropdownOptions.find((option) => option.value === resolvedPageSize) ??
    pageSizeDropdownOptions[0] ??
    null;

  const start =
    totalItems && resolvedPageSize
      ? (currentPage - 1) * resolvedPageSize + 1
      : null;
  const end =
    totalItems && resolvedPageSize
      ? Math.min(currentPage * resolvedPageSize, totalItems)
      : null;
  const summaryLabel =
    summary ??
    (totalItems && resolvedPageSize
      ? `Showing ${start}-${end} of ${totalItems} entries`
      : null);

  const handlePageChange = (nextPage) => {
    onPageChange?.(nextPage);
  };

  return (
    <div
      className={`mt-5 flex flex-col gap-3 border-t border-input-border pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {summaryLabel ? (
          <p className="text-xs text-secondary-text">{summaryLabel}</p>
        ) : null}

        {typeof onPageSizeChange === "function" ? (
          <div className="flex items-center gap-2 text-xs text-secondary-text">
            <span>Rows per page</span>
            <Dropdown
              options={pageSizeDropdownOptions}
              value={selectedPageSizeOption}
              onChange={(option) => onPageSizeChange(Number(option.value))}
              searchable={false}
              className="w-24"
              triggerClassName="h-9 gap-3 px-3 text-xs"
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PageButton
          ariaLabel="First page"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(1)}
        >
          <ChevronsLeft size={14} />
        </PageButton>

        <PageButton
          ariaLabel="Previous page"
          disabled={currentPage <= 1}
          onClick={() =>
            onPrevious ? onPrevious() : handlePageChange(currentPage - 1)
          }
        >
          <ChevronLeft size={14} />
        </PageButton>

        {pageItems.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-input-border px-2 text-xs font-semibold text-secondary-text"
            >
              ...
            </span>
          ) : (
            <PageButton
              key={item}
              active={item === currentPage}
              onClick={() => handlePageChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton
          ariaLabel="Next page"
          disabled={currentPage >= pageCount}
          onClick={() =>
            onNext ? onNext() : handlePageChange(currentPage + 1)
          }
        >
          <ChevronRight size={14} />
        </PageButton>

        <PageButton
          ariaLabel="Last page"
          disabled={currentPage >= pageCount}
          onClick={() => handlePageChange(pageCount)}
        >
          <ChevronsRight size={14} />
        </PageButton>
      </div>
    </div>
  );
}
