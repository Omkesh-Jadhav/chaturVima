/**
 * Gauge Styles
 * Centralized shadow and style definitions for gauge components
 */

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
