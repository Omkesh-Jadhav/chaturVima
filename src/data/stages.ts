/**
 * Stage Configuration - Variant 3B: Cool Blues & Purples
 * Complete configuration for all 4 stages with colors, shapes, and metadata
 * Colors are imported from centralized theme.ts
 */
import type { Stage, StageType, ThemeConfig } from "@/types";
import { colors } from "@/utils/theme";

export const STAGES: Record<StageType, Stage> = {
  honeymoon: {
    id: "honeymoon",
    name: "Honeymoon",
    description:
      "Establishing trust, alignment, and initial performance clarity",
    color: colors.stages.honeymoon,
    shape: "square",
    icon: "■",
  },
  "self-reflection": {
    id: "self-reflection",
    name: "Self-Reflection",
    description: "Identifying strengths, gaps, and opportunities for growth",
    color: colors.stages.selfReflection,
    shape: "triangle",
    icon: "▲",
  },
  "soul-searching": {
    id: "soul-searching",
    name: "Soul-Searching",
    description:
      "Confronting deeper structural, cultural, or leadership challenges",
    color: colors.stages.soulSearching,
    shape: "circle",
    icon: "●",
  },
  "steady-state": {
    id: "steady-state",
    name: "Steady-State",
    description: "Achieving balance, stability, and sustained innovation",
    color: colors.stages.steadyState,
    shape: "diamond",
    icon: "♦",
  },
};

export const THEME_CONFIG: ThemeConfig = {
  variant: "3b",
  stages: STAGES,
  brandColors: {
    navy: "#FF6700",
    teal: "#4160F0",
  },
};

// Helper function to get stage by ID
export const getStage = (stageId: StageType): Stage => {
  return STAGES[stageId];
};

// Helper function to get stage color
export const getStageColor = (
  stageId: StageType,
  shade: "main" | "light" | "dark" = "main"
): string => {
  return STAGES[stageId].color[shade];
};

// Helper function to get stage shape class
export const getStageShapeClass = (stageId: StageType): string => {
  const shapeMap = {
    square: "shape-square",
    triangle: "shape-triangle",
    circle: "shape-circle",
    diamond: "shape-diamond",
  };
  return shapeMap[STAGES[stageId].shape];
};

// Helper to get all stages as array
export const getAllStages = (): Stage[] => {
  return Object.values(STAGES);
};

// Stage order for display
export const STAGE_ORDER: StageType[] = [
  "honeymoon",
  "self-reflection",
  "soul-searching",
  "steady-state",
];
