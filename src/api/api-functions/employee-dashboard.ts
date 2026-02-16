import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

// Interface for employee assessment summary response
export interface EmployeeAssessmentSummary {
  employee: string;
  total_assessments: number;
  completed_assessments: number;
  pending_assessments: number;
  completion_rate: number;
}

export interface EmployeeAssessmentSummaryResponse {
  message: EmployeeAssessmentSummary;
}

// Weighted emotional stage / heatmap summary types
export interface WeightedSubStage {
  sub_stage: string;
  score: number;
  percentage: number;
}

export interface WeightedStage {
  stage: string;
  score: number;
  percentage: number;
  sub_stages: WeightedSubStage[];
}

// Raw logical outcome object coming from the API
export interface RawLogicalOutcome {
  sr_no: number;
  // The remaining key is the stage name (e.g. "Honeymoon") with the description as value
  [stageName: string]: string | number;
}

export interface EmployeeWeightedAssessmentSummary {
  employee: string;
  questionnaires_considered: string[];
  stages: WeightedStage[];
  dominant_stage: string;
  dominant_sub_stage: string;
  logical_outcomes: RawLogicalOutcome[];
}

export interface EmployeeWeightedAssessmentSummaryResponse {
  message: EmployeeWeightedAssessmentSummary;
}

// Fetches employee assessment summary - GET request with employee query parameter
export const getEmployeeAssessmentSummary = async (
  employeeId: string
): Promise<EmployeeAssessmentSummary> => {
  const response = await api.get<EmployeeAssessmentSummaryResponse>(
    API_ENDPOINTS.EMPLOYEE_DASHBOARD.GET_EMPLOYEE_ASSESSMENT_SUMMARY,
    {
      params: {
        employee: employeeId,
      },
    }
  );

  return response.data.message;
};

// Fetches employee weighted emotional assessment summary
export const getEmployeeWeightedAssessmentSummary = async (
  employeeId: string
): Promise<EmployeeWeightedAssessmentSummary> => {
  const response =
    await api.get<EmployeeWeightedAssessmentSummaryResponse>(
      API_ENDPOINTS.EMPLOYEE_DASHBOARD
        .GET_EMPLOYEE_WEIGHTED_ASSESSMENT_SUMMARY,
      {
        params: {
          employee: employeeId,
        },
      }
    );

  return response.data.message;
};
