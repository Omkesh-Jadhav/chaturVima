/**
 * Assessment Utility Functions
 * Helper functions for assessment calculations and data processing
 */

import type { Priority } from "@/data/assessmentDashboard";

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
