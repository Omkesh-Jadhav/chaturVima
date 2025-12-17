/**
 * Assessment Utility Functions
 * Centralized utilities for assessments, storage, pagination, and types
 */

import type { Priority } from "@/data/assessmentDashboard";
import type { CycleStatus } from "@/types/assessmentCycles";
import type { Question } from "@/types";
import type { AssessmentType } from "@/data/assessmentDashboard";

// ==================== Cycle Status Colors ====================
export const CYCLE_STATUS_COLORS: Record<
  CycleStatus,
  { bg: string; text: string; border?: string }
> = {
  Active: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  Upcoming: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  Completed: {
    bg: "bg-slate-200",
    text: "text-slate-800",
    border: "border-slate-300",
  },
  Draft: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
};

// ==================== Assessment Storage ====================
const getStorageKey = (
  type: "page" | "answers" | "submitted",
  email?: string
): string => {
  const baseKey = email
    ? email.toLowerCase().replace(/[^a-z0-9]/g, "_")
    : "anonymous";

  const keys = {
    page: `chaturvima_assessment_page_${baseKey}`,
    answers: `chaturvima_assessment_answers_${baseKey}`,
    submitted: `chaturvima_assessment_submitted_${baseKey}`,
  };

  return keys[type];
};

export const savePage = (page: number, email?: string): void => {
  try {
    localStorage.setItem(getStorageKey("page", email), page.toString());
  } catch (error) {
    console.error("Error saving page:", error);
  }
};

export const loadPage = (email?: string): number => {
  try {
    const saved = localStorage.getItem(getStorageKey("page", email));
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveAnswers = (
  answers: Record<string, number>,
  email?: string
): void => {
  try {
    localStorage.setItem(
      getStorageKey("answers", email),
      JSON.stringify(answers)
    );
  } catch (error) {
    console.error("Error saving answers:", error);
  }
};

export const loadAnswers = (email?: string): Record<string, number> => {
  try {
    const saved = localStorage.getItem(getStorageKey("answers", email));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveSubmissionStatus = (
  submitted: boolean,
  email?: string
): void => {
  try {
    localStorage.setItem(
      getStorageKey("submitted", email),
      submitted.toString()
    );
  } catch (error) {
    console.error("Error saving submission status:", error);
  }
};

export const loadSubmissionStatus = (email?: string): boolean => {
  try {
    return localStorage.getItem(getStorageKey("submitted", email)) === "true";
  } catch {
    return false;
  }
};

export const clearPageStorage = (email?: string): void => {
  try {
    localStorage.removeItem(getStorageKey("page", email));
  } catch (error) {
    console.error("Error clearing page storage:", error);
  }
};

// ==================== Pagination Utilities ====================
export const getPaginationButtons = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 10
): (number | "ellipsis")[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }).map((_, idx) => idx);
  }

  const buttons: (number | "ellipsis")[] = [];

  if (currentPage < 5) {
    for (let i = 0; i < 7; i++) buttons.push(i);
    buttons.push("ellipsis");
    buttons.push(totalPages - 1);
  } else if (currentPage > totalPages - 6) {
    buttons.push(0);
    buttons.push("ellipsis");
    for (let i = totalPages - 7; i < totalPages; i++) buttons.push(i);
  } else {
    buttons.push(0);
    buttons.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) buttons.push(i);
    buttons.push("ellipsis");
    buttons.push(totalPages - 1);
  }

  return buttons;
};

export const getProgressEmoji = (percent: number): string => {
  if (percent === 0) return "😴";
  if (percent < 20) return "😕";
  if (percent < 40) return "😐";
  if (percent < 60) return "🙂";
  if (percent < 80) return "😊";
  if (percent < 100) return "🤩";
  return "🎉";
};

export const getProgressMessage = (percent: number): string => {
  if (percent === 0) return "Just starting...";
  if (percent < 20) return "Getting there...";
  if (percent < 40) return "Making progress...";
  if (percent < 60) return "Great job!";
  if (percent < 80) return "Almost done!";
  if (percent < 100) return "So close!";
  return "Perfect!";
};

