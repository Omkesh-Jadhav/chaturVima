import axios from "axios";
import { API_ENDPOINTS } from "../endpoints";

interface ReportGenerationBySubmissionPayload {
  employee: string;
  cycle_name: string;
  submission_id: string;
}

export const reportGenerationBySubmission = async (employeeId: string, cycleId: string, submissionId: string) => {
  try {
    const payload: ReportGenerationBySubmissionPayload = {
      employee: employeeId,
      cycle_name: cycleId,
      submission_id: submissionId
    };

    const response = await axios.post(API_ENDPOINTS.REPORT.REPORT_GENERATION, payload);
    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

export const getReport = async (employeeId: string, submission_id: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.REPORT.REPORT_PDF}/${employeeId}/${submission_id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting report:", error);
    throw error;
  }
}