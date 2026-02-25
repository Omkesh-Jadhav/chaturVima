import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";
import type { Question } from "@/types";

export interface AssessmentType {
  name: string;
}

export interface ApiQuestion {
  question_text: string;
  stage: string;
  sub_stage?: string;
  order: number;
  name?: string;
}

export interface QuestionnaireData {
  data: {
    name: string;
    questionnaire_name?: string;
    questions?: ApiQuestion[];
  };
}

export interface EmployeeAssessment {
  submission_name: string;
  status: string;
  questionnaire: string;
  dimension: string;
  assignment?: string;
  assessment_cycle?: string;
  cycle_name?: string;
  total_questions?: number;
  answered_questions?: number;
  pending_questions?: number;
}

/** Overall counts from get_employee_assessments API */
export interface EmployeeAssessmentsOverall {
  total_questions: number;
  answered_questions: number;
  pending_questions: number;
}

/** Raw item from API response message.items[] */
export interface EmployeeAssessmentItem {
  submission_name: string;
  status: string;
  questionnaire: string;
  dimension: string;
  total_questions: number;
  answered_questions: number;
  pending_questions: number;
  assignment?: string;
  assessment_cycle?: string;
  cycle_name?: string;
}

export interface EmployeeAssessmentsResponseLegacy {
  message: EmployeeAssessment[];
}

export interface EmployeeAssessmentsResponse {
  message: {
    overall: EmployeeAssessmentsOverall;
    items: EmployeeAssessmentItem[];
  };
}

/** Result of getEmployeeAssessments: overall counts + list of assessments */
export interface GetEmployeeAssessmentsResult {
  overall: EmployeeAssessmentsOverall;
  assessments: EmployeeAssessment[];
}

export const getEmployeeAssessments = async (
  userId: string
): Promise<GetEmployeeAssessmentsResult> => {
  const payload = {
    employee: userId,
  };

  const response = await api.post<EmployeeAssessmentsResponse>(
    API_ENDPOINTS.ASSESSMENT.GET_EMPLOYEE_ASSESSMENTS,
    payload
  );

  const msg = response.data?.message;

  if (!msg) {
    return {
      overall: { total_questions: 0, answered_questions: 0, pending_questions: 0 },
      assessments: [],
    };
  }

  // New shape: { overall, items }
  if (typeof msg === "object" && "overall" in msg && "items" in msg) {
    const { overall, items } = msg as {
      overall: EmployeeAssessmentsOverall;
      items: EmployeeAssessmentItem[];
    };
    const assessments: EmployeeAssessment[] = (items || []).map((item) => ({
      submission_name: item.submission_name,
      status: item.status,
      questionnaire: item.questionnaire,
      dimension: item.dimension,
      assignment: item.assignment,
      assessment_cycle: item.assessment_cycle,
      cycle_name: item.cycle_name,
      total_questions: item.total_questions,
      answered_questions: item.answered_questions,
      pending_questions: item.pending_questions,
    }));
    return {
      overall: overall ?? { total_questions: 0, answered_questions: 0, pending_questions: 0 },
      assessments,
    };
  }

  // Legacy shape: message is array
  const list = Array.isArray(msg) ? msg : [];
  const assessments = list as EmployeeAssessment[];
  const total_questions =
    assessments.reduce((sum, a) => sum + (a.total_questions ?? 0), 0) || 0;
  const answered_questions =
    assessments.reduce((sum, a) => sum + (a.answered_questions ?? 0), 0) || 0;
  return {
    overall: {
      total_questions,
      answered_questions,
      pending_questions: total_questions - answered_questions,
    },
    assessments,
  };
};

// ────────────────────────────────────────────────

const mapAssessmentTypeToLevel = (
  typeName: string
): "employee" | "manager" | "department" | "company" => {
  const map: Record<string, "employee" | "manager" | "department" | "company"> = {
    Self: "employee",
    Boss: "manager",
    Department: "department",
    Company: "company",
  };

  return map[typeName] ?? "employee";
};

