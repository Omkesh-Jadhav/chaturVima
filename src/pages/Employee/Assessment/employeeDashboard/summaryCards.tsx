import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common";
import { useUser } from "@/context/UserContext";
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
  const [summary, setSummary] = useState<EmployeeAssessmentSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const data = await getEmployeeAssessmentSummary(employeeId);
        setSummary(data);
      } catch {
        setSummary({ ...defaultSummary, employee: employeeId });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [user?.employee_id]);

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
