/**
 * Analytics and Department Data
 *
 * Contains analytics-related data structures and mock department data:
 * - Department types and interfaces
 * - Mock department data with health scores and stage distributions
 * - Assessment activity interface
 */

import type { StageDistribution, StageType } from "@/types";

// ==================== Types and Interfaces ====================
export type DepartmentType =
  | "engineering"
  | "sales"
  | "marketing"
  | "hr"
  | "operations"
  | "finance";

export interface Department {
  id: DepartmentType;
  name: string;
  employeeCount: number;
  assessmentCompletionRate: number; // percentage
  avgHealthScore: number; // 0-100
  stageDistribution: StageDistribution;
}

// Assessment activity
export interface AssessmentActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  department: DepartmentType;
  completedAt: string; // ISO date string
  dominantStage: StageType;
  stageDistribution: StageDistribution;
  completionTime: number; // minutes
}

// ==================== Mock Data ====================
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "engineering",
    name: "Engineering",
    employeeCount: 45,
    assessmentCompletionRate: 87,
    avgHealthScore: 68,
    stageDistribution: {
      honeymoon: 15,
      "self-reflection": 35,
      "soul-searching": 30,
      "steady-state": 20,
    },
  },
  {
    id: "sales",
    name: "Sales",
    employeeCount: 32,
    assessmentCompletionRate: 94,
    avgHealthScore: 72,
    stageDistribution: {
      honeymoon: 25,
      "self-reflection": 20,
      "soul-searching": 25,
      "steady-state": 30,
    },
  },
  {
    id: "marketing",
    name: "Marketing",
    employeeCount: 28,
    assessmentCompletionRate: 82,
    avgHealthScore: 65,
    stageDistribution: {
      honeymoon: 10,
      "self-reflection": 40,
      "soul-searching": 35,
      "steady-state": 15,
    },
  },
  {
    id: "hr",
    name: "Human Resources",
    employeeCount: 12,
    assessmentCompletionRate: 100,
    avgHealthScore: 78,
    stageDistribution: {
      honeymoon: 20,
      "self-reflection": 25,
      "soul-searching": 20,
      "steady-state": 35,
    },
  },
  {
    id: "operations",
    name: "Operations",
    employeeCount: 38,
    assessmentCompletionRate: 76,
    avgHealthScore: 61,
    stageDistribution: {
      honeymoon: 12,
      "self-reflection": 30,
      "soul-searching": 38,
      "steady-state": 20,
    },
  },
  {
    id: "finance",
    name: "Finance",
    employeeCount: 18,
    assessmentCompletionRate: 89,
    avgHealthScore: 70,
    stageDistribution: {
      honeymoon: 18,
      "self-reflection": 28,
      "soul-searching": 24,
      "steady-state": 30,
    },
  },
];
