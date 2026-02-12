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
