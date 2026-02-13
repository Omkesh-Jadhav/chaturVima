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

// Interface for employee assessment response
export interface EmployeeAssessment {
  submission_name: string;
  status: string;
  questionnaire: string;
  dimension: string;
}

export interface EmployeeAssessmentsResponse {
  message: EmployeeAssessment[];
}

// Fetches employee assessments - POST request with user_id from localStorage
export const getEmployeeAssessments = async (userId: string): Promise<EmployeeAssessment[]> => {
  const payload = { employee: userId };
  const response = await api.post<EmployeeAssessmentsResponse>(
    API_ENDPOINTS.ASSESSMENT.GET_EMPLOYEE_ASSESSMENTS,
    payload
  );
  return response.data.message || [];
};

// Maps assessment type name to organizational level
const mapAssessmentTypeToLevel = (typeName: string): "employee" | "manager" | "department" | "company" => {
  if (typeName === "Self") return "employee";
  if (typeName === "Boss") return "manager";
  if (typeName === "Department") return "department";
  if (typeName === "Company") return "company";
  return "employee";
};

// Removed mapApiQuestionToQuestion - not used anymore (we use mapAnswerToQuestion instead)

// Interface for assessment answer from API
export interface AssessmentAnswer {
  name: string;
  question: string;
  rating: string; // "1" - "5"
  idx: number;
  [key: string]: unknown;
}

// Interface for submission question data
export interface SubmissionQuestionData {
  data: {
    name: string;
    questionnaire?: string;
    dimension?: string;
    answers?: AssessmentAnswer[];
    [key: string]: unknown;
  };
}

// Maps assessment answer to Question interface
const mapAnswerToQuestion = (
  answer: AssessmentAnswer,
  index: number,
  questionnaireName: string
): Question => {
  const level = mapAssessmentTypeToLevel(questionnaireName);
  const stage: "honeymoon" | "self-reflection" | "soul-searching" | "steady-state" = "honeymoon";
  
  return {
    id: answer.name || `q-${questionnaireName}-${index + 1}`,
    level,
    stage,
    type: "likert",
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

// Return type for questions with their existing answers
export interface QuestionsWithAnswers {
  questions: Question[];
  answers: Record<string, number>; // questionId -> optionIndex (0-4)
}

// Fetches questions by submission name from the API and returns questions with existing answers
export const getQuestionsBySubmission = async (submissionName: string): Promise<QuestionsWithAnswers> => {
  const url = `${API_ENDPOINTS.ASSESSMENT.ASSESSMENT_SUBMISSION}/${submissionName}`;
  const response = await api.get<SubmissionQuestionData>(url);
  
  const submissionData = response.data.data;
  const answers = submissionData.answers || [];
  const questionnaireName = submissionData.questionnaire || "SELF";
  
  // Sort by idx and map to Question format
  const mappedQuestions = answers
    .sort((a, b) => (a.idx || 0) - (b.idx || 0))
    .map((answer, index) => mapAnswerToQuestion(answer, index, questionnaireName));
  
  // Extract existing answers: rating is "1"-"5" (string), convert to 0-4 index
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
  };
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

// Removed getAssessmentSubmissionsByEmployee and getAssessmentSubmissionDetail
// Now using getEmployeeAssessments instead (which returns submission_name, status, etc.)
// and getQuestionsBySubmission for getting questions by submission_name

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
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};