// ==================== Assessment Type Utilities ====================
const levelToAssessmentType: Record<string, AssessmentType> = {
  employee: "Employee Self Assessment",
  manager: "Manager Relationship Assessment",
  department: "Department Assessment",
  company: "Company Assessment",
};

export const getAssessmentTypeFromQuestion = (
  question: Question
): AssessmentType => {
  return levelToAssessmentType[question.level] || "Employee Self Assessment";
};

export const filterQuestionsByTypes = (
  questions: Question[],
  assessmentTypes: AssessmentType[]
): Record<AssessmentType, Question[]> => {
  const filtered: Record<AssessmentType, Question[]> = {
    "Employee Self Assessment": [],
    "Manager Relationship Assessment": [],
    "Department Assessment": [],
    "Company Assessment": [],
  };

  questions.forEach((question) => {
    const type = getAssessmentTypeFromQuestion(question);
    if (assessmentTypes.includes(type)) {
      filtered[type].push(question);
    }
  });

  return filtered;
};

export const getCompletionByType = (
  questionsByType: Record<AssessmentType, Question[]>,
  answers: Record<string, number>
): Record<
  AssessmentType,
  { answered: number; total: number; isComplete: boolean }
> => {
  const completion: Record<
    AssessmentType,
    { answered: number; total: number; isComplete: boolean }
  > = {
    "Employee Self Assessment": { answered: 0, total: 0, isComplete: false },
    "Manager Relationship Assessment": {
      answered: 0,
      total: 0,
      isComplete: false,
    },
    "Department Assessment": { answered: 0, total: 0, isComplete: false },
    "Company Assessment": { answered: 0, total: 0, isComplete: false },
  };

  Object.entries(questionsByType).forEach(([type, questions]) => {
    const total = questions.length;
    const answered = questions.filter(
      (q) => answers[q.id] !== undefined
    ).length;
    completion[type as AssessmentType] = {
      answered,
      total,
      isComplete: total > 0 && answered === total,
    };
  });

  return completion;
};

export const areAllTypesComplete = (
  assignedTypes: AssessmentType[],
  completion: Record<
    AssessmentType,
    { answered: number; total: number; isComplete: boolean }
  >
): boolean => {
  return assignedTypes.every((type) => completion[type]?.isComplete ?? false);
};

// ==================== General Assessment Utilities ====================
export const calculateCompletionRate = (
  completedCount: number,
  criticalPendingCount: number
): number => {
  const total = completedCount + criticalPendingCount;
  return total === 0 ? 0 : Math.round((completedCount / total) * 100);
};

export const calculatePercentage = (value: number, max: number): number => {
  return max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
};

export const findMaxByKey = <T>(items: T[], key: keyof T): number => {
  if (items.length === 0) return 0;
  return Math.max(
    ...items.map((item) => {
      const value = item[key];
      return typeof value === "number" ? value : 0;
    })
  );
};

export const filterByPriority = <T extends { priority: Priority }>(
  assessments: T[],
  priority: Priority | "All"
): T[] => {
  return priority === "All"
    ? assessments
    : assessments.filter((item) => item.priority === priority);
};

export const getCycleStatusColor = (
  status: CycleStatus,
  includeBorder = false
): string => {
  const colors = CYCLE_STATUS_COLORS[status];
  return includeBorder
    ? `${colors.bg} ${colors.text} ${colors.border || ""}`
    : `${colors.bg} ${colors.text}`;
};

export const sortStagesByScore = <T extends object>(
  stages: T[],
  scoreKey: keyof T
): T[] => {
  return [...stages].sort((a, b) => {
    const scoreA = Number((a as Record<string, unknown>)[scoreKey as string]) || 0;
    const scoreB = Number((b as Record<string, unknown>)[scoreKey as string]) || 0;
    return scoreB - scoreA;
  });
};
