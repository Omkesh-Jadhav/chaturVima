/**
 * Assessment Dashboard Configuration
 * Static configurations for colors, dimensions, and other constants
 */

/**
 * Assessment Types for Emotional Intensity Heatmap
 */
export const ASSESSMENT_TYPES = [
  "Employee Self Assessment",
  "Manager Relationship Assessment",
  "Department Assessment",
  "Company Assessment",
] as const;

/**
 * Assessment Type Colors for heatmap
 */
export type AssessmentTypeColors = {
  high: { from: string; to: string };
  medium: { from: string; to: string };
  low: { from: string; to: string };
};

export const ASSESSMENT_TYPE_COLORS: Record<string, AssessmentTypeColors> = {
  "Employee Self Assessment": {
    high: { from: "#3b82f6", to: "#2563eb" },
    medium: { from: "#60a5fa", to: "#3b82f6" },
    low: { from: "#bfdbfe", to: "#93c5fd" },
  },
  "Manager Relationship Assessment": {
    high: { from: "#10b981", to: "#059669" },
    medium: { from: "#34d399", to: "#10b981" },
    low: { from: "#a7f3d0", to: "#6ee7b7" },
  },
  "Department Assessment": {
    high: { from: "#f97316", to: "#ea580c" },
    medium: { from: "#fb923c", to: "#f97316" },
    low: { from: "#fed7aa", to: "#fdba74" },
  },
  "Company Assessment": {
    high: { from: "#a855f7", to: "#9333ea" },
    medium: { from: "#c084fc", to: "#a855f7" },
    low: { from: "#e9d5ff", to: "#ddd6fe" },
  },
};

/**
 * Get assessment type color token based on value
 */
export const getAssessmentTypeColorToken = (
  assessmentType: string,
  value: number
): { from: string; to: string } => {
  const baseColors = ASSESSMENT_TYPE_COLORS[assessmentType];
  if (!baseColors) {
    return { from: "#6b7280", to: "#4b5563" };
  }

  if (value >= 80) return baseColors.high;
  if (value >= 50) return baseColors.medium;
  return baseColors.low;
};

/**
 * Category palette for history table
 */
export type CategoryPalette = {
  from: string;
  to: string;
  accent: string;
};

export const HISTORY_CATEGORY_PALETTE: Record<string, CategoryPalette> = {
  Honeymoon: {
    from: "#d1fae5",
    to: "#a7f3d0",
    accent: "#047857",
  },
  "Self-Introspection": {
    from: "#dbeafe",
    to: "#bfdbfe",
    accent: "#1d4ed8",
  },
  "Soul-Searching": {
    from: "#fee2e2",
    to: "#fecdd3",
    accent: "#b91c1c",
  },
  "Steady-State": {
    from: "#ede9fe",
    to: "#ddd6fe",
    accent: "#6d28d9",
  },
  default: {
    from: "#f1f5f9",
    to: "#e2e8f0",
    accent: "#475569",
  },
};

/**
 * Get category palette, falling back to default if not found
 */
export const getCategoryPalette = (category: string): CategoryPalette => {
  return HISTORY_CATEGORY_PALETTE[category] || HISTORY_CATEGORY_PALETTE.default;
};

/**
 * Dimension colors for emotional intensity heatmap
 */
export type DimensionColors = {
  high: { from: string; to: string };
  medium: { from: string; to: string };
  low: { from: string; to: string };
};

export const DIMENSION_COLORS: Record<string, DimensionColors> = {
  Optimism: {
    high: { from: "#f97316", to: "#ea580c" },
    medium: { from: "#fb923c", to: "#f97316" },
    low: { from: "#fed7aa", to: "#fdba74" },
  },
  Energy: {
    high: { from: "#ec4899", to: "#db2777" },
    medium: { from: "#f472b6", to: "#ec4899" },
    low: { from: "#fbcfe8", to: "#f9a8d4" },
  },
  Realism: {
    high: { from: "#3b82f6", to: "#2563eb" },
    medium: { from: "#60a5fa", to: "#3b82f6" },
    low: { from: "#bfdbfe", to: "#93c5fd" },
  },
  Stability: {
    high: { from: "#10b981", to: "#059669" },
    medium: { from: "#34d399", to: "#10b981" },
    low: { from: "#a7f3d0", to: "#6ee7b7" },
  },
};

/**
 * Get dimension color token based on value
 * @param dimension - Dimension name
 * @param value - Intensity value (0-100)
 * @returns Color token with from/to gradient colors
 */
export const getDimensionColorToken = (
  dimension: string,
  value: number
): { from: string; to: string } => {
  const baseColors = DIMENSION_COLORS[dimension];
  if (!baseColors) {
    return { from: "#6b7280", to: "#4b5563" };
  }

  if (value >= 80) return baseColors.high;
  if (value >= 50) return baseColors.medium;
  return baseColors.low;
};

/**
 * Pie chart color mapping for stage distribution
 */
export const STAGE_PIE_COLORS: Record<string, string> = {
  "Self-Introspection": "#3B82F6",
  "Soul-Searching": "#F59E0B",
  "Steady-State": "#8B5CF6",
  Honeymoon: "#10B981",
};

/**
 * Get pie chart color for a stage
 */
export const getStagePieColor = (stage: string): string => {
  return STAGE_PIE_COLORS[stage] || "#CBD5F5";
};
