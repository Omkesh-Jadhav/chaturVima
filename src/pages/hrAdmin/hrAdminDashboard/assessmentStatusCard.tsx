import { useMemo } from "react";
import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { SummaryCard } from "@/components/assessmentDashboard/SummaryCard";
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
            <SummaryCard
                label="Total Assessments"
                value={totalAssessments}
                icon={CheckCircle}
                gradient="bg-linear-to-b from-brand-teal to-brand-navy"
            />
            <SummaryCard
                label="Pending Assessments"
                value={pendingAssessments}
                icon={AlertTriangle}
                gradient="bg-linear-to-b from-amber-500 to-orange-600"
            />
            <SummaryCard
                label="Completion Rate"
                value={`${completionRate}%`}
                icon={TrendingUp}
                gradient="bg-linear-to-b from-purple-500 to-indigo-600"
            />
        </div>
    );
};

export default AssessmentStatusCard;