/**
 * Assessment Dashboard Mock Data
 * Contains all mock data used in the Assessment Dashboard component
 * Colors are imported from centralized theme configuration
 */

import { getStagePieColor } from "@/utils/assessmentConfig";

export type AssessmentType =
  | "Employee Self Assessment"
  | "Manager Relationship Assessment"
  | "Department Assessment"
  | "Company Assessment";

export type Priority = "High" | "Medium" | "Low";

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

// Category Distribution Data
export const MOCK_CATEGORY_DISTRIBUTION: StageDatum[] = [
  { id: "Honeymoon", label: "Honeymoon", value: 42 },
  { id: "Self-Introspection", label: "Self-Introspection", value: 25 },
  { id: "Soul-Searching", label: "Soul-Searching", value: 20 },
  { id: "Steady-State", label: "Steady-State", value: 13 },
];

// Assessment Types
export const ASSESSMENT_TYPES: AssessmentType[] = [
  "Employee Self Assessment",
  "Manager Relationship Assessment",
  "Department Assessment",
  "Company Assessment",
];

// Emotional Intensity Heatmap Data - Stages vs Assessment Types
export const MOCK_EMOTIONAL_INTENSITY_HEATMAP: EmotionalIntensityRow[] = [
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
  {
    stage: "Steady-State",
    values: {
      "Employee Self Assessment": 90,
      "Manager Relationship Assessment": 0,
      "Department Assessment": 30,
      "Company Assessment": 0,
    },
  },
];

// Emotional Stage Assessment Data
// Note: Colors are dynamically generated using getStagePieColor from centralized theme
// This ensures all colors come from a single source (src/utils/theme.ts)
export const MOCK_EMOTIONAL_STAGE_ASSESSMENT: EmotionalStageAssessment[] = [
  {
    stage: "Honeymoon",
    score: 153.73,
    color: getStagePieColor("Honeymoon"),
    status: "Dominant",
  },
  {
    stage: "Self-Introspection",
    score: 122.47,
    color: getStagePieColor("Self-Introspection"),
    status: "Secondary",
  },
  {
    stage: "Soul-Searching",
    score: 121.07,
    color: getStagePieColor("Soul-Searching"),
    status: "Transitional",
  },
  {
    stage: "Steady-State",
    score: 118.73,
    color: getStagePieColor("Steady-State"),
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
