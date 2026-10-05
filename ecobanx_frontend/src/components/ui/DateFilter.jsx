"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getMonthStart(value) {
  const parsed = value instanceof Date ? value : parseDateValue(value);
  const base = parsed || new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function shiftDays(date, count) {
  const shifted = new Date(date);
  shifted.setDate(date.getDate() + count);
  return shifted;
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
  if (!fromValue || !toValue) return false;
  const rangeStart = fromValue <= toValue ? fromValue : toValue;
  const rangeEnd = fromValue <= toValue ? toValue : fromValue;
  return dateValue > rangeStart && dateValue < rangeEnd;
}

function getDatePresets() {
  const today = new Date();
  const todayValue = formatDateValue(today);
  const monthStartValue = formatDateValue(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  return [
    { label: "Today", value: "today", from: todayValue, to: todayValue },
    {
      label: "Yesterday",
      value: "yesterday",
      from: formatDateValue(shiftDays(today, -1)),
      to: formatDateValue(shiftDays(today, -1)),
    },
    {
      label: "Last 7 Days",
      value: "last7days",
      from: formatDateValue(shiftDays(today, -6)),
      to: todayValue,
    },
    {
      label: "Last 30 Days",
      value: "last30days",
      from: formatDateValue(shiftDays(today, -29)),
      to: todayValue,
    },
    {
      label: "This Month",
      value: "thismonth",
      from: monthStartValue,
      to: todayValue,
    },
  ];
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
    <div className="rounded-xl border border-input-border/60 bg-input-bg/40 p-2.5">
      <div className="mb-2 flex h-9 items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`${label} previous month`}
          onClick={onPrevious}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border text-secondary-text transition hover:border-theme-text hover:text-theme-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-medium text-secondary-text">{label}</p>
          <p className="truncate text-sm font-semibold text-theme-text">
            {getMonthTitle(monthDate)}
          </p>
        </div>
        <button
          type="button"
          aria-label={`${label} next month`}
          onClick={onNext}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border text-secondary-text transition hover:border-theme-text hover:text-theme-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekDays.map((day) => (
          <span key={day} className="py-1 text-[11px] font-medium text-secondary-text">
            {day}
          </span>
        ))}
        {calendarDays.map((date) => {
          const dateValue = formatDateValue(date);
          const outsideMonth = date.getMonth() !== month;
          const selected = dateValue === selectedValue;
          const inRange = isDateInRange(dateValue, fromValue, toValue);
          const disabled = Boolean(
            (min && dateValue < min) || (max && dateValue > max),
          );
          return (
            <span key={dateValue} className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(dateValue)}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs transition disabled:cursor-not-allowed disabled:opacity-30 ${
                  selected
                    ? "bg-primary text-white shadow-sm"
                    : inRange
                      ? "bg-primary/15 text-primary-text"
                      : outsideMonth
                        ? "text-secondary-text hover:bg-secondary-bg"
                        : "text-theme-text hover:bg-secondary-bg"
                }`}
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

export default function DateFilter({
  placeholder = "Select Date",
  value,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [fromVisibleMonth, setFromVisibleMonth] = useState(() =>
    getMonthStart(),
  );
  const [toVisibleMonth, setToVisibleMonth] = useState(() => getMonthStart());
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);

  // Stay in sync when the parent sets/clears the range (e.g. Reset filters).
  useEffect(() => {
    setDraftFrom(value?.from || "");
    setDraftTo(value?.to || "");
    setActivePreset(value?.preset || "");
  }, [value?.from, value?.to, value?.preset]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(560, window.innerWidth - 32);
    const padding = 16;
    let left = 0;
    if (rect.left + dropdownWidth > window.innerWidth - padding) {
      left = window.innerWidth - padding - rect.left - dropdownWidth;
    }
    if (rect.left + left < padding) {
      left = padding - rect.left;
    }
    setDropdownStyle({ left: `${left}px` });
    setFromVisibleMonth(getMonthStart(draftFrom || draftTo));
    setToVisibleMonth(getMonthStart(draftTo || draftFrom));
    setOpen(true);
  };

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.value);
    setDraftFrom(preset.from);
    setDraftTo(preset.to);
    setFromVisibleMonth(getMonthStart(preset.from));
    setToVisibleMonth(getMonthStart(preset.to));
  };

  const handleApply = () => {
    if (onChange) {
      onChange({ from: draftFrom, to: draftTo, preset: activePreset });
    }
    setOpen(false);
  };

  const handleReset = () => {
    setDraftFrom("");
    setDraftTo("");
    setActivePreset("");
    if (onChange) {
      onChange({ from: "", to: "", preset: "" });
    }
    setOpen(false);
  };

  const displayText =
    draftFrom && draftTo
      ? `${formatDisplayDate(draftFrom)} - ${formatDisplayDate(draftTo)}`
      : draftFrom
        ? `From ${formatDisplayDate(draftFrom)}`
        : draftTo
          ? `To ${formatDisplayDate(draftTo)}`
          : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            handleOpen();
          }
        }}
        className={`flex h-11 items-center justify-between gap-3 rounded-full border border-input-border bg-input-bg px-4 text-sm text-theme-text transition-all hover:bg-secondary-bg focus:border-theme-text focus:outline-none ${open ? "border-theme-text" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-secondary-text" />
          <span className="font-medium truncate max-w-[200px]">
            {displayText}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-secondary-text transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+10px)] z-[300] flex w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-input-border bg-primary-bg shadow-[0_22px_52px_rgba(0,0,0,0.22)]"
          style={dropdownStyle}
        >
          <div className="p-4 space-y-4 bg-secondary-bg/30">
            <div className="flex flex-wrap gap-2">
              {getDatePresets().map((preset) => {
                const isActive =
                  activePreset === preset.value &&
                  draftFrom === preset.from &&
                  draftTo === preset.to;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-input-border bg-input-bg text-secondary-text hover:border-primary/45 hover:text-primary-text"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DateRangeCalendar
                label="From date"
                monthDate={fromVisibleMonth}
                selectedValue={draftFrom}
                fromValue={draftFrom}
                toValue={draftTo}
                max={draftTo || undefined}
                onSelect={(next) => {
                  setDraftFrom(next);
                  setActivePreset("");
                }}
                onPrevious={() =>
                  setFromVisibleMonth((current) => addMonths(current, -1))
                }
                onNext={() =>
                  setFromVisibleMonth((current) => addMonths(current, 1))
                }
              />
              <DateRangeCalendar
                label="To date"
                monthDate={toVisibleMonth}
                selectedValue={draftTo}
                fromValue={draftFrom}
                toValue={draftTo}
                min={draftFrom || undefined}
                onSelect={(next) => {
                  setDraftTo(next);
                  setActivePreset("");
                }}
                onPrevious={() =>
                  setToVisibleMonth((current) => addMonths(current, -1))
                }
                onNext={() =>
                  setToVisibleMonth((current) => addMonths(current, 1))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary/45 hover:text-primary-text"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
