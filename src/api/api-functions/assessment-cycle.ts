import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";
import type { CycleFormPayload, AssessmentCycle } from "@/types/assessmentCycles";
import { formatDateToAPI } from "@/utils/dateUtils";
import { getDimensionFromAssessmentType, getAssessmentTypeFromDimension } from "@/utils/assessmentConfig";

// API payload structure for creating/updating assessment cycle
export interface CreateCyclePayload {
  cycle_name: string;
  assessment_type: string; // "Quarterly", "Annual", "Ad hoc"
  period: "Fiscal" | "Calendar";
  dimension: string; // "1D", "2D", "3D", "4D"
  start_date: string;
  end_date: string;
  email_notes?: string;
  departments: Array<{ department: string; include: number }>;
  employees?: Array<{ employee: string; include: number }>;
}

// Transform "Adhoc" to "Ad hoc" for API
const transformCycleTypeToAPI = (type: string): string => (type === "Adhoc" ? "Ad hoc" : type);

// Transform "Ad hoc" to "Adhoc" for frontend
export const transformCycleTypeFromAPI = (type: string): string => (type === "Ad hoc" ? "Adhoc" : type);

// Transform form payload to API payload
const transformCyclePayload = (payload: CycleFormPayload): CreateCyclePayload => {
  const apiPayload: CreateCyclePayload = {
    cycle_name: payload.name,
    assessment_type: transformCycleTypeToAPI(payload.type),
    period: payload.period,
    dimension: getDimensionFromAssessmentType(payload.assessmentType),
    start_date: formatDateToAPI(payload.startDate),
    end_date: formatDateToAPI(payload.endDate),
    email_notes: payload.notes,
    departments: payload.departments.map((dept) => ({ department: dept, include: 1 })),
  };

  // Include employees if manual selection is enabled
  if (payload.employees && payload.employees.length > 0) {
    apiPayload.employees = payload.employees.map((emp) => ({ employee: emp, include: 1 }));
  }

  return apiPayload;
};

// Create new assessment cycle
export const createAssessmentCycle = async (payload: CycleFormPayload) => {
  try {
    const response = await api.post(API_ENDPOINTS.ASSESSMENT_CYCLE.CREATE_CYCLE, transformCyclePayload(payload));
    return response.data;
  } catch (error: unknown) {
    console.error("ERROR - createAssessmentCycle:", error);
    throw error;
  }
};

// Update existing assessment cycle
export const updateAssessmentCycle = async (cycleId: string, payload: CycleFormPayload) => {
  try {
    const url = `${API_ENDPOINTS.ASSESSMENT_CYCLE.UPDATE_CYCLE}/${encodeURIComponent(cycleId)}`;
    const response = await api.put(url, transformCyclePayload(payload), {
      params: { name: cycleId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("ERROR - updateAssessmentCycle:", error);
    throw error;
  }
};

// Schedule assessment cycle (sets docstatus to 1)
export const scheduleAssessmentCycle = async (cycleId: string) => {
  try {
    const url = `${API_ENDPOINTS.ASSESSMENT_CYCLE.UPDATE_CYCLE}/${encodeURIComponent(cycleId)}`;
    const response = await api.put(url, { docstatus: 1 }, {
      params: { name: cycleId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("ERROR - scheduleAssessmentCycle:", error);
    throw error;
  }
};

// API response structure
export interface AssessmentCycleAPIResponse {
  message: Array<{
    name: string;
    cycle_name?: string; // Cycle name from API
    status: string;
    assessment_type: string;
    dimension: string;
    assessments_linked_count: number;
    progress: number;
    time_period: { start_date: string; end_date: string; year: number };
    period?: "Fiscal" | "Calendar";
    employees?: Array<{ employee: string; include: number; [key: string]: unknown }>;
    departments?: Array<{ department: string; include: number; [key: string]: unknown }>;
    email_notes?: string;
  }>;
}

// Query parameters for filtering cycles
export interface GetAssessmentCyclesParams {
  department?: string[];
  search?: string;
  status?: string;
  year?: string;
}

// Transform API response to frontend format
const transformCycleFromAPI = (apiCycle: AssessmentCycleAPIResponse["message"][0]): AssessmentCycle => {
  const timePeriod = apiCycle.time_period || {};
  const departments = (apiCycle.departments || []).map((d) => d.department);
  const assessmentType = getAssessmentTypeFromDimension(apiCycle.dimension || "");

  return {
    id: apiCycle.name,
    name: apiCycle.cycle_name || apiCycle.name, // Use cycle_name if available, fallback to name
    startDate: timePeriod.start_date || "",
    endDate: timePeriod.end_date || "",
    type: transformCycleTypeFromAPI(apiCycle.assessment_type) as AssessmentCycle["type"],
    period: (apiCycle.period || "Fiscal") as AssessmentCycle["period"],
    status: (apiCycle.status as AssessmentCycle["status"]) || "Draft",
    departments,
    assessmentTypes: assessmentType ? [assessmentType] : [],
    participants: (apiCycle.employees || []).length,
    progress: apiCycle.progress ?? 0, // Use progress from API (0-100 or 0-1 format)
    owner: "HR Ops",
    linkedTeams: apiCycle.assessments_linked_count || 0,
    notes: apiCycle.email_notes,
  };
};

// Get assessment cycles with filters
export const getAssessmentCycles = async (params?: GetAssessmentCyclesParams): Promise<AssessmentCycle[]> => {
  try {
    const queryParams: Record<string, string | string[]> = {};
    if (params?.department?.length) queryParams.department = params.department;
    if (params?.search) queryParams.search = params.search;
    if (params?.status && params.status !== "All Status") queryParams.status = params.status;
    if (params?.year && params.year !== "All Years") queryParams.year = params.year;

    const response = await api.get<AssessmentCycleAPIResponse>(API_ENDPOINTS.ASSESSMENT_CYCLE.GET_CYCLES_WITH_DEPARTMENTS, {
      params: queryParams,
      paramsSerializer: { indexes: null }, // Serialize arrays as department[]=HR&department[]=Finance
    });

    return (response.data?.message || []).map(transformCycleFromAPI);
  } catch (error: unknown) {
    console.error("ERROR - getAssessmentCycles:", error);
    throw error;
  }
};
