import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export interface AssessmentType {
  name: string;
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
