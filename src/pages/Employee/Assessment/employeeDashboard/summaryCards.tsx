import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common";
import { useUser } from "@/context/UserContext";
import { useSelectedAssessmentCycle } from "@/context/SelectedAssessmentCycleContext";
import {
  getEmployeeAssessmentSummary,
  type EmployeeAssessmentSummary,
} from "@/api/api-functions/employee-dashboard";

const SummaryCards = () => {
  const { user } = useUser();
  const { selectedCycle } = useSelectedAssessmentCycle();
  const [summary, setSummary] = useState<EmployeeAssessmentSummary | null>(null);
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
        selectedCycle?.cycleId
      );
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.employee_id, selectedCycle?.cycleId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const completed = summary?.completed_assessments ?? 0;
  const pending = summary?.pending_assessments ?? 0;
  const rate = summary?.completion_rate ?? 0;
  const completedDisplay = isLoading ? "..." : completed;
  const pendingDisplay = isLoading ? "..." : pending;
  const rateDisplay = isLoading ? "..." : `${rate.toFixed(1)}%`;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        variant="compact"
        label="Assessments Completed"
        value={completedDisplay}
        icon={CheckCircle}
        gradient="bg-gradient-to-br from-brand-teal to-brand-navy"
      />
      <MetricCard
        variant="compact"
        label="Pending Assessments"
        value={pendingDisplay}
        icon={AlertTriangle}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      <MetricCard
        variant="compact"
        label="Completion Rate"
        value={rateDisplay}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
      />
    </div>
  );
};

export default SummaryCards;
