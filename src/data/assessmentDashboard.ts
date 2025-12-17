/**
 * Assessment Dashboard Data and Stage Configuration
 *
 * Centralized file for all assessment-related data and configuration:
 * - Stage configuration (STAGES, THEME_CONFIG, helper functions)
 * - Assessment constants (config, badges, colors)
 * - Assessment types and priorities
 * - Mock assessment data (pending, completed, emotional stages, sub-stages)
 *
 * Colors are imported from centralized theme configuration
 */

import { getStagePieColor } from "@/utils/assessmentConfig";
import type { Stage, StageType, ThemeConfig } from "@/types";
import { colors } from "@/utils/theme";

// ==================== Assessment Constants ====================
export const ASSESSMENT_CONFIG = {
  questionsPerPage: 5,
  maxVisiblePagination: 10,
  autoAdvanceDelay: 300,
  scrollOffset: 20,
  toastDuration: 3000,
} as const;

export const ACHIEVEMENT_BADGES = [
  { icon: "Target", label: "Completed", color: "text-blue-600" },
  { icon: "Star", label: "Thoughtful", color: "text-yellow-600" },
  { icon: "Zap", label: "Valuable", color: "text-purple-600" },
] as const;

export const CONFETTI_COLORS = [
  "#2BC6B4",
  "#1E3A5F",
  "#FF6347",
  "#EF4444",
  "#6A5ACD",
  "#FFD700",
] as const;

// ==================== Stage Configuration ====================
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

// Stage order for internal use (StageType format)
export const STAGE_ORDER_TYPES: StageType[] = [
  "honeymoon",
  "self-reflection",
  "soul-searching",
  "steady-state",
];

// Stage order for display (display names)
export const STAGE_ORDER = [
  "Steady-State",
  "Honeymoon",
  "Self-Introspection",
  "Soul-Searching",
] as const;

export type StageName = (typeof STAGE_ORDER)[number];

// Stage helper functions
export const getStage = (stageId: StageType): Stage => {
  return STAGES[stageId];
};

export const getStageColor = (
  stageId: StageType,
  shade: "main" | "light" | "dark" = "main"
): string => {
  return STAGES[stageId].color[shade];
};

export const getStageShapeClass = (stageId: StageType): string => {
  const shapeMap = {
    square: "shape-square",
    triangle: "shape-triangle",
    circle: "shape-circle",
    diamond: "shape-diamond",
  };
  return shapeMap[STAGES[stageId].shape];
};

export const getAllStages = (): Stage[] => {
  return Object.values(STAGES);
};

// ==================== Assessment Types and Priorities ====================
export type AssessmentType =
  | "Employee Self Assessment"
  | "Manager Relationship Assessment"
  | "Department Assessment"
  | "Company Assessment";

export type Priority = "High" | "Medium" | "Low";

export const ASSESSMENT_TYPES: AssessmentType[] = [
  "Employee Self Assessment",
  "Manager Relationship Assessment",
  "Department Assessment",
  "Company Assessment",
];

// Re-export for convenience (used in assessmentCycles and manualAssessments)
export const assessmentTypeOptions = ASSESSMENT_TYPES;

export type PendingAssessment = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  cycleName: string;
  assessmentTypes: AssessmentType[];
};

export type CompletedAssessment = {
  id: string;
  title: string;
  category: string;
  date: string;
  score: number;
  percentile: number;
};

export type StageDatum = {
  id: string;
  label: string;
  value: number;
};

export type EmotionalIntensityRow = {
  stage: string;
  values: {
    "Employee Self Assessment": number;
    "Manager Relationship Assessment": number;
    "Department Assessment": number;
    "Company Assessment": number;
  };
};

export type EmotionalStageAssessment = {
  stage: string;
  score: number;
  color: string;
  status?: "Dominant" | "Secondary" | "Transitional";
};

export type SubStage = {
  id: string;
  label: string;
  value: number;
};

// Pending Assessments Data
export const MOCK_PENDING_ASSESSMENTS: PendingAssessment[] = [
  {
    id: "p1",
    title: "Leadership Essentials",
    category: "Leadership",
    dueDate: "2025-11-15",
    cycleName: "Q4 Employee Self-Assessment",
    assessmentTypes: ["Employee Self Assessment"],
  },
  {
    id: "p2",
    title: "Advanced Communication",
    category: "Communication",
    dueDate: "2025-11-20",
    cycleName: "Manager Relationship Assessment",
    assessmentTypes: [
      "Manager Relationship Assessment",
      "Department Assessment",
    ],
  },
  {
    id: "p3",
    title: "Data Literacy",
    category: "Analytics",
    dueDate: "2025-11-28",
    cycleName: "Q4 Employee Self-Assessment",
    assessmentTypes: ["Employee Self Assessment", "Company Assessment"],
  },
  {
    id: "p4",
    title: "Annual Performance Review",
    category: "Performance",
    dueDate: "2025-12-05",
    cycleName: "Annual Performance Assessment",
    assessmentTypes: [
      "Employee Self Assessment",
      "Manager Relationship Assessment",
      "Department Assessment",
    ],
  },
];

