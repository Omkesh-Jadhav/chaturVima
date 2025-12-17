/**
 * Mock Employee Data Generator
 *
 * Generates realistic employee data with demographics, career metrics, and stage distributions.
 * Used for testing and development purposes.
 */

import type { StageDistribution, StageType } from "../types";
import type { DepartmentType } from "./mockAnalytics";
import { SeededRandom, clamp } from "../utils/statistics";

// ==================== Type Definitions ====================
export type AgeGroup = "22-30" | "31-40" | "41-50" | "51-60" | "60+";
export type Gender = "Male" | "Female" | "Non-binary" | "Prefer not to say";
export type TenureGroup = "0-1yr" | "1-3yr" | "3-5yr" | "5-10yr" | "10+yr";
export type ExperienceGroup =
  | "0-5yr"
  | "5-10yr"
  | "10-15yr"
  | "15-20yr"
  | "20+yr";
export type RoleLevel = "Junior" | "Mid" | "Senior" | "Lead" | "Executive";
export type WorkLocation = "Remote" | "Hybrid" | "On-site";

export interface EmployeeDetailed {
  // Identity
  id: string;
  name: string;
  email: string;

  // Demographics
  age: number;
  ageGroup: AgeGroup;
  gender: Gender;

  // Career
  roleLevel: RoleLevel;
  department: DepartmentType;
  tenureYears: number;
  tenureGroup: TenureGroup;
  totalExperienceYears: number;
  experienceGroup: ExperienceGroup;
  workLocation: WorkLocation;

  // Stage Metrics (descriptive, not evaluative)
  stageDistribution: StageDistribution;
  dominantStage: StageType;
  dominantStageStrength: number; // 0-100: How strongly one stage dominates
  stageStability: number; // 0-100: How stable the pattern is over time

  // History
  joinDate: string;
  lastAssessmentDate: string;
  assessmentCount: number;
  avgCompletionTime: number;
}

// ==================== Helper Functions ====================
const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 30) return "22-30";
  if (age <= 40) return "31-40";
  if (age <= 50) return "41-50";
  if (age <= 60) return "51-60";
  return "60+";
};

const getTenureGroup = (tenure: number): TenureGroup => {
  if (tenure < 1) return "0-1yr";
  if (tenure < 3) return "1-3yr";
  if (tenure < 5) return "3-5yr";
  if (tenure < 10) return "5-10yr";
  return "10+yr";
};

const getExperienceGroup = (exp: number): ExperienceGroup => {
  if (exp < 5) return "0-5yr";
  if (exp < 10) return "5-10yr";
  if (exp < 15) return "10-15yr";
  if (exp < 20) return "15-20yr";
  return "20+yr";
};

const getRoleLevel = (
  age: number,
  experience: number,
  rng: SeededRandom
): RoleLevel => {
  // Junior: 22-28, 0-5 years exp
  if (age <= 28 && experience < 6) {
    return weightedChoice<RoleLevel>(["Junior", "Mid"], [0.8, 0.2], rng.next());
  }
  // Mid: 26-35, 4-10 years exp
  if (age <= 35 && experience < 11) {
    return weightedChoice<RoleLevel>(
      ["Junior", "Mid", "Senior"],
      [0.1, 0.7, 0.2],
      rng.next()
    );
  }
  // Senior: 32-45, 8-15 years exp
  if (age <= 45 && experience < 16) {
    return weightedChoice<RoleLevel>(
      ["Mid", "Senior", "Lead"],
      [0.15, 0.65, 0.2],
      rng.next()
    );
  }
  // Lead: 38-50, 12+ years exp
  if (age <= 50 && experience >= 12) {
    return weightedChoice<RoleLevel>(
      ["Senior", "Lead", "Executive"],
      [0.3, 0.6, 0.1],
      rng.next()
    );
  }
  // Executive: 45+, 15+ years exp
  if (age >= 45 && experience >= 15) {
    return weightedChoice<RoleLevel>(
      ["Lead", "Executive"],
      [0.7, 0.3],
      rng.next()
    );
  }
  // Default to Mid
  return "Mid";
};

