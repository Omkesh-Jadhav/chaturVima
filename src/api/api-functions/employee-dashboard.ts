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

// Employee cycle transition lab types (API returns a single entry per cycle)
export interface EmployeeCycleTransitionLabStage {
  stage: string;
  score: number;
  percentage: number;
}

export interface EmployeeCycleTransitionLabEntry {
  employee?: string;
  assessment_cycle: string;
  status: string;
  last_submitted_on: string;
  stages: EmployeeCycleTransitionLabStage[];
  dominant_stage: string;
}

/** API returns message as a single object for the selected cycle, not an array */
export interface EmployeeCycleTransitionLabResponse {
  message: EmployeeCycleTransitionLabEntry;
}

// Pending assessment cycles with questionnaires
export interface EmployeePendingCycle {
  assessment_cycle: string;
  cycle_name: string;
  status: string;
  dimension: string;
  start_date: string;
  end_date: string;
  questionnaires: { name: string }[];
}

export interface EmployeePendingCyclesResponse {
  message: EmployeePendingCycle[];
}

// Fetches employee assessment summary - GET request with employee and optional cycle_name
export const getEmployeeAssessmentSummary = async (
  employeeId: string,
  cycleName?: string
): Promise<EmployeeAssessmentSummary> => {
  const params: Record<string, string> = { employee: employeeId };
  if (cycleName?.trim()) params.cycle_name = cycleName.trim();

  const response = await api.get<EmployeeAssessmentSummaryResponse>(
    API_ENDPOINTS.EMPLOYEE_DASHBOARD.GET_EMPLOYEE_ASSESSMENT_SUMMARY,
    { params }
  );

  return response.data.message;
};

// Fetches employee weighted emotional assessment summary
export const getEmployeeWeightedAssessmentSummary = async (
  employeeId: string,
  cycleName?: string
): Promise<EmployeeWeightedAssessmentSummary> => {
  const params: Record<string, string> = { employee: employeeId };
  if (cycleName?.trim()) params.cycle_name = cycleName.trim();

  const response =
    await api.get<EmployeeWeightedAssessmentSummaryResponse>(
      API_ENDPOINTS.EMPLOYEE_DASHBOARD
        .GET_EMPLOYEE_WEIGHTED_ASSESSMENT_SUMMARY,
      { params }
    );

  return response.data.message;
};

// Fetches employee cycle transition lab data (single cycle entry; API returns one object)
export const getEmployeeCycleTransitionLab = async (
  employeeId: string,
  cycleName?: string
): Promise<EmployeeCycleTransitionLabEntry[]> => {
  const params: Record<string, string> = { employee: employeeId };
  if (cycleName?.trim()) params.cycle_name = cycleName.trim();

  const response = await api.get<EmployeeCycleTransitionLabResponse>(
    API_ENDPOINTS.EMPLOYEE_DASHBOARD.GET_EMPLOYEE_CYCLE_TRANSITION_LAB,
    { params }
  );

  const message = response.data.message;
  // API returns a single entry; normalize to array for UI (Transition Lab list)
  const entries = Array.isArray(message) ? message : [message];
  return entries;
};

// Fetches pending assessment cycles with questionnaires for an employee
export const getEmployeePendingCycles = async (
  employeeId: string,
  statuses: string[] = ["Active"]
): Promise<EmployeePendingCycle[]> => {
  const payload: { employee: string; status?: string[] } = { employee: employeeId };
  if (statuses.length > 0) {
    payload.status = statuses;
  }

  const response = await api.post<EmployeePendingCyclesResponse>(
    API_ENDPOINTS.EMPLOYEE_DASHBOARD.GET_EMPLOYEE_CYCLES_WITH_QUESTIONNAIRES,
    payload
  );

  return response.data?.message ?? [];
};
