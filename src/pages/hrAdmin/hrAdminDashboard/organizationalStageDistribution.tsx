import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import {
  SectionHeader,
  FuelGauge,
  ANIMATION_DELAYS,
} from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { STAGE_ORDER } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import type { EmotionalStageAssessment } from "@/data/assessmentDashboard";
import { CARD_SHADOWS, CARD_BASE_CLASSES } from "@/utils/gaugeStyles";
import { sortStagesByScore } from "@/utils/assessmentUtils";

interface StageDistributionData extends EmotionalStageAssessment {
  count: number;
  scoreOnScale: number;
}

interface OrganizationalStageDistributionProps {
  onStageSelect?: (stage: StageDistributionData | null) => void;
  selectedStage?: StageDistributionData | null;
}

const OrganizationalStageDistribution = ({
  onStageSelect,
  selectedStage,
}: OrganizationalStageDistributionProps) => {
  const stageDistribution = useMemo(() => {
    const stageData: Record<string, { count: number; scoreSum: number }> =
      Object.fromEntries(
        STAGE_ORDER.map((stage) => [stage, { count: 0, scoreSum: 0 }])
      );

    hrDashboardData.employee.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in stageData) {
        stageData[stage].count++;
        stageData[stage].scoreSum += employee.stageDetails.score || 0;
      }
    });

    const total = Object.values(stageData).reduce(
      (sum, data) => sum + data.count,
      0
    );

    // Calculate average scores for each stage
    const avgScores = STAGE_ORDER.map((stage) => {
      const data = stageData[stage];
      return data.count > 0 ? data.scoreSum / data.count : 0;
    });
    const maxAvgScore = Math.max(...avgScores, 1); // Avoid division by zero

    // Calculate scoreOnScale for all stages first
    const stagesWithScores = STAGE_ORDER.map((stage, idx) => {
      const avgScore = avgScores[idx];
      const scoreOnScale = maxAvgScore > 0 ? (avgScore / maxAvgScore) * 5 : 0;
      return { stage, scoreOnScale };
    });

    // Find the maximum scoreOnScale
    const maxScoreOnScale = Math.max(
      ...stagesWithScores.map((s) => s.scoreOnScale),
      0
    );

    const distribution: StageDistributionData[] = STAGE_ORDER.map(
      (stage, idx) => {
        const data = stageData[stage];
        const count = data.count;
        // Calculate average score and normalize to 0-5 scale
        const avgScore = avgScores[idx];
        const scoreOnScale = maxAvgScore > 0 ? (avgScore / maxAvgScore) * 5 : 0;

        // Mark as Dominant if it has the highest scoreOnScale
        const status =
          scoreOnScale === maxScoreOnScale && maxScoreOnScale > 0
            ? "Dominant"
            : undefined;

        return {
          stage,
          count,
          score: scoreOnScale,
          scoreOnScale,
          color: getStagePieColor(stage),
          status,
        };
      }
    );

    // Sort by scoreOnScale (high to low)
    const sortedDistribution = sortStagesByScore(distribution, "scoreOnScale");

    return { distribution: sortedDistribution, total };
  }, []);

  const { distribution, total } = stageDistribution;

  const averageScore = useMemo(
    () =>
      distribution.reduce((acc, stage) => acc + stage.scoreOnScale, 0) /
      distribution.length,
    [distribution]
  );

  useEffect(() => {
    if (!selectedStage && onStageSelect) {
      const dominant = distribution.find((d) => d.status === "Dominant");
      if (dominant) onStageSelect(dominant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStageClick = (stage: StageDistributionData) => {
    if (onStageSelect) {
      onStageSelect(selectedStage?.stage === stage.stage ? null : stage);
    }
  };

  const handleCardHover = (
    e: React.MouseEvent<HTMLDivElement>,
    isSelected: boolean
  ) => {
    if (!isSelected) {
      e.currentTarget.style.boxShadow = CARD_SHADOWS.hover;
    }
  };

  const handleCardLeave = (
    e: React.MouseEvent<HTMLDivElement>,
    isSelected: boolean
  ) => {
    if (!isSelected) {
      e.currentTarget.style.boxShadow = CARD_SHADOWS.default;
    }
  };

  return (
    <div className="relative z-10 grid gap-6 xl:grid-cols-5">
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        className={`${CARD_BASE_CLASSES} xl:col-span-3`}
      >
        <SectionHeader
          title="Organizational Stage Distribution"
          description={
            <>
              Employee distribution across emotional stages (0-5 scale) -{" "}
              <span className="font-bold text-gray-900">
                {total} total employees
              </span>
            </>
          }
        />

        <div className="flex flex-col h-[calc(100%-80px)] gap-1.5">
          {distribution.map((stage, idx) => {
            const percentage = (stage.scoreOnScale / 5) * 100;
            const isSelected = selectedStage?.stage === stage.stage;
            const isDominant = stage.status === "Dominant";

            return (
              <AnimatedContainer
                key={stage.stage}
                animation="fadeInUp"
                delay={idx * ANIMATION_DELAYS.stageCard}
                transitionPreset="normal"
                onClick={() => handleStageClick(stage)}
                className={`group relative cursor-pointer transition-all duration-300 rounded-xl border-2 overflow-hidden flex-1 flex items-center ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-brand-teal border-brand-teal/40 bg-brand-teal/5"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  isDominant
                    ? "bg-gradient-to-r from-white via-gray-50/50 to-white"
                    : "bg-white"
                }`}
                style={{
                  boxShadow: isSelected
                    ? CARD_SHADOWS.selected
                    : CARD_SHADOWS.default,
                }}
                onMouseEnter={(e) => handleCardHover(e, isSelected)}
                onMouseLeave={(e) => handleCardLeave(e, isSelected)}
              >
                <div className="p-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-32 shrink-0">
                      <h3
                        className={`text-sm font-bold mb-1 ${
                          isDominant ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {stage.stage}
                      </h3>
                      {isDominant && (
                        <span className="inline-block text-[10px] font-bold uppercase text-brand-teal bg-brand-teal/15 px-2 py-0.5 rounded">
                          Dominant
                        </span>
                      )}
                    </div>

                    <div
                      className="flex-1 relative h-full min-h-[36px] bg-gray-100 rounded-full overflow-hidden"
                      style={{
                        boxShadow:
                          "inset 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 4px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-between px-1.5">
                        {[0, 1, 2, 3, 4, 5].map((mark) => (
                          <div
                            key={mark}
                            className="relative z-10 flex flex-col items-center"
                          >
                            <div
                              className={`w-0.5 h-3 rounded-full transition-all ${
                                stage.scoreOnScale >= mark
                                  ? "bg-gray-700"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold mt-0.5 ${
                                stage.scoreOnScale >= mark
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {mark}
                            </span>
                          </div>
                        ))}
                      </div>

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 1.2,
                          delay: idx * 0.08 + 0.3,
                          ease: [0.43, 0.13, 0.23, 0.96],
                        }}
                        className="absolute left-0 top-0 bottom-0 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${stage.color}, ${stage.color}cc)`,
                          boxShadow: `inset 0 1px 3px ${stage.color}40, 0 0 8px ${stage.color}30`,
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                          style={{ width: "60%", marginLeft: "20%" }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08 + 1.4, type: "spring" }}
                        className="absolute top-1/2 -translate-y-1/2 z-20"
                        style={{
                          left: `${percentage}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border-3 border-white"
                          style={{
                            backgroundColor: stage.color,
                            borderWidth: "3px",
                            boxShadow: `0 0 8px ${stage.color}60, 0 2px 4px rgba(0,0,0,0.2)`,
                          }}
                        />
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div
                          className="text-xl font-black leading-none"
                          style={{
                            color: stage.color,
                            textShadow: `0 0 6px ${stage.color}50`,
                          }}
                        >
                          {stage.scoreOnScale.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400 font-semibold mt-0.5">
                          /5.0
                        </div>
                      </div>
                      <div className="text-right border-l-2 border-gray-200 pl-4">
                        <div className="text-base font-bold text-gray-900">
                          {stage.count}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          Employees
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.03) 50%, transparent 100%)",
                    }}
                  />
                )}
              </AnimatedContainer>
            );
          })}
        </div>
      </AnimatedContainer>

      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="xs"
        className={`${CARD_BASE_CLASSES} p-5 xl:col-span-2`}
      >
        <SectionHeader
          title="Average Stage Score"
          description="Calculated from all stages (0-5 scale)"
        />
        <div className="py-1">
          <FuelGauge value={averageScore} />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default OrganizationalStageDistribution;
