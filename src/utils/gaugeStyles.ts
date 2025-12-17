/**
 * Gauge Styles and Utilities
 * Centralized styles, constants, and helper functions for gauge components
 */

// Response Levels Configuration
export const RESPONSE_LEVELS = [
  { label: "Strongly Disagree", threshold: [0, 1], color: "#ef4444" },
  { label: "Disagree", threshold: [1, 2], color: "#f97316" },
  { label: "Neutral", threshold: [2, 3], color: "#f59e0b" },
  { label: "Agree", threshold: [3, 4], color: "#3b82f6" },
  { label: "Strongly Agree", threshold: [4, 5], color: "#10b981" },
] as const;

// Gauge Color Thresholds
export const GAUGE_COLORS = {
  low: "#ef4444",
  medium: "#f59e0b",
  high: "#3b82f6",
  excellent: "#10b981",
} as const;

// Gas Pump SVG Paths
export const HOSE_PATH =
  "M 0 280 L 0 260 Q 0 240, 10 230 Q 20 220, 20 200 Q 20 160, 24 120 Q 28 80, 35 65 Q 42 50, 50 45 Q 58 40, 60 35 Q 62 30, 62 50";

export const HOSE_RIBS = [
  280, 270, 260, 250, 240, 220, 200, 180, 160, 140, 120, 100, 80, 65, 50, 45,
  40, 35, 30,
] as const;

// Shadow Definitions
export const GAUGE_SHADOWS = {
  pumpBody:
    "inset 0 0 30px rgba(0,0,0,0.6), inset -8px 0 20px rgba(0,0,0,0.4), inset 8px 0 20px rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15)",
  screen: (color: string) =>
    `inset 0 0 20px rgba(0,0,0,0.8), 0 0 12px ${color}20, 0 2px 4px rgba(0,0,0,0.3)`,
  gaugeArea: "inset 0 0 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.5)",
  fuelFill: (color: string) =>
    `inset 0 -20px 30px rgba(0,0,0,0.4), inset 0 10px 20px rgba(255,255,255,0.1), 0 0 20px ${color}40`,
  tempStrip:
    "inset 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 4px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(0,0,0,0.05)",
  tempFill: (color: string) => `inset 0 1px 3px ${color}40, 0 0 8px ${color}30`,
  indicator: (color: string) => `0 0 8px ${color}60, 0 2px 4px rgba(0,0,0,0.2)`,
} as const;

export const CARD_SHADOWS = {
  default: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
  hover: "0 3px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
  selected: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)",
} as const;

export const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

// Helper Functions
export const getGaugeColor = (value: number): string => {
  if (value < 2) return GAUGE_COLORS.low;
  if (value < 3) return GAUGE_COLORS.medium;
  if (value < 4) return GAUGE_COLORS.high;
  return GAUGE_COLORS.excellent;
};

export const getActiveLevel = (value: number) => {
  return (
    RESPONSE_LEVELS.find(
      (level) =>
        value >= level.threshold[0] &&
        (value < level.threshold[1] || (value === 5 && level.threshold[1] === 5))
    ) || RESPONSE_LEVELS[RESPONSE_LEVELS.length - 1]
  );
};

export const calculateHoseRibPosition = (t: number) => {
  if (t >= 260) return { x: 0, y: t };
  if (t >= 240) {
    const progress = (260 - t) / 20;
    return { x: 0 + progress * 10, y: 260 - progress * 30 };
  }
  if (t >= 200) {
    const progress = (240 - t) / 40;
    return { x: 10 + progress * 10, y: 230 - progress * 30 };
  }
  if (t >= 120) {
    const progress = (200 - t) / 80;
    return { x: 20, y: 200 - progress * 80 };
  }
  if (t >= 65) {
    const progress = (120 - t) / 55;
    return { x: 20 + progress * 15, y: 120 - progress * 55 };
  }
  if (t >= 45) {
    const progress = (65 - t) / 20;
    return { x: 35 + progress * 25, y: 65 - progress * 20 };
  }
  if (t >= 30) {
    const progress = (45 - t) / 15;
    return { x: 60, y: 45 - progress * 15 };
  }
  return { x: 62, y: 50 };
};
