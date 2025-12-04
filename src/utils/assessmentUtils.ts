/**
 * Assessment Utility Functions
 * Helper functions for assessment calculations and data processing
 */

import type { Priority } from "@/data/assessmentDashboard";
import type { CycleStatus } from "@/types/assessmentCycles";

/**
 * Calculate completion rate based on completed and critical pending assessments
 * @param completedCount - Number of completed assessments
 * @param criticalPendingCount - Number of critical (high priority) pending assessments
 * @returns Completion rate as a percentage (0-100)
 */
export const calculateCompletionRate = (
  completedCount: number,
  criticalPendingCount: number
): number => {
  const totalRelevantAssessments = completedCount + criticalPendingCount;
  if (totalRelevantAssessments === 0) return 0;
  const rate = (completedCount / totalRelevantAssessments) * 100;
  return Math.round(rate);
};

/**
 * Get priority styling classes
 * @param priority - Priority level
 * @returns Tailwind CSS classes for the priority
 */
export const getPriorityStyles = (priority: Priority): string => {
  const styles: Record<Priority, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-green-50 text-green-700 border-green-200",
  };
  return styles[priority];
};

/**
 * Filter assessments by priority
 * @param assessments - Array of assessments with priority
 * @param priority - Priority to filter by, or "All" for no filter
 * @returns Filtered array of assessments
 */
export const filterByPriority = <T extends { priority: Priority }>(
  assessments: T[],
  priority: Priority | "All"
): T[] => {
  if (priority === "All") return assessments;
  return assessments.filter((item) => item.priority === priority);
};

/**
 * Count high priority pending assessments
 * @param assessments - Array of assessments with priority
 * @returns Number of high priority assessments
 */
export const countHighPriority = <T extends { priority: Priority }>(
  assessments: T[]
): number => {
  return assessments.filter((item) => item.priority === "High").length;
};

/**
 * Calculate percentage from a value and maximum
 * @param value - Current value
 * @param max - Maximum value
 * @returns Percentage (0-100)
 */
export const calculatePercentage = (value: number, max: number): number => {
  if (max === 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
};

/**
 * Find the maximum value in an array of objects by key
 * @param items - Array of objects
 * @param key - Key to extract value from
 * @returns Maximum value
 */
export const findMaxByKey = <T>(items: T[], key: keyof T): number => {
  if (items.length === 0) return 0;
  const values = items.map((item) => {
    const value = item[key];
    return typeof value === "number" ? value : 0;
  });
  return Math.max(...values);
};

/**
 * Cycle Status Colors
 * Reusable status color configuration matching CycleTable
 */
export const CYCLE_STATUS_COLORS: Record<
  CycleStatus,
  { bg: string; text: string; border?: string }
> = {
  Active: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  Upcoming: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  Completed: {
    bg: "bg-slate-200",
    text: "text-slate-800",
    border: "border-slate-300",
  },
  Draft: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
};

/**
 * Get cycle status color classes
 * @param status - Cycle status
 * @param includeBorder - Whether to include border class (default: false)
 * @returns Tailwind CSS classes for the status
 */
export const getCycleStatusColor = (
  status: CycleStatus,
  includeBorder = false
): string => {
  const colors = CYCLE_STATUS_COLORS[status];
  return includeBorder
    ? `${colors.bg} ${colors.text} ${colors.border || ""}`
    : `${colors.bg} ${colors.text}`;
};
