/**
 * Common Utility Functions
 * General-purpose utilities for arrays, strings, and common operations
 */

/**
 * Toggle an item in an array (add if not present, remove if present)
 */
export const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
};

/**
 * Check if all items in array are selected
 */
export const areAllSelected = <T,>(items: T[], selected: T[]): boolean => {
  return items.length > 0 && items.every((item) => selected.includes(item));
};

/**
 * Get initials from a full name (first 2 letters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

