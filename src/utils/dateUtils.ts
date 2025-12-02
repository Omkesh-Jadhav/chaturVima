/**
 * Date Utility Functions
 * Helper functions for date formatting and manipulation
 */

/**
 * Format a date string to a human-readable display format
 * @param value - ISO date string or date string
 * @returns Formatted date string like "8 Nov, 2025" or "—" if invalid
 */
export const formatDisplayDate = (value: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

/**
 * Normalize date to start of day for comparison
 * @param date - Date object or date string
 * @returns Date object normalized to start of day
 */
export const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === "string" ? new Date(date) : date;
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if a date is today
 * @param date - Date object or date string
 * @returns True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const normalized = normalizeDate(date);
  const today = normalizeDate(new Date());
  return normalized.getTime() === today.getTime();
};

/**
 * Check if a date is in the past
 * @param date - Date object or date string
 * @returns True if the date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const normalized = normalizeDate(date);
  const today = normalizeDate(new Date());
  return normalized.getTime() < today.getTime();
};

/**
 * Check if a date is in the future
 * @param date - Date object or date string
 * @returns True if the date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const normalized = normalizeDate(date);
  const today = normalizeDate(new Date());
  return normalized.getTime() > today.getTime();
};

/**
 * Get days until a date (negative if past)
 * @param date - Date object or date string
 * @returns Number of days until the date
 */
export const daysUntil = (date: Date | string): number => {
  const normalized = normalizeDate(date);
  const today = normalizeDate(new Date());
  const diffTime = normalized.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
