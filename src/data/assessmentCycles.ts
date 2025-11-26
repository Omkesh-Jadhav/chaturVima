import type {
  AssessmentCycle,
  DepartmentHeadAccess,
  ShareMatrix,
} from "@/types/assessmentCycles";

export const SHARE_MATRIX_STORAGE_KEY = "cv_hr_share_matrix_v1";

export const assessmentCyclesSeed: AssessmentCycle[] = [
  {
    id: "cycle-q4-2024",
    name: "Q4 2024 Performance Review",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    type: "Quarterly",
    period: "Fiscal",
    status: "Active",
    questionnaires: 4,
    departments: ["SAP", "IT", "Finance"],
    participants: 87,
    owner: "HR Ops",
    linkedTeams: 6,
    notes: "Critical refresh before year-end compensation decisions.",
  },
  {
    id: "cycle-annual-2025",
    name: "Annual Leadership Assessment",
    startDate: "2025-01-15",
    endDate: "2025-02-28",
    type: "Annual",
    period: "Calendar",
    status: "Upcoming",
    questionnaires: 6,
    departments: ["Leadership", "Marketing"],
    participants: 0,
    owner: "People Center of Excellence",
    linkedTeams: 4,
    notes: "Includes 360 feedback plus self-reflection module.",
  },
  {
    id: "cycle-midyear-360",
    name: "Mid-year 360 Feedback",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    type: "Ad hoc",
    period: "Calendar",
    status: "Completed",
    questionnaires: 3,
    departments: ["IT", "Engineering Ops"],
    participants: 92,
    owner: "Engineering HRBP",
    linkedTeams: 3,
    notes: "Pilot for deeper capability mapping.",
  },
  {
    id: "cycle-onboarding-pulse",
    name: "Onboarding Experience Pulse",
    startDate: "2024-11-05",
    endDate: "2024-11-25",
    type: "Ad hoc",
    period: "Fiscal",
    status: "Upcoming",
    questionnaires: 2,
    departments: ["People Ops", "Talent"],
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
    id: "dh-people",
    name: "Naveen Iyer",
    email: "naveen.iyer@example.com",
    department: "People Ops",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Naveen",
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

export const statusFilters = ["All Status", "Active", "Upcoming", "Completed"];
export const yearFilters = ["All Years", "2024", "2025"];
export const departmentOptions = Array.from(
  new Set(assessmentCyclesSeed.flatMap((cycle) => cycle.departments))
).sort();