// ────────────────────────────────────────────────

export interface AssessmentAnswer {
  name: string;
  question: string;
  rating: string; // "1"–"5"
  idx: number;
  [key: string]: unknown;
}

export interface SubmissionQuestionData {
  data: {
    name: string;
    questionnaire?: string;
    dimension?: string;
    answers?: AssessmentAnswer[];
    assessment_cycle?: string;
    [key: string]: unknown;
  };
}

const mapAnswerToQuestion = (
  answer: AssessmentAnswer,
  index: number,
  questionnaireName: string
): Question => {
  const level = mapAssessmentTypeToLevel(questionnaireName);

  return {
    id: answer.name || `q-${questionnaireName}-${index + 1}`,
    level,
    stage: "honeymoon" as const,
    type: "likert" as const,
    text: answer.question,
    options: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
    weight: 1.0,
  };
};

export interface QuestionsWithAnswers {
  questions: Question[];
  answers: Record<string, number>; // questionId → 0–4
  cycle_name: string;
}

export const getQuestionsBySubmission = async (
  submissionName: string
): Promise<QuestionsWithAnswers> => {
  const url = `${API_ENDPOINTS.ASSESSMENT.ASSESSMENT_SUBMISSION}/${submissionName}`;
  const response = await api.get<SubmissionQuestionData>(url);

  const submissionData = response.data.data;
  const answers = submissionData.answers || [];
  const questionnaireName = submissionData.questionnaire || "SELF";
  const cycle_name = (typeof submissionData.cycle_name === 'string' ? submissionData.cycle_name.trim() : '') 
  || (typeof submissionData.assessment_cycle === 'string' ? submissionData.assessment_cycle.trim() : '') 
  || "Current Assessment Cycle";

  // Sort answers by idx (defensive: fallback to 0)
  const sortedAnswers = [...answers].sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));

  const mappedQuestions = sortedAnswers.map((answer, index) =>
    mapAnswerToQuestion(answer, index, questionnaireName)
  );

  // Build existing answers map (rating "1"–"5" → index 0–4)
  const existingAnswers: Record<string, number> = {};

  answers.forEach((answer) => {
    if (answer.rating && answer.rating.trim() !== "") {
      const ratingNum = parseInt(answer.rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        const questionId = answer.name || `q-${questionnaireName}-${answer.idx}`;
        existingAnswers[questionId] = ratingNum - 1;
      }
    }
  });

  return {
    questions: mappedQuestions,
    answers: existingAnswers,
    cycle_name,
  };
};

// ────────────────────────────────────────────────

export interface AssessmentSubmissionPayload {
  status?: string;
  answers: Array<{
    question: string;
    rating: string;
  }>;
}

export interface AssessmentSubmissionAnswer {
  question: string;
  rating: string; // "1"–"5"
}

export interface AssessmentSubmission {
  name: string;
  employee?: string;
  questionnaire?: string;
  status?: string;
  answers?: AssessmentSubmissionAnswer[];
  [key: string]: unknown;
}

export interface AssessmentSubmissionsResponse {
  data: AssessmentSubmission[];
}

export const submitAssessmentAnswers = async (
  submissionId: string,
  questions: Question[],
  answers: Record<string, number>, // questionId → 0–4
  status?: string
): Promise<unknown> => {
  const answersPayload = questions
    .filter((q) => answers[q.id] !== undefined)
    .map((question) => ({
      question: question.text,
      rating: String(answers[question.id] + 1),
    }));

  const payload: AssessmentSubmissionPayload = {
    answers: answersPayload,
  };

  if (status) {
    payload.status = status;
  }

  const url = `${API_ENDPOINTS.ASSESSMENT.SUBMIT_ASSESSMENT}/${submissionId}`;
  const response = await api.put(url, payload);

  return response.data;
};