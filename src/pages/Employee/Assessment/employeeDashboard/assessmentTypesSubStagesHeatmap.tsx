import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { ASSESSMENT_TYPES, MOCK_SUB_STAGES } from "@/data/assessmentDashboard";
import { getStageColor } from "@/utils/assessmentConfig";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

// Mock data: Assessment type scores for each sub-stage
const MOCK_ASSESSMENT_SUB_STAGE_DATA: Record<string, Record<string, number>> = {
  "Employee Self Assessment": {
    "Excitement and Optimism": 92,
    "Confidence and Over-Reliance on Past Success": 78,
    "Initial Reality Check": 65,
    "Sustained Confidence with Subtle Complacency": 55,
    "Acknowledgment of Problems": 45,
    "Analyzing Causes": 52,
    "Partial Acceptance of Responsibility": 48,
    "Exploration of Solutions": 58,
    "Deep Frustration": 35,
    "Questioning Fundamentals": 42,
    "Openness to Change": 55,
    "Actionable Transformation": 62,
    "Stability and Alignment": 75,
    "Operational Predictability": 68,
    "Emerging Challenges": 58,
    "Dynamic Balance": 72,
  },
  "Manager Relationship Assessment": {
    "Excitement and Optimism": 88,
    "Confidence and Over-Reliance on Past Success": 72,
    "Initial Reality Check": 58,
    "Sustained Confidence with Subtle Complacency": 48,
    "Acknowledgment of Problems": 68,
    "Analyzing Causes": 75,
    "Partial Acceptance of Responsibility": 72,
    "Exploration of Solutions": 78,
    "Deep Frustration": 42,
    "Questioning Fundamentals": 48,
    "Openness to Change": 65,
    "Actionable Transformation": 72,
    "Stability and Alignment": 82,
    "Operational Predictability": 75,
    "Emerging Challenges": 68,
    "Dynamic Balance": 78,
  },
  "Department Assessment": {
    "Excitement and Optimism": 85,
    "Confidence and Over-Reliance on Past Success": 70,
    "Initial Reality Check": 62,
    "Sustained Confidence with Subtle Complacency": 52,
    "Acknowledgment of Problems": 55,
    "Analyzing Causes": 62,
    "Partial Acceptance of Responsibility": 58,
    "Exploration of Solutions": 65,
    "Deep Frustration": 38,
    "Questioning Fundamentals": 45,
    "Openness to Change": 58,
    "Actionable Transformation": 68,
    "Stability and Alignment": 78,
    "Operational Predictability": 72,
    "Emerging Challenges": 65,
    "Dynamic Balance": 75,
  },
  "Company Assessment": {
    "Excitement and Optimism": 80,
    "Confidence and Over-Reliance on Past Success": 65,
    "Initial Reality Check": 55,
    "Sustained Confidence with Subtle Complacency": 45,
    "Acknowledgment of Problems": 50,
    "Analyzing Causes": 58,
    "Partial Acceptance of Responsibility": 55,
    "Exploration of Solutions": 62,
    "Deep Frustration": 32,
    "Questioning Fundamentals": 38,
    "Openness to Change": 52,
    "Actionable Transformation": 65,
    "Stability and Alignment": 75,
    "Operational Predictability": 68,
    "Emerging Challenges": 60,
    "Dynamic Balance": 72,
  },
};

const STAGES = [
  "Honeymoon",
  "Self-Introspection",
  "Soul-Searching",
  "Steady-State",
] as const;

const AssessmentTypesSubStagesHeatmap = () => {
  const subStagesByStage = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      subStages: MOCK_SUB_STAGES[stage] || [],
    }));
  }, []);

  const stageColors = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage] = {
        main: getStageColor(stage, "main"),
        dark: getStageColor(stage, "dark"),
      };
      return acc;
    }, {} as Record<string, { main: string; dark: string }>);
  }, []);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="sm"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Sub-Stage Assessment Heatmap"
        description="Detailed breakdown of assessment performance across emotional sub-stages"
      />

      <div className="mt-4 space-y-4">
        {ASSESSMENT_TYPES.map((assessmentType, typeIdx) => (
          <motion.div
            key={assessmentType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: typeIdx * 0.05 }}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {assessmentType}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {subStagesByStage.map(({ stage, subStages }, stageIdx) => {
                const colors = stageColors[stage];
                const values = subStages.map(
                  (s) =>
                    MOCK_ASSESSMENT_SUB_STAGE_DATA[assessmentType]?.[s.label] ??
                    0
                );
                const stageAvg = Math.round(
                  values.reduce((sum, val) => sum + val, 0) / values.length
                );

                return (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: typeIdx * 0.05 + stageIdx * 0.02,
                    }}
                    className="bg-white rounded-md border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors.main }}
                        />
                        <span className="text-xs font-semibold text-gray-900">
                          {stage}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: colors.dark }}
                      >
                        {stageAvg}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      {subStages.map((subStage, subIdx) => {
                        const value =
                          MOCK_ASSESSMENT_SUB_STAGE_DATA[assessmentType]?.[
                            subStage.label
                          ] ?? 0;

                        return (
                          <div
                            key={subStage.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-[10px] text-gray-600 leading-tight line-clamp-1 flex-1">
                              {subStage.label}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{
                                    duration: 0.6,
                                    delay:
                                      typeIdx * 0.05 +
                                      stageIdx * 0.02 +
                                      subIdx * 0.01 +
                                      0.1,
                                    ease: "easeOut",
                                  }}
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor: colors.main,
                                  }}
                                />
                              </div>
                              <span
                                className="text-[10px] font-semibold w-8 text-right"
                                style={{ color: colors.dark }}
                              >
                                {value}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedContainer>
  );
};

export default AssessmentTypesSubStagesHeatmap;
