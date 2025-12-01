/**
 * Assessment Dashboard Mock Data
 * Contains all mock data used in the Assessment Dashboard component
 */

export type Priority = "High" | "Medium" | "Low";

export type PendingAssessment = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  priority: Priority;
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
  state: string;
  values: {
    Optimism: number;
    Energy: number;
    Realism: number;
    Stability: number;
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
    priority: "High",
  },
  {
    id: "p2",
    title: "Advanced Communication",
    category: "Communication",
    dueDate: "2025-11-20",
    priority: "Medium",
  },
  {
    id: "p3",
    title: "Data Literacy",
    category: "Analytics",
    dueDate: "2025-11-28",
    priority: "Low",
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

// Emotional Intensity Heatmap Data
export const MOCK_EMOTIONAL_INTENSITY_HEATMAP: EmotionalIntensityRow[] = [
  {
    state: "Honeymoon",
    values: {
      Optimism: 90,
      Energy: 85,
      Realism: 65,
      Stability: 45,
    },
  },
  {
    state: "Self-Introspection",
    values: {
      Optimism: 60,
      Energy: 70,
      Realism: 85,
      Stability: 55,
    },
  },
  {
    state: "Soul-Searching",
    values: {
      Optimism: 40,
      Energy: 50,
      Realism: 90,
      Stability: 35,
    },
  },
  {
    state: "Steady-State",
    values: {
      Optimism: 70,
      Energy: 75,
      Realism: 80,
      Stability: 95,
    },
  },
];

// Emotional Stage Assessment Data
export const MOCK_EMOTIONAL_STAGE_ASSESSMENT: EmotionalStageAssessment[] = [
  {
    stage: "Honeymoon",
    score: 153.73,
    color: "#10b981",
    status: "Dominant",
  },
  {
    stage: "Self-Introspection",
    score: 122.47,
    color: "#3b82f6",
    status: "Secondary",
  },
  {
    stage: "Soul-Searching",
    score: 121.07,
    color: "#f97316",
    status: "Transitional",
  },
  {
    stage: "Steady-State",
    score: 118.73,
    color: "#a855f7",
  },
];

// Honeymoon Sub-Stages Data
export const MOCK_HONEYMOON_SUB_STAGES: SubStage[] = [
  { id: "excitement", label: "Excitement & Optimism", value: 26 },
  { id: "reality", label: "Initial Reality Check", value: 25 },
  { id: "confidence", label: "Sustained Confidence", value: 15 },
  { id: "over-reliance", label: "Confidence & Over-Reliance", value: 16 },
  { id: "complacency", label: "Subtle Complacency", value: 8 },
];
