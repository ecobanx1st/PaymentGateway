"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Input from "./Input";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getFilterType(filter) {
  return String(filter?.type || "dropdown").toLowerCase();
}

function getFilterKey(filter) {
  return filter?.key ?? filter?.name;
}

function getFilterPlaceholder(filter, fallback) {
  return filter?.placeholder || fallback;
}

function getFilterOrder(filter) {
  const type = getFilterType(filter);

  if (type === "search") {
    return 0;
  }

  if (
    type === "date" ||
    type === "fromdate" ||
    type === "todate" ||
    type === "daterange" ||
    type === "date-range"
  ) {
    return 2;
  }

  return 1;
}

function getFilterValue(filter, values, fallback = "") {
  const key = getFilterKey(filter);

  if (filter?.value !== undefined) {
    return filter.value;
  }

  if (key && values?.[key] !== undefined) {
    return values[key];
  }

  return filter?.defaultValue ?? fallback;
}

function getDateRangeValue(filter, values, side) {
  const key = side === "from" ? filter.fromKey : filter.toKey;
  const valueKey = side === "from" ? "fromValue" : "toValue";

  if (filter?.[valueKey] !== undefined) {
    return filter[valueKey];
  }

  if (key && values?.[key] !== undefined) {
    return values[key];
  }

  return "";
}

