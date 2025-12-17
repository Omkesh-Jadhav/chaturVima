/**
 * Assessment Type Utilities
 * Helper functions for mapping questions to assessment types
 */
import type { Question } from "@/types";
import type { AssessmentType } from "@/data/assessmentDashboard";

/**
 * Map question level to assessment type
 */
const levelToAssessmentType: Record<string, AssessmentType> = {
  employee: "Employee Self Assessment",
  manager: "Manager Relationship Assessment",
  department: "Department Assessment",
  company: "Company Assessment",
};

/**
 * Get assessment type from question level
 */
export const getAssessmentTypeFromQuestion = (question: Question): AssessmentType => {
  return levelToAssessmentType[question.level] || "Employee Self Assessment";
};

/**
 * Filter questions by assessment types
 */
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

/**
 * Get completion status for each assessment type
 */
export const getCompletionByType = (
  questionsByType: Record<AssessmentType, Question[]>,
  answers: Record<string, number>
): Record<AssessmentType, { answered: number; total: number; isComplete: boolean }> => {
  const completion: Record<
    AssessmentType,
    { answered: number; total: number; isComplete: boolean }
  > = {
    "Employee Self Assessment": { answered: 0, total: 0, isComplete: false },
    "Manager Relationship Assessment": { answered: 0, total: 0, isComplete: false },
    "Department Assessment": { answered: 0, total: 0, isComplete: false },
    "Company Assessment": { answered: 0, total: 0, isComplete: false },
  };

  Object.entries(questionsByType).forEach(([type, questions]) => {
    const total = questions.length;
    const answered = questions.filter((q) => answers[q.id] !== undefined).length;
    completion[type as AssessmentType] = {
      answered,
      total,
      isComplete: total > 0 && answered === total,
    };
  });

  return completion;
};

/**
 * Check if all assigned assessment types are complete
 */
export const areAllTypesComplete = (
  assignedTypes: AssessmentType[],
  completion: Record<AssessmentType, { answered: number; total: number; isComplete: boolean }>
): boolean => {
  return assignedTypes.every((type) => completion[type]?.isComplete ?? false);
};

