/**
 * Assessment Dashboard Configuration
 * Static configurations for colors, dimensions, and other constants
 */
import { colors } from "./theme";

// Stage name mapping for different naming conventions
const STAGE_NAME_MAP: Record<string, string> = {
  "Honeymoon": "honeymoon",
  "Self-Introspection": "selfReflection",
  "Self-Reflection": "selfReflection",
  "Soul-Searching": "soulSearching",
  "Steady-State": "steadyState",
  "Steady State": "steadyState",
};

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
 * Assessment Type to Dimension Mapping
 * Centralized mapping for assessment types to their dimension values
 */
export const ASSESSMENT_TYPE_DIMENSIONS: Record<string, string> = {
  "Employee Self Assessment": "1D",
  "Manager Relationship Assessment": "2D",
  "Department Assessment": "3D",
  "Company Assessment": "4D",
};

/**
 * Get dimension value for an assessment type
 * @param assessmentType - The assessment type name
 * @returns Dimension string (e.g., "2D", "3D")
 */
export const getDimensionFromAssessmentType = (assessmentType: string): string => {
  return ASSESSMENT_TYPE_DIMENSIONS[assessmentType] || "2D";
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
    from: colors.stages.honeymoon.light,
    to: "#FFE5B4",
    accent: colors.stages.honeymoon.dark,
  },
  "Self-Introspection": {
    from: colors.stages.selfReflection.light,
    to: "#C9C5E8",
    accent: colors.stages.selfReflection.dark,
  },
  "Soul-Searching": {
    from: colors.stages.soulSearching.light,
    to: "#FFC4B8",
    accent: colors.stages.soulSearching.dark,
  },
  "Steady-State": {
    from: colors.stages.steadyState.light,
    to: "#B8E8E3",
    accent: colors.stages.steadyState.dark,
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
 * Get pie chart color for a stage (uses centralized theme colors)
 */
export const getStagePieColor = (stage: string): string => {
  // First check the mapping
  const mappedKey = STAGE_NAME_MAP[stage];
  if (mappedKey) {
    switch (mappedKey) {
      case "honeymoon":
        return colors.stages.honeymoon.main;
      case "selfReflection":
        return colors.stages.selfReflection.main;
      case "soulSearching":
        return colors.stages.soulSearching.main;
      case "steadyState":
        return colors.stages.steadyState.main;
    }
  }
  
  // Fallback: normalize the stage name
  const normalized = stage.toLowerCase().replace(/[-\s]/g, "");
  
  switch (normalized) {
    case "honeymoon":
      return colors.stages.honeymoon.main;
    case "selfreflection":
    case "selfintrospection":
      return colors.stages.selfReflection.main;
    case "soulsearching":
      return colors.stages.soulSearching.main;
    case "steadystate":
      return colors.stages.steadyState.main;
    default:
      console.warn(`Unknown stage name: "${stage}". Using default color.`);
      return "#CBD5F5";
  }
};

/**
 * Get stage color with shade variant
 */
export const getStageColor = (
  stage: string,
  shade: "main" | "light" | "dark" = "main"
): string => {
  // First check the mapping
  const mappedKey = STAGE_NAME_MAP[stage];
  if (mappedKey) {
    switch (mappedKey) {
      case "honeymoon":
        return colors.stages.honeymoon[shade];
      case "selfReflection":
        return colors.stages.selfReflection[shade];
      case "soulSearching":
        return colors.stages.soulSearching[shade];
      case "steadyState":
        return colors.stages.steadyState[shade];
    }
  }
  
  // Fallback: normalize the stage name
  const normalized = stage.toLowerCase().replace(/[-\s]/g, "");
  
  switch (normalized) {
    case "honeymoon":
      return colors.stages.honeymoon[shade];
    case "selfreflection":
    case "selfintrospection":
      return colors.stages.selfReflection[shade];
    case "soulsearching":
      return colors.stages.soulSearching[shade];
    case "steadystate":
      return colors.stages.steadyState[shade];
    default:
      console.warn(`Unknown stage name: "${stage}". Using default color.`);
      return "#CBD5F5";
  }
};

/**
 * Get stage gradient colors
 */
export const getStageGradient = (
  stage: string,
  type: "linear" | "radial" = "linear"
): string => {
  const main = getStageColor(stage, "main");
  const dark = getStageColor(stage, "dark");
  
  if (type === "radial") {
    return `radial-gradient(circle, ${main}, ${dark})`;
  }
  return `linear-gradient(135deg, ${main}, ${dark})`;
};
