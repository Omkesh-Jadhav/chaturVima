import { useMemo } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common";
import { calculateCompletionRate } from "@/utils/assessmentUtils";

// Dummy data for HR Admin dashboard
const MOCK_HR_ADMIN_DATA = {
    totalAssessments: 156,
    pendingAssessments: 42,
    completedAssessments: 114,
};

const AssessmentStatusCard = () => {
    const { totalAssessments, pendingAssessments, completedAssessments } = MOCK_HR_ADMIN_DATA;

    // Calculate completion rate
    const completionRate = useMemo(
        () => calculateCompletionRate(completedAssessments, pendingAssessments),
        [completedAssessments, pendingAssessments]
    );

    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
                variant="compact"
                label="Total Assessments"
                value={totalAssessments}
                icon={CheckCircle}
                gradient="bg-gradient-to-br from-brand-teal to-brand-navy"
            />
            <MetricCard
                variant="compact"
                label="Pending Assessments"
                value={pendingAssessments}
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

export default AssessmentStatusCard;