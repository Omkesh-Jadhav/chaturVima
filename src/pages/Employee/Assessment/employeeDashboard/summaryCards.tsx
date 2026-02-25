import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common";
import { useUser } from "@/context/UserContext";
import { useSelectedAssessmentCycle } from "@/context/SelectedAssessmentCycleContext";
import {
  getEmployeeAssessmentSummary,
  type EmployeeAssessmentSummary,
} from "@/api/api-functions/employee-dashboard";

const defaultSummary: EmployeeAssessmentSummary = {
  employee: "",
  total_assessments: 0,
  completed_assessments: 0,
  pending_assessments: 0,
  completion_rate: 0.0,
};

const SummaryCards = () => {
  const { user } = useUser();
  const { selectedCycle } = useSelectedAssessmentCycle();
  const [summary, setSummary] = useState<EmployeeAssessmentSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    const employeeId = user?.employee_id;
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getEmployeeAssessmentSummary(
        employeeId,
        selectedCycle?.cycleName
      );
      setSummary(data);
    } catch {
      setSummary({ ...defaultSummary, employee: employeeId });
    } finally {
      setIsLoading(false);
    }
  }, [user?.employee_id, selectedCycle?.cycleName]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const displayValue = (value: number | string) => (isLoading ? "..." : value);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        variant="compact"
        label="Assessments Completed"
        value={displayValue(summary.completed_assessments)}
        icon={CheckCircle}
        gradient="bg-gradient-to-br from-brand-teal to-brand-navy"
      />
      <MetricCard
        variant="compact"
        label="Pending Assessments"
        value={displayValue(summary.pending_assessments)}
        icon={AlertTriangle}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      <MetricCard
        variant="compact"
        label="Completion Rate"
        value={displayValue(`${summary.completion_rate.toFixed(1)}%`)}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
      />
    </div>
  );
};

export default SummaryCards;