// Generate stage distribution based on age
const generateStageDistribution = (
  age: number,
  rng: SeededRandom
): StageDistribution => {
  let honeymoon: number,
    selfReflection: number,
    soulSearching: number,
    steadyState: number;

  if (age <= 30) {
    // Young: High honeymoon
    honeymoon = 30 + rng.nextInt(-10, 15);
    selfReflection = 35 + rng.nextInt(-10, 10);
    soulSearching = 20 + rng.nextInt(-5, 10);
    steadyState = 15 + rng.nextInt(-5, 10);
  } else if (age <= 40) {
    // Mid-career: Balanced with soul-searching
    honeymoon = 20 + rng.nextInt(-10, 10);
    selfReflection = 30 + rng.nextInt(-10, 15);
    soulSearching = 28 + rng.nextInt(-8, 12);
    steadyState = 22 + rng.nextInt(-8, 10);
  } else if (age <= 50) {
    // Mature: More steady-state
    honeymoon = 15 + rng.nextInt(-8, 10);
    selfReflection = 28 + rng.nextInt(-10, 12);
    soulSearching = 27 + rng.nextInt(-10, 10);
    steadyState = 30 + rng.nextInt(-10, 15);
  } else {
    // Senior: High steady-state
    honeymoon = 10 + rng.nextInt(-5, 10);
    selfReflection = 20 + rng.nextInt(-10, 15);
    soulSearching = 20 + rng.nextInt(-10, 15);
    steadyState = 50 + rng.nextInt(-15, 10);
  }

  // Ensure positive and normalize to 100
  honeymoon = Math.max(5, honeymoon);
  selfReflection = Math.max(10, selfReflection);
  soulSearching = Math.max(10, soulSearching);
  steadyState = Math.max(10, steadyState);

  const total = honeymoon + selfReflection + soulSearching + steadyState;

  return {
    honeymoon: Math.round((honeymoon / total) * 100),
    "self-reflection": Math.round((selfReflection / total) * 100),
    "soul-searching": Math.round((soulSearching / total) * 100),
    "steady-state": Math.round((steadyState / total) * 100),
  };
};

const getDominantStage = (dist: StageDistribution): StageType => {
  const entries: [StageType, number][] = [
    ["honeymoon", dist.honeymoon],
    ["self-reflection", dist["self-reflection"]],
    ["soul-searching", dist["soul-searching"]],
    ["steady-state", dist["steady-state"]],
  ];
  return entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
};

const weightedChoice = <T>(
  options: T[],
  weights: number[],
  randomValue: number
): T => {
  let cumulative = 0;
  for (let i = 0; i < options.length; i++) {
    cumulative += weights[i];
    if (randomValue <= cumulative) return options[i];
  }
  return options[options.length - 1];
};

// ==================== Name Data ====================
const firstNames = {
  Male: [
    "James",
    "Michael",
    "Robert",
    "John",
    "David",
    "William",
    "Richard",
    "Joseph",
    "Thomas",
    "Christopher",
    "Daniel",
    "Matthew",
    "Anthony",
    "Mark",
    "Donald",
    "Steven",
    "Andrew",
    "Kenneth",
    "Joshua",
    "Kevin",
  ],
  Female: [
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Lisa",
    "Nancy",
    "Betty",
    "Margaret",
    "Sandra",
    "Ashley",
    "Kimberly",
    "Emily",
    "Donna",
    "Michelle",
  ],
  "Non-binary": [
    "Alex",
    "Jordan",
    "Taylor",
    "Morgan",
    "Riley",
    "Casey",
    "Avery",
    "Quinn",
  ],
  "Prefer not to say": ["Sam", "Chris", "Pat", "Jamie"],
};

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
];

