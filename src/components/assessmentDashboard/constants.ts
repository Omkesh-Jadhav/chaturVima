/**
 * Assessment Dashboard Constants
 * Static configurations and constants used across dashboard components
 */

import {
  CheckCircle,
  XCircle,
  Lightbulb,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { Priority } from "@/data/assessmentDashboard";
import type { SWOTRating } from "@/utils/swotUtils";
import { getStageColor } from "@/utils/assessmentConfig";

/**
 * SWOT Quadrant Configuration
 */
export const SWOT_CONFIG = {
  Strengths: {
    icon: CheckCircle,
    headerBg: "bg-linear-to-br from-green-500 to-emerald-600",
    itemBg: "bg-green-50/60",
    border: "border-green-200",
    text: "text-green-700",
  },
  Weaknesses: {
    icon: XCircle,
    headerBg: "bg-linear-to-br from-red-500 to-rose-600",
    itemBg: "bg-red-50/60",
    border: "border-red-200",
    text: "text-red-700",
  },
  Opportunities: {
    icon: Lightbulb,
    headerBg: "bg-linear-to-br from-blue-500 to-cyan-600",
    itemBg: "bg-blue-50/60",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  Threats: {
    icon: ShieldAlert,
    headerBg: "bg-linear-to-br from-amber-500 to-orange-600",
    itemBg: "bg-amber-50/60",
    border: "border-amber-200",
    text: "text-amber-700",
  },
} as const;

/**
 * SWOT Rating Colors
 */
export const SWOT_RATING_COLORS: Record<SWOTRating, string> = {
  HIGH: "bg-green-500 text-white",
  MEDIUM: "bg-yellow-500 text-white",
  CRITICAL: "bg-red-600 text-white",
};

/**
 * Status Styles for Emotional Stage Assessment
 */
export const STATUS_STYLES: Record<
  "Dominant" | "Secondary" | "Transitional",
  { bg: string; text: string }
> = {
  Dominant: { bg: "bg-green-50", text: "text-green-700" },
  Secondary: { bg: "bg-blue-50", text: "text-blue-700" },
  Transitional: { bg: "bg-orange-50", text: "text-orange-700" },
};

/**
 * Priority Filter Button Colors
 */
export const PRIORITY_BUTTON_COLORS = {
  All: {
    active: "bg-gray-600 text-white",
    inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  High: {
    active: "bg-red-600 text-white",
    inactive: "bg-red-50 text-red-700 hover:bg-red-100",
  },
  Medium: {
    active: "bg-yellow-500 text-white",
    inactive: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  },
  Low: {
    active: "bg-green-500 text-white",
    inactive: "bg-green-50 text-green-700 hover:bg-green-100",
  },
} as const;

/**
 * Priority Icons
 */
export const PRIORITY_ICONS: Record<Priority, typeof AlertTriangle> = {
  High: AlertTriangle,
  Medium: Clock,
  Low: CheckCircle2,
};

/**
 * Intensity Level Styles
 */
export const INTENSITY_STYLES = {
  high: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
} as const;

/**
 * Animation Delays
 */
export const ANIMATION_DELAYS = {
  stageCard: 0.05,
  subStage: 0.08,
  heatmapRow: 0.05,
  swotQuadrant: 0.1,
  swotItem: 0.05,
  pendingItem: 0.05,
  historyRow: 0.05,
} as const;

/**
 * Pie Chart Gradients Configuration (uses centralized theme colors)
 */
export const PIE_GRADIENTS = [
  {
    id: "gradHoney",
    type: "linearGradient" as const,
    colors: [
      { offset: 0, color: getStageColor("Honeymoon", "main") },
      { offset: 100, color: getStageColor("Honeymoon", "dark") },
    ],
  },
  {
    id: "gradSelf",
    type: "linearGradient" as const,
    colors: [
      { offset: 0, color: getStageColor("Self-Introspection", "main") },
      { offset: 100, color: getStageColor("Self-Introspection", "dark") },
    ],
  },
  {
    id: "gradSoul",
    type: "linearGradient" as const,
    colors: [
      { offset: 0, color: getStageColor("Soul-Searching", "main") },
      { offset: 100, color: getStageColor("Soul-Searching", "dark") },
    ],
  },
  {
    id: "gradSteady",
    type: "linearGradient" as const,
    colors: [
      { offset: 0, color: getStageColor("Steady-State", "main") },
      { offset: 100, color: getStageColor("Steady-State", "dark") },
    ],
  },
];

/**
 * Pie Chart Fill Configuration
 */
export const PIE_FILL = [
  { match: { id: "Honeymoon" }, id: "gradHoney" },
  { match: { id: "Self-Introspection" }, id: "gradSelf" },
  { match: { id: "Soul-Searching" }, id: "gradSoul" },
  { match: { id: "Steady-State" }, id: "gradSteady" },
];

/**
 * Background Animation Colors (uses centralized theme colors)
 */
export const BACKGROUND_COLORS = [
  getStageColor("Honeymoon", "main"),
  getStageColor("Self-Introspection", "main"),
  getStageColor("Soul-Searching", "main"),
] as const;
