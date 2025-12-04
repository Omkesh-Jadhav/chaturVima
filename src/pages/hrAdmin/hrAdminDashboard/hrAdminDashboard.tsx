import AssessmentStatusCard from "./assessmentStatusCard";
import DepartmentDistribution from "./departmentDistribution";
import StageDistributionHealth from "./stageDistributionHealth";
import SubStageDistributionHealth from "./subStageDistributionHealth";
import {
  AnimatedBackground,
  BACKGROUND_COLORS,
} from "@/components/assessmentDashboard";

const HrAdminDashboard = () => {
  return (
    <div className="space-y-6 relative">
      <AnimatedBackground colors={[...BACKGROUND_COLORS]} />
      <div className="relative z-10">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            HR Admin Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Comprehensive overview of organizational health, assessments, and
            employee distribution.
          </p>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <AssessmentStatusCard />
        <StageDistributionHealth />
        <SubStageDistributionHealth />
        <DepartmentDistribution />
      </div>
    </div>
  );
};

export default HrAdminDashboard;
