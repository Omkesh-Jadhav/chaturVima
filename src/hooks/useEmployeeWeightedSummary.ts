import { useQuery } from "@tanstack/react-query";
import {
  getEmployeeWeightedAssessmentSummary,
  type EmployeeWeightedAssessmentSummary,
} from "@/api/api-functions/employee-dashboard";

const QUERY_KEY = ["employeeWeightedAssessmentSummary"] as const;

/**
 * Shared hook for employee weighted assessment summary.
 * Uses React Query to dedupe API calls - all dashboard components using this
 * hook with the same employeeId + cycleId will share a single request.
 */
export function useEmployeeWeightedSummary(
  employeeId: string | undefined,
  cycleId: string | undefined
) {
  const query = useQuery({
    queryKey: [...QUERY_KEY, employeeId ?? "", cycleId ?? ""],
    queryFn: () =>
      getEmployeeWeightedAssessmentSummary(employeeId!, cycleId ?? undefined),
    enabled: Boolean(employeeId),
    staleTime: 60 * 1000, // 1 minute - avoid refetch on every component mount
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  } as {
    data: EmployeeWeightedAssessmentSummary | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
}