// ==================== Employee Generator ====================
export const generateRealisticEmployees = (
  count: number = 175
): EmployeeDetailed[] => {
  const rng = new SeededRandom(42); // Reproducible results
  const employees: EmployeeDetailed[] = [];

  const departments: DepartmentType[] = [
    "engineering",
    "sales",
    "marketing",
    "hr",
    "operations",
    "finance",
  ];

  // Department distributions (realistic)
  const deptWeights = [0.26, 0.18, 0.16, 0.07, 0.22, 0.11]; // Sum to 1.0

  for (let i = 0; i < count; i++) {
    // Age (normal distribution: mean=38, σ=10, range 22-65)
    const age = Math.round(clamp(rng.nextNormal(38, 10), 22, 65));
    const ageGroup = getAgeGroup(age);

    // Gender (48M/52F/3NB/2N - adjusted for reality)
    const genderRoll = rng.next();
    let gender: Gender;
    if (genderRoll < 0.48) gender = "Male";
    else if (genderRoll < 0.97) gender = "Female";
    else if (genderRoll < 0.985) gender = "Non-binary";
    else gender = "Prefer not to say";

    // Experience = age - 22 (college graduation) with some variation
    const totalExperienceYears = Math.max(
      0,
      Math.round(age - 22 + rng.nextInt(-2, 2))
    );
    const experienceGroup = getExperienceGroup(totalExperienceYears);

    // Tenure correlated with age (younger = shorter tenure)
    let maxTenure = Math.min(totalExperienceYears, age - 22);
    if (age <= 30) maxTenure = Math.min(maxTenure, 5);
    else if (age <= 40) maxTenure = Math.min(maxTenure, 12);

    const tenureYears = Number((rng.next() * maxTenure).toFixed(1));
    const tenureGroup = getTenureGroup(tenureYears);

    // Role level based on age and experience
    const roleLevel = getRoleLevel(age, totalExperienceYears, rng);

    // Department (weighted distribution)
    const deptRoll = rng.next();
    let cumulative = 0;
    let department: DepartmentType = "engineering";
    for (let j = 0; j < departments.length; j++) {
      cumulative += deptWeights[j];
      if (deptRoll <= cumulative) {
        department = departments[j];
        break;
      }
    }

    // Work location (30% remote, 50% hybrid, 20% on-site)
    const locationRoll = rng.next();
    let workLocation: WorkLocation;
    if (locationRoll < 0.3) workLocation = "Remote";
    else if (locationRoll < 0.8) workLocation = "Hybrid";
    else workLocation = "On-site";

    // Assessment count (needed for stability calculation)
    const assessmentCount = Math.max(
      1,
      Math.floor(tenureYears * 2) + rng.nextInt(0, 3)
    );

    // Stage distribution based on age
    const stageDistribution = generateStageDistribution(age, rng);
    const dominantStage = getDominantStage(stageDistribution);

    // Calculate dominant stage strength (how much the dominant stage stands out)
    const maxStageValue = Math.max(
      stageDistribution.honeymoon,
      stageDistribution["self-reflection"],
      stageDistribution["soul-searching"],
      stageDistribution["steady-state"]
    );
    const dominantStageStrength = Math.round(maxStageValue);

    // Calculate stage stability (based on tenure and assessment count)
    // Longer tenure + more assessments = more stable pattern
    // Newer employees or those in transition have lower stability
    const baseStability = Math.min(85, tenureYears * 10 + assessmentCount * 5);
    const stageStability = Math.round(
      clamp(baseStability + rng.nextInt(-15, 15), 25, 95)
    );

    // Name generation
    const firstName = rng.choice(firstNames[gender]);
    const lastName = rng.choice(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    // Dates
    const now = new Date();
    const joinDate = new Date(
      now.getFullYear() - Math.floor(tenureYears),
      rng.nextInt(0, 11),
      rng.nextInt(1, 28)
    );
    const lastAssessmentDate = new Date(
      now.getTime() - rng.nextInt(0, 90) * 24 * 60 * 60 * 1000
    );

    // Assessment completion time
    const avgCompletionTime = 8 + rng.next() * 8; // 8-16 minutes

    employees.push({
      id: `emp-${String(i + 1).padStart(3, "0")}`,
      name,
      email,
      age,
      ageGroup,
      gender,
      roleLevel,
      department,
      tenureYears,
      tenureGroup,
      totalExperienceYears,
      experienceGroup,
      workLocation,
      stageDistribution,
      dominantStage,
      dominantStageStrength,
      stageStability,
      joinDate: joinDate.toISOString(),
      lastAssessmentDate: lastAssessmentDate.toISOString(),
      assessmentCount,
      avgCompletionTime,
    });
  }

  return employees;
};

// ==================== Exported Data ====================
export const MOCK_EMPLOYEES = generateRealisticEmployees(250);
