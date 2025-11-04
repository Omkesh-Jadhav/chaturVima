/**
 * Typography constants for consistent text styling across the application
 */

export const typography = {
  // Page titles
  pageTitle: "text-2xl md:text-3xl font-bold text-gray-900",

  // Section headings
  sectionHeading: "text-lg font-semibold text-gray-900",

  // Subsection headings
  subsectionHeading: "text-base font-medium text-gray-900",

  // Card labels
  cardLabel: "text-sm font-medium text-gray-600",

  // Body text
  body: "text-sm text-gray-700",
  bodyLarge: "text-base text-gray-700",

  // Small text
  small: "text-xs text-gray-500",
  smallMedium: "text-xs font-medium text-gray-500",
} as const;
