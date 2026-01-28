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
  } catch (error: any) {
    console.error("ERROR - getAssessmentTypes failed:", error);
    console.error("ERROR - Error response:", error.response);
    console.error("ERROR - Error data:", error.response?.data);
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
  } catch (error: any) {
    console.error("ERROR - getQuestionsByType failed:", error);
    console.error("ERROR - Error response:", error.response);
    console.error("ERROR - Error data:", error.response?.data);
    throw error;
  }
};