function formatDateLabel(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatCompactDateLabel(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(value) {
  const date = value instanceof Date ? value : parseDateValue(value);
  const baseDate = date || new Date();

  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function shiftDays(date, count) {
  const shifted = new Date(date);
  shifted.setDate(date.getDate() + count);
  return shifted;
}

function getDateRangePresets() {
  const today = new Date();
  const todayValue = formatDateValue(today);
  const monthStartValue = formatDateValue(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  return [
    { label: "Today", from: todayValue, to: todayValue },
    {
      label: "Yesterday",
      from: formatDateValue(shiftDays(today, -1)),
      to: formatDateValue(shiftDays(today, -1)),
    },
    {
      label: "Last 7 Days",
      from: formatDateValue(shiftDays(today, -6)),
      to: todayValue,
    },
    {
      label: "Last 30 Days",
      from: formatDateValue(shiftDays(today, -29)),
      to: todayValue,
    },
    { label: "This Month", from: monthStartValue, to: todayValue },
  ];
}

function getCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const calendarStart = new Date(firstDay);

  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_item, index) => {
    const date = new Date(calendarStart);

    date.setDate(calendarStart.getDate() + index);

    return date;
  });
}

function getMonthTitle(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isDateInRange(dateValue, fromValue, toValue) {
  if (!fromValue || !toValue) {
    return false;
  }

  const rangeStart = fromValue <= toValue ? fromValue : toValue;
  const rangeEnd = fromValue <= toValue ? toValue : fromValue;

  return dateValue > rangeStart && dateValue < rangeEnd;
}

function isDateDisabled(dateValue, min, max) {
  return Boolean((min && dateValue < min) || (max && dateValue > max));
}

function DateRangeCalendar({
  label,
  monthDate,
  selectedValue,
  fromValue,
  toValue,
  min,
  max,
  onSelect,
  onPrevious,
  onNext,
}) {
  const calendarDays = getCalendarDays(monthDate);
  const month = monthDate.getMonth();
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="rounded-[8px] border border-input-border/40 bg-input-bg/30 p-2.5">
      <div className="mb-3 flex h-9 items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`${label} previous month`}
          onClick={onPrevious}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-small font-medium text-text-secondary">{label}</p>
          <p className="truncate text-mid font-semibold text-theme-text">
            {getMonthTitle(monthDate)}
          </p>
        </div>
        <button
          type="button"
          aria-label={`${label} next month`}
          onClick={onNext}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekDays.map((day) => (
          <span key={day} className="py-1 text-[11px] font-medium text-input-text">
            {day}
          </span>
        ))}
        {calendarDays.map((date) => {
          const dateValue = formatDateValue(date);
          const outsideMonth = date.getMonth() !== month;
          const selected = dateValue === selectedValue;
          const inRange = isDateInRange(dateValue, fromValue, toValue);
          const disabled = isDateDisabled(dateValue, min, max);

          return (
            <span key={dateValue} className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(dateValue)}
                className={joinClasses(
                  "grid h-8 w-8 place-items-center rounded-full text-small transition disabled:cursor-not-allowed disabled:opacity-30",
                  selected
                    ? "bg-text-primary text-white shadow-sm"
                    : inRange
                      ? "bg-text-primary/15 text-text-primary"
                      : outsideMonth
                        ? "text-input-text hover:bg-input-bg hover:text-text-secondary"
                        : "text-theme-text hover:bg-input-bg hover:text-text-primary",
                )}
              >
                {date.getDate()}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TableDateRange({ filter, values, onFilterChange }) {
  const fromKey = filter.fromKey || "fromDate";
  const toKey = filter.toKey || "toDate";
  const fromValue = getDateRangeValue({ ...filter, fromKey }, values, "from");
  const toValue = getDateRangeValue({ ...filter, toKey }, values, "to");
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [draftFromValue, setDraftFromValue] = useState(fromValue);
  const [draftToValue, setDraftToValue] = useState(toValue);
  const [fromVisibleMonth, setFromVisibleMonth] = useState(() =>
    getMonthStart(fromValue || toValue),
  );
  const [toVisibleMonth, setToVisibleMonth] = useState(() =>
    getMonthStart(toValue || fromValue),
  );
  const placement = filter.placement || "right";
  const selectedLabel =
    fromValue && toValue
      ? `${formatCompactDateLabel(fromValue)} - ${formatCompactDateLabel(toValue)}`
      : fromValue
        ? `From ${formatCompactDateLabel(fromValue)}`
        : toValue
          ? `To ${formatCompactDateLabel(toValue)}`
          : "";

  useEffect(() => {
    function handlePointerDown(event) {
      if (wrapperRef.current?.contains(event.target)) {
        return;
      }

      if (popoverRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    function updatePopoverOffset() {
      const wrapper = wrapperRef.current;
      const popover = popoverRef.current;

      if (!wrapper || !popover) {
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const popoverWidth = popover.offsetWidth;
      const popoverHeight = popover.offsetHeight;
      const viewportPadding = 16;
      const maxLeft = Math.max(
        window.innerWidth - popoverWidth - viewportPadding,
        viewportPadding,
      );
      const maxTop = Math.max(
        window.innerHeight - popoverHeight - viewportPadding,
        viewportPadding,
      );
      let desiredLeft = wrapperRect.right - popoverWidth;

      if (placement === "left") {
        desiredLeft = wrapperRect.left;
      }

      if (placement === "center") {
        desiredLeft = wrapperRect.left + wrapperRect.width / 2 - popoverWidth / 2;
      }

      const clampedLeft = Math.round(
        Math.min(Math.max(desiredLeft, viewportPadding), maxLeft),
      );
      const spaceBelow = window.innerHeight - wrapperRect.bottom;
      const spaceAbove = wrapperRect.top;
      const requiredSpace = popoverHeight + 8 + viewportPadding;
      // Flip above when there is not enough room below and more room above.
      const shouldPlaceAbove =
        spaceBelow < requiredSpace && spaceAbove > spaceBelow;
      const desiredTop = shouldPlaceAbove
        ? wrapperRect.top - popoverHeight - 8
        : wrapperRect.bottom + 8;
      const clampedTop = Math.round(
        Math.min(Math.max(desiredTop, viewportPadding), maxTop),
      );

      setPopoverPosition((current) => {
        if (
          current &&
          current.left === clampedLeft &&
          current.top === clampedTop
        ) {
          return current;
        }

        return { left: clampedLeft, top: clampedTop };
      });
    }

    updatePopoverOffset();
    window.addEventListener("scroll", updatePopoverOffset, true);
    window.addEventListener("resize", updatePopoverOffset);
    return () => {
      window.removeEventListener("scroll", updatePopoverOffset, true);
      window.removeEventListener("resize", updatePopoverOffset);
    };
  }, [open, placement]);

  function handleRangeReset() {
    setDraftFromValue("");
    setDraftToValue("");
  }

  function handlePresetSelect(preset) {
    setDraftFromValue(preset.from);
    setDraftToValue(preset.to);
    setFromVisibleMonth(getMonthStart(preset.from));
    setToVisibleMonth(getMonthStart(preset.to));
  }

  function handleFromSelect(value) {
    setDraftFromValue(value);
  }

  function handleToSelect(value) {
    setDraftToValue(value);
  }

  function handleApply() {
    if (draftFromValue !== fromValue) {
      filter.onFromChange?.(draftFromValue);
      onFilterChange(fromKey, draftFromValue, filter);
    }

    if (draftToValue !== toValue) {
      filter.onToChange?.(draftToValue);
      onFilterChange(toKey, draftToValue, filter);
    }

    setOpen(false);
  }

  function handleToggleOpen() {
    setOpen((current) => {
      if (!current) {
        setFromVisibleMonth(getMonthStart(fromValue || toValue));
        setToVisibleMonth(getMonthStart(toValue || fromValue));
        setDraftFromValue(fromValue);
        setDraftToValue(toValue);
        setPopoverPosition(null);
      }

      return !current;
    });
  }

  return (
    <div
      ref={wrapperRef}
      className={joinClasses(
        "w-full sm:w-40",
        filter.className,
      )}
    >

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleToggleOpen}
        className={joinClasses(
          "flex h-11 w-full items-center justify-between rounded-full border border-input-border bg-input-bg px-4 text-left text-mid outline-none transition focus:border-text-primary",
          selectedLabel ? "text-theme-text" : "text-input-text",
          filter.triggerClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-text-secondary" />
          <span className="truncate">
            {selectedLabel || getFilterPlaceholder(filter, "Select date range")}
          </span>
        </span>
        <ChevronDown
          className={joinClasses(
            "ml-3 h-4 w-4 shrink-0 text-theme-text transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={filter.label || "Date range"}
            style={{
              left: popoverPosition?.left ?? 0,
              top: popoverPosition?.top ?? 0,
              visibility: popoverPosition ? "visible" : "hidden",
            }}
            className={joinClasses(
              "fixed z-[130] max-h-[calc(100dvh-2rem)] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto rounded-rounded border border-input-border/40 bg-bg-secondary p-3 shadow-2xl shadow-black/30",
              filter.popoverClassName,
            )}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {getDateRangePresets().map((preset) => {
                const isActive =
                  draftFromValue === preset.from &&
                  draftToValue === preset.to;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={joinClasses(
                      "rounded-full border px-3 py-1.5 text-small font-medium transition",
                      isActive
                        ? "border-text-primary bg-text-primary text-white"
                        : "border-input-border text-text-secondary hover:border-text-secondary hover:text-theme-text",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <DateRangeCalendar
                label={filter.fromLabel || "From date"}
                monthDate={fromVisibleMonth}
                selectedValue={draftFromValue}
                fromValue={draftFromValue}
                toValue={draftToValue}
                min={filter.fromMin}
                max={filter.fromMax ?? draftToValue ?? filter.max}
                onSelect={handleFromSelect}
                onPrevious={() => setFromVisibleMonth((current) => addMonths(current, -1))}
                onNext={() => setFromVisibleMonth((current) => addMonths(current, 1))}
              />
              <DateRangeCalendar
                label={filter.toLabel || "To date"}
                monthDate={toVisibleMonth}
                selectedValue={draftToValue}
                fromValue={draftFromValue}
                toValue={draftToValue}
                min={filter.toMin ?? draftFromValue ?? filter.min}
                max={filter.toMax}
                onSelect={handleToSelect}
                onPrevious={() => setToVisibleMonth((current) => addMonths(current, -1))}
                onNext={() => setToVisibleMonth((current) => addMonths(current, 1))}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRangeReset}
                disabled={!draftFromValue && !draftToValue}
                className="text-small font-medium text-text-secondary transition hover:text-theme-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
              <Button
                onClick={handleApply}
                className="h-9 px-4 py-0 text-small"
              >
                Apply
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function TableFilterField({ filter, values, onFilterChange }) {
  const type = getFilterType(filter);
  const key = getFilterKey(filter);

  if (!filter || filter.hidden) {
    return null;
  }

  if (type === "custom" || typeof filter.render === "function") {
    return filter.render?.({
      filter,
      value: getFilterValue(filter, values),
      onChange: (value) => onFilterChange(key, value, filter),
    });
  }

  if (type === "daterange" || type === "date-range") {
    return (
      <TableDateRange
        filter={filter}
        values={values}
        onFilterChange={onFilterChange}
      />
    );
  }

  const multiple =
    filter.multiple ||
    type === "multiselect" ||
    type === "multi-select" ||
    type === "multi-dropdown";
  const value = getFilterValue(filter, values, multiple ? [] : "");

  if (type === "search") {
    return (
      <Input
        type="search"
        id={filter.id}
        labelDescription={filter.labelDescription}
        value={value}
        placeholder={getFilterPlaceholder(filter, "Search")}
        disabled={filter.disabled}
        beforeIcon={filter.beforeIcon ?? <Search className="h-4 w-4" />}
        afterIcon={filter.afterIcon}
        className={joinClasses("w-full sm:w-64", filter.className)}
        labelClassName={filter.labelClassName}
        descriptionClassName={filter.descriptionClassName}
        inputClassName={joinClasses("text-small", filter.inputClassName)}
        onChange={(event) => {
          filter.onChange?.(event.target.value, filter);
          onFilterChange(key, event.target.value, filter);
        }}
      />
    );
  }

  if (type === "date" || type === "fromdate" || type === "todate") {
    return (
      <Input
        type="date"
        id={filter.id}
        labelDescription={filter.labelDescription}
        value={value}
        min={filter.min}
        max={filter.max}
        disabled={filter.disabled}
        beforeIcon={filter.beforeIcon ?? <CalendarDays className="h-4 w-4" />}
        className={joinClasses("w-full sm:w-48", filter.className)}
        labelClassName={filter.labelClassName}
        descriptionClassName={filter.descriptionClassName}
        inputClassName={joinClasses("text-small", filter.inputClassName)}
        onChange={(event) => {
          filter.onChange?.(event.target.value, filter);
          onFilterChange(key, event.target.value, filter);
        }}
      />
    );
  }

  return (
    <Dropdown
      labelDescription={filter.labelDescription}
      options={filter.options || []}
      value={value}
      defaultValue={filter.defaultValue}
      placeholder={filter.placeholder || "Select option"}
      onChange={(nextValue, option) => {
        filter.onChange?.(nextValue, option, filter);
        onFilterChange(key, nextValue, filter);
      }}
      disabled={filter.disabled}
      multiple={multiple}
      inlineLabel={filter.inlineLabel ?? filter.label}
      className={joinClasses("w-full sm:w-48", filter.className)}
      labelClassName={filter.labelClassName}
      descriptionClassName={filter.descriptionClassName}
      triggerClassName={filter.triggerClassName}
      menuClassName={filter.menuClassName}
      optionClassName={filter.optionClassName}
    />
  );
}

export default function TableFilters({
  title,
  description,
  filters = [],
  values = {},
  onChange,
  onReset,
  resetLabel = "Reset",
  actions,
  className = "",
  gridClassName = "",
}) {
  const visibleFilters = filters
    .filter((filter) => !filter?.hidden)
    .map((filter, index) => ({ filter, index }))
    .sort((left, right) => {
      const orderDiff = getFilterOrder(left.filter) - getFilterOrder(right.filter);

      return orderDiff || left.index - right.index;
    })
    .map(({ filter }) => filter);

  if (!visibleFilters.length && !actions && !onReset) {
    return null;
  }

  function handleFilterChange(key, value, filter) {
    if (!key) {
      return;
    }

    onChange?.(key, value, filter);
  }

  return (
    <section
      className={joinClasses("w-full", className)}
    >
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h2 className="text-large font-semibold text-theme-text">{title}</h2>
          )}
          {description && (
            <p className="text-small text-text-secondary">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div
          className={joinClasses(
            "grid w-full gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-end xl:grid-cols-4",
            gridClassName,
          )}
        >
          {visibleFilters.map((filter, index) => {
            const key = getFilterKey(filter) ?? `filter-${index}`;

            return (
              <TableFilterField
                key={key}
                filter={filter}
                values={values}
                onFilterChange={handleFilterChange}
              />
            );
          })}
        </div>

        {(actions || onReset) && (
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {actions}
            {onReset && (
              <Button
                variant="secondary"
                onClick={onReset}
                beforeIcon={<RotateCcw className="h-4 w-4" />}
                className="h-11 px-4 py-0"
              >
                {resetLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
