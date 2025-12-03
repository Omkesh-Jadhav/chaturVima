/**
 * Assessment Dashboard Mock Data
 * Contains all mock data used in the Assessment Dashboard component
 */

export type AssessmentType =
  | "Employee Self Assessment"
  | "Manager Relationship Assessment"
  | "Department Assessment"
  | "Company Assessment";

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

// Sub-Stages Data for All Stages
// The value represents the weight/percentage distribution within that stage
export const MOCK_SUB_STAGES: Record<string, SubStage[]> = {
  Honeymoon: [
    { id: "excitement", label: "Excitement & Optimism", value: 26 },
    { id: "reality", label: "Initial Reality Check", value: 25 },
    { id: "confidence", label: "Sustained Confidence", value: 15 },
    { id: "over-reliance", label: "Confidence & Over-Reliance", value: 16 },
    { id: "complacency", label: "Subtle Complacency", value: 8 },
  ],
  "Self-Introspection": [
    {
      id: "acknowledgment",
      label: "Acknowledgment of Problems",
      value: 35,
    },
    {
      id: "analyzing",
      label: "Analyzing Causes, Partial Acceptance of Responsibility",
      value: 40,
    },
    {
      id: "exploration",
      label: "Exploration of Solutions",
      value: 25,
    },
  ],
  "Soul-Searching": [
    { id: "frustration", label: "Deep Frustration", value: 30 },
    { id: "questioning", label: "Questioning Fundamentals", value: 28 },
    { id: "openness", label: "Openness to Change", value: 22 },
    { id: "transformation", label: "Actionable Transformation", value: 20 },
  ],
  "Steady-State": [
    { id: "stability", label: "Stability and Alignment", value: 30 },
    { id: "predictability", label: "Operational Predictability", value: 28 },
    { id: "challenges", label: "Emerging Challenges", value: 22 },
    { id: "balance", label: "Dynamic Balance", value: 20 },
  ],
};

// Helper function to get sub-stages for a stage
export const getSubStagesForStage = (stageName: string): SubStage[] => {
  return MOCK_SUB_STAGES[stageName] || [];
};