// Completed Assessments Data
export const MOCK_COMPLETED_ASSESSMENTS: CompletedAssessment[] = [
  {
    id: "HX-204",
    title: "Honeymoon Calibration Pulse",
    category: "Honeymoon",
    date: "2025-11-08",
    score: 92,
    percentile: 95,
  },
  {
    id: "SI-187",
    title: "Self-Introspection Depth Scan",
    category: "Self-Introspection",
    date: "2025-10-28",
    score: 85,
    percentile: 88,
  },
  {
    id: "SS-164",
    title: "Soul-Searching Diagnostics",
    category: "Soul-Searching",
    date: "2025-10-18",
    score: 78,
    percentile: 81,
  },
  {
    id: "ST-139",
    title: "Steady-State Resilience Audit",
    category: "Steady-State",
    date: "2025-10-05",
    score: 74,
    percentile: 76,
  },
];

// ==================== Mock Assessment Data ====================
// Category Distribution Data
export const MOCK_CATEGORY_DISTRIBUTION: StageDatum[] = [
  { id: "Honeymoon", label: "Honeymoon", value: 42 },
  { id: "Self-Introspection", label: "Self-Introspection", value: 25 },
  { id: "Soul-Searching", label: "Soul-Searching", value: 20 },
  { id: "Steady-State", label: "Steady-State", value: 13 },
];

// Emotional Intensity Heatmap Data - Stages vs Assessment Types (ordered by STAGE_ORDER)
export const MOCK_EMOTIONAL_INTENSITY_HEATMAP: EmotionalIntensityRow[] = [
  {
    stage: "Steady-State",
    values: {
      "Employee Self Assessment": 90,
      "Manager Relationship Assessment": 0,
      "Department Assessment": 30,
      "Company Assessment": 0,
    },
  },
  {
    stage: "Honeymoon",
    values: {
      "Employee Self Assessment": 100,
      "Manager Relationship Assessment": 0,
      "Department Assessment": 88,
      "Company Assessment": 0,
    },
  },
  {
    stage: "Self-Introspection",
    values: {
      "Employee Self Assessment": 0,
      "Manager Relationship Assessment": 75,
      "Department Assessment": 0,
      "Company Assessment": 65,
    },
  },
  {
    stage: "Soul-Searching",
    values: {
      "Employee Self Assessment": 0,
      "Manager Relationship Assessment": 86,
      "Department Assessment": 0,
      "Company Assessment": 15,
    },
  },
];

// Emotional Stage Assessment Data
// Note: Colors are dynamically generated using getStagePieColor from centralized theme
// This ensures all colors come from a single source (src/utils/theme.ts)
export const MOCK_EMOTIONAL_STAGE_ASSESSMENT: EmotionalStageAssessment[] = [
  {
    stage: "Steady-State",
    score: 200.73,
    color: getStagePieColor("Steady-State"),
  },
  {
    stage: "Honeymoon",
    score: 110,
    color: getStagePieColor("Honeymoon"),
  },
  {
    stage: "Self-Introspection",
    score: 122.47,
    color: getStagePieColor("Self-Introspection"),
  },
  {
    stage: "Soul-Searching",
    score: 121.07,
    color: getStagePieColor("Soul-Searching"),
  },
];

// Sub-Stages Data for All Stages
// The value represents the weight/percentage distribution within that stage
export const MOCK_SUB_STAGES: Record<string, SubStage[]> = {
  Honeymoon: [
    { id: "excitement", label: "Excitement and Optimism", value: 25 },
    {
      id: "over-reliance",
      label: "Confidence and Over-Reliance on Past Success",
      value: 25,
    },
    { id: "reality", label: "Initial Reality Check", value: 25 },
    {
      id: "sustained-complacency",
      label: "Sustained Confidence with Subtle Complacency",
      value: 25,
    },
  ],
  "Self-Introspection": [
    {
      id: "acknowledgment",
      label: "Acknowledgment of Problems",
      value: 25,
    },
    {
      id: "analyzing",
      label: "Analyzing Causes",
      value: 25,
    },
    {
      id: "partial-acceptance",
      label: "Partial Acceptance of Responsibility",
      value: 25,
    },
    {
      id: "exploration",
      label: "Exploration of Solutions",
      value: 25,
    },
  ],
  "Soul-Searching": [
    { id: "frustration", label: "Deep Frustration", value: 25 },
    { id: "questioning", label: "Questioning Fundamentals", value: 25 },
    { id: "openness", label: "Openness to Change", value: 25 },
    { id: "transformation", label: "Actionable Transformation", value: 25 },
  ],
  "Steady-State": [
    { id: "stability", label: "Stability and Alignment", value: 25 },
    { id: "predictability", label: "Operational Predictability", value: 25 },
    { id: "challenges", label: "Emerging Challenges", value: 25 },
    { id: "balance", label: "Dynamic Balance", value: 25 },
  ],
};

// Helper function to get sub-stages for a stage
export const getSubStagesForStage = (stageName: string): SubStage[] => {
  return MOCK_SUB_STAGES[stageName] || [];
};
