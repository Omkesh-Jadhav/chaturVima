import { useMemo } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common";
import {
  MOCK_PENDING_ASSESSMENTS,
  MOCK_COMPLETED_ASSESSMENTS,
} from "@/data/assessmentDashboard";
import { calculateCompletionRate } from "@/utils/assessmentUtils";

const SummaryCards = () => {
  const totalCompleted = MOCK_COMPLETED_ASSESSMENTS.length;
  const totalPending = MOCK_PENDING_ASSESSMENTS.length;
  const completionRate = useMemo(
    () => calculateCompletionRate(totalCompleted, totalPending),
    [totalCompleted, totalPending]
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        variant="compact"
        label="Assessments Completed"
        value={totalCompleted}
        icon={CheckCircle}
        gradient="bg-gradient-to-br from-brand-teal to-brand-navy"
      />
      <MetricCard
        variant="compact"
        label="Pending Assessments"
        value={totalPending}
        icon={AlertTriangle}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      <MetricCard
        variant="compact"
        label="Completion Rate"
        value={`${completionRate}%`}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
      />
    </div>
  );
};

export default SummaryCards;
