import { useMemo } from "react";
import { Activity, Award, Users, Target } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { Badge } from "@/components/ui";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { MOCK_SUB_STAGES } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const DUMMY_DATA = {
  overallScore: 3,
  totalEmployees: 156,
  stageDistribution: {
    "Steady-State": 45,
    "Self-Introspection": 53,
    "Soul-Searching": 38,
    Honeymoon: 20,
  },
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "Steady-State": "Excellent organizational health",
  "Self-Introspection": "Good organizational health",
  "Soul-Searching": "Moderate organizational health",
  Honeymoon: "Needs improvement",
  Critical: "Requires immediate attention",
};

const getStageFromScore = (score: number) => {
  const stageMap = [
    { threshold: 4.5, stage: "Steady-State" },
    { threshold: 3.5, stage: "Self-Introspection" },
    { threshold: 2.5, stage: "Soul-Searching" },
    { threshold: 1.5, stage: "Honeymoon" },
  ];

  const matched = stageMap.find(({ threshold }) => score >= threshold);
  const stage = matched?.stage || "Critical";

  return {
    stage,
    description: STAGE_DESCRIPTIONS[stage],
    hexColor: stage === "Critical" ? "#EF4444" : getStagePieColor(stage),
  };
};

const OverallOrganizationalHealthScore = () => {
  const { overallScore, totalEmployees } = DUMMY_DATA;
  const stageInfo = getStageFromScore(overallScore);
  const scorePercentage = (overallScore / 5) * 100;

  // Calculate sub-stages distribution for the current stage
  const subStageDistribution = useMemo(() => {
    const currentStage = stageInfo.stage;
    const subStages = MOCK_SUB_STAGES[currentStage] || [];

    // Initialize all sub-stages with 0 count
    const distribution: Record<string, number> = {};
    subStages.forEach((subStage) => {
      distribution[subStage.label] = 0;
    });

    // Count employees in each sub-stage for the current stage
    hrDashboardData.employee.forEach((employee) => {
      if (employee.stageDetails.stage === currentStage) {
        employee.stageDetails.subStageDetails.forEach((subStageDetail) => {
          const subStageLabel = subStageDetail.subStage.trim();
          if (distribution.hasOwnProperty(subStageLabel)) {
            distribution[subStageLabel]++;
          }
        });
      }
    });

    return distribution;
  }, [stageInfo.stage]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Overall Organizational Health Score"
        description={`Calculated from ${totalEmployees} employees`}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Display */}
        <div className="relative flex flex-col justify-center p-3 bg-linear-to-br from-brand-teal/10 via-brand-teal/5 to-brand-navy/10 rounded-xl border-2 border-brand-teal/20 shadow-sm hover:shadow-md hover:border-brand-teal/30 transition-all">
          <div className="absolute top-2 right-2 p-1 rounded-lg bg-brand-teal/10">
            <Activity className="h-3.5 w-3.5 text-brand-teal/60" />
          </div>
          <div className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-2">
            Overall Score
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-4xl font-bold bg-linear-to-r from-brand-teal to-brand-navy bg-clip-text text-transparent">
              {overallScore.toFixed(1)}
            </div>
            <div className="text-sm font-medium text-gray-500">/ 5.0</div>
          </div>
          <div className="w-full space-y-1.5">
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-brand-teal to-brand-navy transition-all duration-1000 rounded-full"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Health Level
              </span>
              <span className="text-xs font-semibold text-brand-teal">
                {scorePercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Stage Classification */}
        <div
          className="relative flex flex-col justify-center p-3 rounded-xl border-2 shadow-sm hover:shadow-md transition-all"
          style={{
            background: `linear-gradient(135deg, ${stageInfo.hexColor}08, ${stageInfo.hexColor}03)`,
            borderColor: `${stageInfo.hexColor}40`,
          }}
        >
          <div
            className="absolute top-2 right-2 p-1 rounded-lg shadow-sm"
            style={{ backgroundColor: `${stageInfo.hexColor}15` }}
          >
            <Award
              className="h-3.5 w-3.5"
              style={{ color: `${stageInfo.hexColor}99` }}
            />
          </div>
          <div
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: stageInfo.hexColor }}
          >
            Current Stage
          </div>
          <Badge
            variant="default"
            size="md"
            className="border-2 font-bold mb-3 w-fit text-sm px-3 py-1"
            style={{
              backgroundColor: `${stageInfo.hexColor}15`,
              color: stageInfo.hexColor,
              borderColor: `${stageInfo.hexColor}40`,
            }}
          >
            {stageInfo.stage}
          </Badge>
          <p className="text-xs font-medium text-gray-700 leading-relaxed">
            {stageInfo.description}
          </p>
        </div>

        {/* Sub-Stages Distribution */}
        <div className="relative flex flex-col justify-center p-3 bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-2 right-2 p-1 rounded-lg bg-purple-100/50">
            <Target className="h-3.5 w-3.5 text-purple-500/60" />
          </div>
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
            Sub-Stages Distribution
          </div>
          <div className="space-y-2">
            {Object.entries(subStageDistribution).map(([subStage, count]) => {
              const hexColor = stageInfo.hexColor;
              const totalInStage = Object.values(subStageDistribution).reduce(
                (sum, c) => sum + c,
                0
              );
              const percentage =
                totalInStage > 0 ? (count / totalInStage) * 100 : 0;

              return (
                <div key={subStage} className="flex items-center gap-2">
                  <div
                    className="p-1 rounded border shrink-0"
                    style={{
                      backgroundColor: `${hexColor}15`,
                      borderColor: `${hexColor}40`,
                    }}
                  >
                    <Users
                      className="h-3 w-3 shrink-0"
                      style={{ color: hexColor }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">
                        {count} employees
                      </span>
                      <span className="text-[10px] text-gray-600 line-clamp-1">
                        {subStage}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: hexColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default OverallOrganizationalHealthScore;
