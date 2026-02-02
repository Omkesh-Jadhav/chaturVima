import type {
  AssessmentCycle,
  DepartmentHeadAccess,
  ShareMatrix,
} from "@/types/assessmentCycles";
import { assessmentTypeOptions } from "./assessmentDashboard";

// Re-export for backward compatibility
export { assessmentTypeOptions };

export const SHARE_MATRIX_STORAGE_KEY = "cv_hr_share_matrix_v1";
export const CYCLES_STORAGE_KEY = "cv_hr_assessment_cycles_v1";

export const assessmentCyclesSeed: AssessmentCycle[] = [
  {
    id: "cycle-q4-2024",
    name: "Employee Self-Assessment",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    type: "Quarterly",
    period: "Fiscal",
    status: "Active",
    departments: ["SAP", "IT", "Finance"],
    assessmentTypes: [
      "Employee Self Assessment",
      "Manager Relationship Assessment",
    ],
    allowCustomUpload: true,
    customQuestionnaireName: "self-reflection-template.pdf",
    participants: 87,
    owner: "HR Ops",
    linkedTeams: 6,
    notes: "Critical refresh before year-end compensation decisions.",
  },
  {
    id: "cycle-annual-2025",
    name: "Manager Relationship Assessment",
    startDate: "2025-01-15",
    endDate: "2025-02-28",
    type: "Annual",
    period: "Calendar",
    status: "Upcoming",
    departments: ["Leadership", "Marketing"],
    assessmentTypes: [
      "Manager Relationship Assessment",
      "Department Assessment",
    ],
    allowCustomUpload: false,
    participants: 0,
    owner: "People Center of Excellence",
    linkedTeams: 4,
    notes: "Includes 360 feedback plus self-reflection module.",
  },
  {
    id: "cycle-midyear-360",
    name: "Department Assessment",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    type: "Quarterly",
    period: "Calendar",
    status: "Completed",
    departments: ["IT", "Engineering Ops"],
    assessmentTypes: ["Department Assessment"],
    allowCustomUpload: false,
    participants: 92,
    owner: "Engineering HRBP",
    linkedTeams: 3,
    notes: "Pilot for deeper capability mapping.",
  },
  {
    id: "cycle-onboarding-pulse",
    name: "Company Assessment",
    startDate: "2024-11-05",
    endDate: "2024-11-25",
    type: "Adhoc",
    period: "Fiscal",
    status: "Upcoming",
    departments: ["People Ops", "Talent"],
    assessmentTypes: [
      "Company Assessment",
      "Employee Self Assessment",
      "Department Assessment",
    ],
    allowCustomUpload: true,
    customQuestionnaireName: "culture-health-check.xlsx",
    participants: 0,
    owner: "Talent Acquisition",
    linkedTeams: 2,
    notes: "Short sprint for new-hire sentiment.",
  },
];

export const departmentHeadsDirectory: DepartmentHeadAccess[] = [
  {
    id: "dh-engineering",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    department: "IT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    activeCycles: 2,
  },
  {
    id: "dh-leadership",
    name: "Leena Kapoor",
    email: "leena.kapoor@example.com",
    department: "Leadership",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leena",
    activeCycles: 1,
  },
  {
    id: "dh-sales",
    name: "Tara Menon",
    email: "tara.menon@example.com",
    department: "Marketing",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tara",
    activeCycles: 0,
  },
  {
    id: "dh-sales",
    name: "Rekha Sharma",
    email: "rekha.sharma@example.com",
    department: "Finance",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rekha",
    activeCycles: 3,
  },
];

const buildDefaultShareMatrix = (): ShareMatrix => {
  return assessmentCyclesSeed.reduce<ShareMatrix>((acc, cycle, cycleIdx) => {
    acc[cycle.id] = departmentHeadsDirectory.reduce<Record<string, boolean>>(
      (mapping, head, headIdx) => {
        const isPrimary =
          (cycleIdx + headIdx) % 2 === 0 ||
          cycle.departments.includes(head.department);
        mapping[head.id] = Boolean(isPrimary && cycle.status !== "Completed");
        return mapping;
      },
      {}
    );
    return acc;
  }, {});
};

export const defaultShareMatrix = buildDefaultShareMatrix();

export const loadShareMatrix = (): ShareMatrix => {
  if (typeof window === "undefined") return defaultShareMatrix;
  const cached = localStorage.getItem(SHARE_MATRIX_STORAGE_KEY);
  if (!cached) return defaultShareMatrix;
  try {
    const parsed = JSON.parse(cached) as ShareMatrix;
    return { ...defaultShareMatrix, ...parsed };
  } catch {
    return defaultShareMatrix;
  }
};

export const persistShareMatrix = (matrix: ShareMatrix) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHARE_MATRIX_STORAGE_KEY, JSON.stringify(matrix));
};

export const loadCycles = (): AssessmentCycle[] => {
  if (typeof window === "undefined") return assessmentCyclesSeed;
  const cached = localStorage.getItem(CYCLES_STORAGE_KEY);
  if (!cached) {
    // First time - initialize with seed data
    persistCycles(assessmentCyclesSeed);
    return assessmentCyclesSeed;
  }
  try {
    const parsed = JSON.parse(cached) as AssessmentCycle[];
    // Merge with seed to ensure we have all seed cycles, but use stored versions if they exist
    const storedMap = new Map(parsed.map((c) => [c.id, c]));
    const seedIds = new Set(assessmentCyclesSeed.map((c) => c.id));
    const seedCycles = assessmentCyclesSeed.map(
      (seed) => storedMap.get(seed.id) || seed
    );
    const customCycles = parsed.filter((c) => !seedIds.has(c.id));
    return [...seedCycles, ...customCycles];
  } catch {
    return assessmentCyclesSeed;
  }
};

export const persistCycles = (cycles: AssessmentCycle[]) => {
  if (typeof window === "undefined") return;
  // Store all cycles
  localStorage.setItem(CYCLES_STORAGE_KEY, JSON.stringify(cycles));
};

export const statusFilters = ["All Status", "Active", "Upcoming", "Completed"];
export const yearFilters = ["All Years", "2024", "2025"];
export const departmentOptions = Array.from(
  new Set(assessmentCyclesSeed.flatMap((cycle) => cycle.departments))
).sort();
