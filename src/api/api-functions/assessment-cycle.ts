import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";
import type { CycleFormPayload } from "@/types/assessmentCycles";
import { formatDateToAPI } from "@/utils/dateUtils";
import { getDimensionFromAssessmentType } from "@/utils/assessmentConfig";

/**
 * API payload structure for creating an assessment cycle
 */
export interface CreateCyclePayload {
  cycle_name: string;
  assessment_type: string; // Cycle type: "Quarterly", "Annual", "Adhoc"
  period: "Fiscal" | "Calendar";
  dimension: string; // Assessment type: "Employee Self Assessment", etc.
  start_date: string;
  end_date: string;
  email_notes?: string;
  departments: Array<{
    department: string;
    include: number;
  }>;
  employees?: Array<{
    employee: string;
    include: number;
  }>;
}

/**
 * Transform CycleFormPayload to API payload format
 */
const transformCyclePayload = (payload: CycleFormPayload): CreateCyclePayload => {
  const startDate = formatDateToAPI(payload.startDate);
  const endDate = formatDateToAPI(payload.endDate);
  
  // Validate dates are present
  if (!startDate || !endDate) {
    console.error("ERROR - Missing dates in payload:", {
      startDate: payload.startDate,
      endDate: payload.endDate,
      formattedStartDate: startDate,
      formattedEndDate: endDate,
    });
  }
  
  return {
    cycle_name: payload.name,
    assessment_type: payload.type, // Cycle type: "Quarterly", "Annual", "Adhoc"
    period: payload.period,
    dimension: getDimensionFromAssessmentType(payload.assessmentType), // Converted dimension: "2D", "3D", etc.
    start_date: startDate,
    end_date: endDate,
    email_notes: payload.notes || undefined,
    departments: payload.departments.map((dept) => ({
      department: dept,
      include: 1,
    })),
    // employees: [] - Skipping employees for now as requested
  };
};

/**
 * Create a new assessment cycle
 * @param payload - Cycle form payload
 * @returns API response
 */
export const createAssessmentCycle = async (payload: CycleFormPayload) => {
  try {
    const apiPayload = transformCyclePayload(payload);
    console.log("INFO - Creating assessment cycle with payload:", apiPayload);
    console.log("INFO - Endpoint:", API_ENDPOINTS.ASSESSMENT_CYCLE.CREATE_CYCLE);
    const response = await api.post(API_ENDPOINTS.ASSESSMENT_CYCLE.CREATE_CYCLE, apiPayload);
    console.log("SUCCESS - createAssessmentCycle response:", response);
    return response.data;
  } catch (error: unknown) {
    const err = error as { 
      message?: string; 
      response?: { 
        data?: { message?: string; exc?: string }; 
        status?: number;
        statusText?: string;
      } 
    };
    console.error("ERROR - createAssessmentCycle failed:", err.message || err);
    console.error("ERROR - Status:", err.response?.status, err.response?.statusText);
    console.error("ERROR - Response data:", err.response?.data);
    if (err.response?.status === 417) {
      console.error("ERROR - 417 Expectation Failed. This usually means:");
      console.error("  1. The server couldn't meet the requirements of the Expect header");
      console.error("  2. There might be a payload validation issue");
      console.error("  3. Check if all required fields are present and correctly formatted");
    }
    throw error;
  }
};

/**
 * Update an existing assessment cycle
 * @param cycleId - ID of the cycle to update
 * @param payload - Cycle form payload
 * @returns API response
 */
export const updateAssessmentCycle = async (cycleId: string, payload: CycleFormPayload) => {
  try {
    const apiPayload = transformCyclePayload(payload);
    const response = await api.put(
      `${API_ENDPOINTS.ASSESSMENT_CYCLE.UPDATE_CYCLE}/${cycleId}`,
      apiPayload
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string }; status?: number } };
    console.error("ERROR - updateAssessmentCycle failed:", err.message || err);
    throw error;
  }
};

/**
 * Get all assessment cycles
 * @returns API response with cycles list
 */
export const getAssessmentCycles = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ASSESSMENT_CYCLE.GET_CYCLES);
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string }; status?: number } };
    console.error("ERROR - getAssessmentCycles failed:", err.message || err);
    throw error;
  }
};
