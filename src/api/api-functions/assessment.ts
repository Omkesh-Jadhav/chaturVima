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

// Fetches all assessment types from the API
export const getAssessmentTypes = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ASSESSMENT.GET_ASSESSMENT_TYPES);
    console.log("SUCCESS - getAssessmentTypes response:", response);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    console.error("ERROR - getAssessmentTypes failed:", error);
    console.error("ERROR - Error response:", err.response);
    console.error("ERROR - Error data:", err.response?.data);
    throw error;
  }
};

// Maps API stage name to StageType
const mapStageToStageType = (stage: string): "honeymoon" | "self-reflection" | "soul-searching" | "steady-state" => {
  const stageMap: Record<string, "honeymoon" | "self-reflection" | "soul-searching" | "steady-state"> = {
    "Honeymoon": "honeymoon",
    "Self-Reflection": "self-reflection",
    "Self-Introspection": "self-reflection",
    "Soul-Searching": "soul-searching",
    "Steady-State": "steady-state",
  };
  return stageMap[stage] || "honeymoon";
};

// Maps assessment type name to organizational level
const mapAssessmentTypeToLevel = (typeName: string): "employee" | "manager" | "department" | "company" => {
  if (typeName === "Self") return "employee";
  if (typeName === "Boss") return "manager";
  if (typeName === "Department") return "department";
  if (typeName === "Company") return "company";
  return "employee";
};

// Maps API question to Question interface
const mapApiQuestionToQuestion = (
  apiQuestion: ApiQuestion,
  index: number,
  assessmentTypeName: string
): Question => {
  const level = mapAssessmentTypeToLevel(assessmentTypeName);
  const stage = mapStageToStageType(apiQuestion.stage);
  
  return {
    id: apiQuestion.name || `q-${assessmentTypeName}-${index + 1}`,
    level,
    stage,
    type: "likert",
    text: apiQuestion.question_text,
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

// Fetches questions by assessment type from the API
export const getQuestionsByType = async (assessmentTypeName: string): Promise<Question[]> => {
  try {
    const url = `${API_ENDPOINTS.ASSESSMENT.GET_QUESTIONS_BY_TYPE}/${assessmentTypeName}`;
    const response = await api.get<QuestionnaireData>(url);
    console.log("SUCCESS - getQuestionsByType response:", response);
    
    const questions = response.data.data.questions || [];
    const mappedQuestions = questions
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((q, index) => mapApiQuestionToQuestion(q, index, assessmentTypeName));
    
    return mappedQuestions;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    console.error("ERROR - getQuestionsByType failed:", error);
    console.error("ERROR - Error response:", err.response);
    console.error("ERROR - Error data:", err.response?.data);
    throw error;
  }
};

// Interface for assessment submission payload
export interface AssessmentSubmissionPayload {
  status?: string;
  answers: Array<{
    question: string;
    rating: string;
  }>;
}

// Interface for Assessment Submission answers returned by API
export interface AssessmentSubmissionAnswer {
  question: string;
  rating: string; // "1" - "5"
}

// Interface for Assessment Submission response
export interface AssessmentSubmission {
  name: string; // Submission ID like "SUB-ASSESSMENT-HR-EMP-00006-2D-0004-Self-0005"
  employee?: string;
  questionnaire?: string;
  status?: string;
  answers?: AssessmentSubmissionAnswer[];
  [key: string]: unknown;
}

export interface AssessmentSubmissionsResponse {
  data: AssessmentSubmission[];
}

// Fetches Assessment Submissions by employee_id
export const getAssessmentSubmissionsByEmployee = async (
  employeeId: string
): Promise<AssessmentSubmission[]> => {
  try {
    const url = `${API_ENDPOINTS.ASSESSMENT.GET_ASSESSMENT_SUBMISSIONS}?filters=[["employee","=","${employeeId}"]]`;
    const response = await api.get<AssessmentSubmissionsResponse>(url);
    console.log("SUCCESS - getAssessmentSubmissionsByEmployee response:", response);
    return response.data.data || [];
  } catch (error: unknown) {
    console.error("ERROR - getAssessmentSubmissionsByEmployee failed:", error);
    console.error("ERROR - Error response:", (error as { response?: { data?: unknown } })?.response);
    throw error;
  }
};

// Fetches a single Assessment Submission with full details (including answers)
export const getAssessmentSubmissionDetail = async (
  submissionId: string
): Promise<AssessmentSubmission> => {
  try {
    const url = `${API_ENDPOINTS.ASSESSMENT.GET_ASSESSMENT_SUBMISSIONS}/${submissionId}`;
    const response = await api.get<{ data: AssessmentSubmission }>(url);
    console.log("SUCCESS - getAssessmentSubmissionDetail response:", response);
    return response.data.data;
  } catch (error: unknown) {
    console.error("ERROR - getAssessmentSubmissionDetail failed:", error);
    console.error("ERROR - Error response:", (error as { response?: { data?: unknown } })?.response);
    throw error;
  }
};

// Submits assessment answers to the API
export const submitAssessmentAnswers = async (
  submissionId: string,
  questions: Question[],
  answers: Record<string, number>, // questionId -> optionIndex (0-4)
  status?: string
): Promise<unknown> => {
  try {
    // Map answers to API format
    const answersPayload = questions
      .filter((question) => answers[question.id] !== undefined)
      .map((question) => {
        const optionIndex = answers[question.id];
        // Convert 0-4 index to 1-5 rating (as string)
        const rating = String(optionIndex + 1);
        return {
          question: question.text,
          rating: rating,
        };
      });

    const payload: AssessmentSubmissionPayload = {
      answers: answersPayload,
    };

    // Add status if provided (e.g., "Submitted" for final submission)
    if (status) {
      payload.status = status;
    }

    const url = `${API_ENDPOINTS.ASSESSMENT.SUBMIT_ASSESSMENT}/${submissionId}`;
    const response = await api.put(url, payload);
    console.log("SUCCESS - submitAssessmentAnswers response:", response);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    console.error("ERROR - submitAssessmentAnswers failed:", error);
    console.error("ERROR - Error response:", err.response);
    console.error("ERROR - Error data:", err.response?.data);
    throw error;
  }
};