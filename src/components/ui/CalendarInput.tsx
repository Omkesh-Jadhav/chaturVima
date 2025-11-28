import { useMemo, useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CalendarInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  error?: string;
}

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

const weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const buildCalendarMatrix = (viewDate: Date): DayCell[] => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - offset + 1;

    if (dayNumber <= 0) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays + dayNumber),
        inCurrentMonth: false,
      });
    } else if (dayNumber > daysInMonth) {
      cells.push({
        date: new Date(year, month + 1, dayNumber - daysInMonth),
        inCurrentMonth: false,
      });
    } else {
      cells.push({
        date: new Date(year, month, dayNumber),
        inCurrentMonth: true,
      });
    }
  }

  return cells;
};

const formatDisplayDate = (value?: string) => {
  if (!value) return "";
  const date = parseLocalDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const CalendarInput = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className,
  disabled,
  min,
  max,
  error,
}: CalendarInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? parseLocalDate(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const selectedISO = value;
  const calendarDays = useMemo(() => buildCalendarMatrix(viewDate), [viewDate]);
  const yearRange = useMemo(() => {
    const currentYear = viewDate.getFullYear();
    let start = min ? parseLocalDate(min).getFullYear() : currentYear - 50;
    let end = max ? parseLocalDate(max).getFullYear() : currentYear + 50;
    if (currentYear < start) start = currentYear;
    if (currentYear > end) end = currentYear;
    return { start, end };
  }, [min, max, viewDate]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = yearRange.start; y <= yearRange.end; y += 1) {
      years.push(y);
    }
    return years;
  }, [yearRange]);

  useEffect(() => {
    if (value) {
      const parsed = parseLocalDate(value);
      if (!Number.isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setMonthPickerOpen(false);
        setYearPickerOpen(false);
      }
    };
    if (isOpen || monthPickerOpen || yearPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, monthPickerOpen, yearPickerOpen]);

  const handleSelect = (date: Date) => {
    if (disabled) return;
    const iso = toLocalISO(date);
    if (min && iso < min) return;
    if (max && iso > max) return;
    onChange?.(iso);
    setIsOpen(false);
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  };

  const isSameDay = (iso?: string, date?: Date) => {
    if (!iso || !date) return false;
    return iso === toLocalISO(date);
  };

  const canNavigateMonth = (direction: "prev" | "next") => {
    if (!min && !max) return true;
    const tentative =
      direction === "prev"
        ? new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
        : new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    const monthISOStart = toLocalISO(tentative);
    const monthISOEnd = toLocalISO(
      new Date(tentative.getFullYear(), tentative.getMonth() + 1, 0)
    );
    if (direction === "prev" && min && monthISOEnd < min) return false;
    if (direction === "next" && max && monthISOStart > max) return false;
    return true;
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 transition focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20",
          disabled && "cursor-not-allowed opacity-60",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100"
        )}
      >
        <span className="flex items-center gap-2 text-left">
          <Calendar className="h-4 w-4 text-gray-400" />
          {selectedISO ? (
            <span>{formatDisplayDate(selectedISO)}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {error && (
        <p className="text-xs font-semibold text-red-500" role="alert">
          {error}
        </p>
      )}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-[260px] rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                canNavigateMonth("prev") &&
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              disabled={!canNavigateMonth("prev")}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <div className="relative" ref={monthPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setYearPickerOpen(false);
                    setMonthPickerOpen((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 shadow-sm transition hover:border-gray-300"
                >
                  {monthLabels[viewDate.getMonth()].slice(0, 3)}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                {monthPickerOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-24 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                    {monthLabels.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setViewDate(
                            new Date(viewDate.getFullYear(), index, 1)
                          );
                          setMonthPickerOpen(false);
                        }}
                        className={cn(
                          "w-full rounded-md px-2 py-1 text-left text-xs font-medium transition",
                          index === viewDate.getMonth()
                            ? "bg-brand-teal/10 text-brand-teal"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={yearPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMonthPickerOpen(false);
                    setYearPickerOpen((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 shadow-sm transition hover:border-gray-300"
                >
                  {viewDate.getFullYear()}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                {yearPickerOpen && (
                  <div className="absolute right-0 z-10 mt-1 max-h-44 w-28 overflow-y-auto rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setViewDate(new Date(year, viewDate.getMonth(), 1));
                          setYearPickerOpen(false);
                        }}
                        className={cn(
                          "w-full rounded-md px-2 py-1 text-left text-xs font-medium transition",
                          year === viewDate.getFullYear()
                            ? "bg-brand-teal/10 text-brand-teal"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                canNavigateMonth("next") &&
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              disabled={!canNavigateMonth("next")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {weekdayLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-0.5 text-center text-[11px]">
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const iso = toLocalISO(date);
              const isSelected = isSameDay(selectedISO, date);
              const isToday =
                iso === toLocalISO(new Date()) && inCurrentMonth && !isSelected;
              const isDisabled =
                (min && iso < min) || (max && iso > max) || disabled;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    "h-6 w-full rounded-full text-[11px] font-semibold transition",
                    inCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400 hover:text-gray-600",
                    isSelected &&
                      "bg-linear-to-r from-brand-teal to-brand-navy text-white shadow-sm",
                    !isSelected &&
                      !isDisabled &&
                      "hover:bg-gray-100 hover:text-gray-900",
                    isDisabled && "cursor-not-allowed opacity-40",
                    isToday && "border border-brand-teal/50"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-brand-teal">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleSelect(today);
                setViewDate(today);
              }}
              className="rounded-full px-2 py-1 hover:bg-brand-teal/10"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="rounded-full px-2 py-1 text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
