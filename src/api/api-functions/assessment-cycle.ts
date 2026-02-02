import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";
import type { CycleFormPayload, AssessmentCycle } from "@/types/assessmentCycles";
import { formatDateToAPI } from "@/utils/dateUtils";
import { getDimensionFromAssessmentType, getAssessmentTypeFromDimension } from "@/utils/assessmentConfig";

/**
 * API payload structure for creating an assessment cycle
 */
export interface CreateCyclePayload {
  cycle_name: string;
  assessment_type: string; // Cycle type: "Quarterly", "Annual", "Ad hoc" (API format)
  period: "Fiscal" | "Calendar";
  dimension: string; // Converted dimension: "1D", "2D", "3D", "4D"
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
 * Transform cycle type from frontend format to API format
 * Frontend uses "Adhoc", but API expects "Ad hoc"
 */
const transformCycleTypeToAPI = (type: string): string => {
  if (type === "Adhoc") {
    return "Ad hoc";
  }
  return type;
};

/**
 * Transform cycle type from API format to frontend format
 * API returns "Ad hoc", but frontend uses "Adhoc"
 */
export const transformCycleTypeFromAPI = (type: string): string => {
  if (type === "Ad hoc") {
    return "Adhoc";
  }
  return type;
};

/**
 * Transform CycleFormPayload to API payload format
 */
const transformCyclePayload = (payload: CycleFormPayload): CreateCyclePayload => {
  const startDate = formatDateToAPI(payload.startDate);
  const endDate = formatDateToAPI(payload.endDate);
  
  if (!startDate || !endDate) {
    console.error("Missing dates:", { startDate: payload.startDate, endDate: payload.endDate });
  }
  
  return {
    cycle_name: payload.name,
    assessment_type: transformCycleTypeToAPI(payload.type),
    period: payload.period,
    dimension: getDimensionFromAssessmentType(payload.assessmentType),
    start_date: startDate,
    end_date: endDate,
    email_notes: payload.notes,
    departments: payload.departments.map((dept) => ({ department: dept, include: 1 })),
  };
};

/**
 * Create a new assessment cycle
 */
export const createAssessmentCycle = async (payload: CycleFormPayload) => {
  try {
    const apiPayload = transformCyclePayload(payload);
    const response = await api.post(API_ENDPOINTS.ASSESSMENT_CYCLE.CREATE_CYCLE, apiPayload);
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: unknown; status?: number } };
    console.error("ERROR - createAssessmentCycle:", err.message || err);
    console.error("Status:", err.response?.status, "Data:", err.response?.data);
    throw error;
  }
};

/**
 * Update an existing assessment cycle
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
    const err = error as { message?: string; response?: { data?: unknown; status?: number } };
    console.error("ERROR - updateAssessmentCycle:", err.message || err);
    throw error;
  }
};

/**
 * API response structure for assessment cycles with departments
 */
export interface AssessmentCycleAPIResponse {
  message: Array<{
    name: string;
    status: string;
    assessment_type: string;
    dimension: string;
    assessments_linked_count: number;
    progress: number;
    time_period: {
      start_date: string;
      end_date: string;
      year: number;
    };
    period?: "Fiscal" | "Calendar";
    employees?: Array<{
      name: string;
      owner?: string;
      creation?: string;
      modified?: string;
      modified_by?: string;
      docstatus?: number;
      idx?: number;
      employee: string;
      include: number;
      parent: string;
      parentfield?: string;
      parenttype?: string;
      doctype?: string;
    }>;
    departments?: Array<{
      name?: string;
      owner?: string;
      creation?: string;
      modified?: string;
      modified_by?: string;
      docstatus?: number;
      idx?: number;
      department: string;
      include: number;
      parent?: string;
      parentfield?: string;
      parenttype?: string;
      doctype?: string;
    }>;
    email_notes?: string;
  }>;
}

/**
 * Query parameters for getting assessment cycles
 */
export interface GetAssessmentCyclesParams {
  department?: string[]; // Array of department names
  search?: string;
  status?: string;
  year?: string;
}

/**
 * Transform API response to AssessmentCycle format
 */
const transformCycleFromAPI = (apiCycle: AssessmentCycleAPIResponse["message"][0]): AssessmentCycle => {
  // Extract dates from time_period object (API returns YYYY-MM-DD format)
  const timePeriod = apiCycle.time_period || {};
  const startDate = timePeriod.start_date || "";
  const endDate = timePeriod.end_date || "";
  
  // Extract departments
  const departments = (apiCycle.departments || []).map((d) => d.department);
  
  // Map dimension to assessment type (e.g., "2D" -> "Manager Relationship Assessment")
  const assessmentType = getAssessmentTypeFromDimension(apiCycle.dimension || "");
  
  return {
    id: apiCycle.name,
    name: apiCycle.name,
    startDate,
    endDate,
    type: transformCycleTypeFromAPI(apiCycle.assessment_type) as AssessmentCycle["type"],
    period: (apiCycle.period || "Fiscal") as AssessmentCycle["period"],
    status: (apiCycle.status as AssessmentCycle["status"]) || "Draft",
    departments,
    assessmentTypes: assessmentType ? [assessmentType] : [],
    participants: (apiCycle.employees || []).length,
    owner: "HR Ops",
    linkedTeams: apiCycle.assessments_linked_count || 0,
    notes: apiCycle.email_notes,
  };
};

/**
 * Get assessment cycles with optional filters
 */
export const getAssessmentCycles = async (
  params?: GetAssessmentCyclesParams
): Promise<AssessmentCycle[]> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string | string[]> = {};
    
    // Department filter - pass as array: department: ["HR", "Finance"]
    if (params?.department?.length) {
      queryParams.department = params.department;
    }
    
    if (params?.search) {
      queryParams.search = params.search;
    }
    
    if (params?.status && params.status !== "All Status") {
      queryParams.status = params.status;
    }
    
    if (params?.year && params.year !== "All Years") {
      queryParams.year = params.year;
    }
    
    const response = await api.get<AssessmentCycleAPIResponse>(
      API_ENDPOINTS.ASSESSMENT_CYCLE.GET_CYCLES_WITH_DEPARTMENTS,
      { 
        params: queryParams,
        // Axios will serialize array as: department[]=HR&department[]=Finance
        // or department=HR&department=Finance depending on paramsSerializer
        paramsSerializer: {
          indexes: null, // Serialize as department[]=HR&department[]=Finance
        }
      }
    );
    
    const cycles = response.data?.message || [];
    return cycles.map(transformCycleFromAPI);
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: unknown; status?: number } };
    console.error("ERROR - getAssessmentCycles:", err.message || err);
    console.error("Status:", err.response?.status, "Data:", err.response?.data);
    throw error;
  }
};
