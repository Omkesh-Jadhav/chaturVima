import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

interface ReportGenerationPayload {
  employee: string;
  cycle_name: string;
}

export const reportGeneration = async (employeeId: string, cycleName: string) => {
  try {
    const payload: ReportGenerationPayload = {
      employee: employeeId,
      cycle_name: cycleName
    };

    const response = await api.post(API_ENDPOINTS.REPORT.REPORT_GENERATION, payload);
    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}