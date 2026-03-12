import { useQuery } from "@tanstack/react-query";
import { employeeAssessmentHistory } from "@/api/api-functions/employee-dashboard";

const QUERY_KEY = ["employeeAssessmentHistory"] as const;

// Types for assessment history response
export interface AssessmentHistoryStage {
  stage: string;
  percentage: number;
}

export interface AssessmentHistoryItem {
  submission_id: string;
  questionnaire: string;
  status: string;
  last_submitted_on: string;
  dominant_stage: string;
  dominant_sub_stage: string;
  stages: AssessmentHistoryStage[];
}

export interface AssessmentHistoryCycle {
  assessment_cycle: string;
  cycle_name: string;
  status: string;
  start_date: string;
  end_date: string;
  last_submitted_on: string;
  dominant_stage: string;
  stages: AssessmentHistoryStage[];
  items: AssessmentHistoryItem[];
}

export interface AssessmentHistoryResponse {
  message: AssessmentHistoryCycle[];
}

/**
 * Hook for fetching employee assessment history data.
 * This provides item-level data needed for the heatmap based on questionnaire types.
 */
export function useEmployeeAssessmentHistory(
  employeeId: string | undefined,
  cycleId: string | undefined
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY, employeeId ?? "", cycleId ?? ""],
    queryFn: () => employeeAssessmentHistory(employeeId!, cycleId!),
    enabled: Boolean(employeeId && cycleId),
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    data: query.data as AssessmentHistoryResponse | null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
