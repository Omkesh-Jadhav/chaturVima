/**
 * Assessment Utility Functions
 * Helper functions for assessment calculations and data processing
 */

import type { Priority } from "@/data/assessmentDashboard";
import type { CycleStatus } from "@/types/assessmentCycles";

// Cycle Status Colors Configuration
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
 * Calculate completion rate percentage
 */
export const calculateCompletionRate = (
  completedCount: number,
  criticalPendingCount: number
): number => {
  const total = completedCount + criticalPendingCount;
  return total === 0 ? 0 : Math.round((completedCount / total) * 100);
};

/**
 * Calculate percentage from value and maximum
 */
export const calculatePercentage = (value: number, max: number): number => {
  return max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
};

/**
 * Find maximum value in array by key
 */
export const findMaxByKey = <T>(items: T[], key: keyof T): number => {
  if (items.length === 0) return 0;
  return Math.max(
    ...items.map((item) => {
      const value = item[key];
      return typeof value === "number" ? value : 0;
    })
  );
};

/**
 * Filter assessments by priority
 */
export const filterByPriority = <T extends { priority: Priority }>(
  assessments: T[],
  priority: Priority | "All"
): T[] => {
  return priority === "All"
    ? assessments
    : assessments.filter((item) => item.priority === priority);
};

/**
 * Get cycle status color classes
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

/**
 * Sort stages by score/percentage (high to low)
 */
export const sortStagesByScore = <T extends Record<string, unknown>>(
  stages: T[],
  scoreKey: keyof T = "score" as keyof T
): T[] => {
  return [...stages].sort((a, b) => {
    const scoreA = typeof a[scoreKey] === "number" ? a[scoreKey] : 0;
    const scoreB = typeof b[scoreKey] === "number" ? b[scoreKey] : 0;
    return scoreB - scoreA;
  });
};
