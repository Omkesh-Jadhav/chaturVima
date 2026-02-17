import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { MOCK_EMOTIONAL_STAGE_ASSESSMENT } from "@/data/assessmentDashboard";
import type { EmotionalStageAssessment as EmotionalStageAssessmentType } from "@/data/assessmentDashboard";
import {
  calculatePercentage,
  findMaxByKey,
  sortStagesByScore,
} from "@/utils/assessmentUtils";
import {
  STATUS_STYLES,
  ANIMATION_DELAYS,
} from "@/components/assessmentDashboard";
import { CARD_BASE_CLASSES } from "@/utils/gaugeStyles";
import Aura from "./aura";
import { useUser } from "@/context/UserContext";
import {
  getEmployeeWeightedAssessmentSummary,
} from "@/api/api-functions/employee-dashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";

interface EmotionalStageAssessmentProps {
  onStageSelect: (stage: EmotionalStageAssessmentType | null) => void;
  onStageClick?: (stage: EmotionalStageAssessmentType | null) => void;
  selectedStage: EmotionalStageAssessmentType | null;
}

const EmotionalStageAssessment = ({
  onStageSelect,
  onStageClick,
  selectedStage,
}: EmotionalStageAssessmentProps) => {
  const { user } = useUser();
  const [emotionalStageAssessment, setEmotionalStageAssessment] =
    useState<EmotionalStageAssessmentType[]>(MOCK_EMOTIONAL_STAGE_ASSESSMENT);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        const data = await getEmployeeWeightedAssessmentSummary(employeeId);
        const stages: EmotionalStageAssessmentType[] = data.stages.map(
          (stage) => ({
            stage: stage.stage,
            score: stage.score,
            color: getStagePieColor(stage.stage as any),
          })
        );

        setEmotionalStageAssessment(stages);
      } catch (error) {
        // If API fails, fall back to mock data
        console.error(
          "Failed to fetch employee weighted assessment summary:",
          error
        );
        setEmotionalStageAssessment(MOCK_EMOTIONAL_STAGE_ASSESSMENT);
      }
    };

    fetchData();
  }, [user?.employee_id]);

  const maxScore = findMaxByKey(emotionalStageAssessment, "score");

  // Find the stage with the highest score
  const maxScoreValue = Math.max(
    ...emotionalStageAssessment.map((stage) => stage.score),
    0
  );

  // Calculate status based on highest score (not percentage)
  const stagesWithStatus = emotionalStageAssessment.map((stage) => {
    // Mark as Dominant if it has the highest score
    const calculatedStatus: "Dominant" | undefined =
      stage.score === maxScoreValue && maxScoreValue > 0
        ? "Dominant"
        : undefined;

    return { ...stage, calculatedStatus };
  });

  // Sort by score (high to low)
  const sortedStagesWithStatus = sortStagesByScore<
    EmotionalStageAssessmentType & { calculatedStatus?: "Dominant" }
  >(stagesWithStatus, "score");

  const dominantStage = sortedStagesWithStatus.find(
    (s) => s.calculatedStatus === "Dominant"
  );

  useEffect(() => {
    if (!selectedStage && dominantStage) {
      onStageSelect(dominantStage);
    }
  }, [dominantStage, onStageSelect, selectedStage]);

  const handleStageClick = (stage: EmotionalStageAssessmentType) => {
    // Always select the clicked stage (no toggle-off) so user can immediately
    // see the corresponding sub-stages.
    onStageSelect(stage);
    onStageClick?.(stage);
  };

  return (
    <div className="relative z-10 grid gap-6 xl:grid-cols-5">
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        className={`${CARD_BASE_CLASSES} xl:col-span-3`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
              Emotional Stage Assessment
            </h2>
            <p className="mt-0.5 text-xs text-gray-600">
              Click a stage to show its sub-stages.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 ring-1 ring-amber-200">
              👇 Click a stage to view sub-stages
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {sortedStagesWithStatus.map((stage, idx) => {
            const percentage = calculatePercentage(stage.score, maxScore);
            const statusStyle =
              stage.calculatedStatus === "Dominant"
                ? STATUS_STYLES["Dominant"]
                : null;
            const isSelected = selectedStage?.stage === stage.stage;

            return (
              <AnimatedContainer
                key={stage.stage}
                animation="fadeInUp"
                delay={idx * ANIMATION_DELAYS.stageCard}
                transitionPreset="normal"
                onClick={() => handleStageClick(stage)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStageClick(stage);
                  }
                }}
                className={`group relative overflow-hidden rounded-xl border-2 p-2.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-brand-teal/40 bg-brand-teal/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* subtle sheen */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/60 blur-xl" />
                  <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-white/40 blur-xl" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div
                      className="h-9 w-9 shrink-0 rounded-xl border border-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${stage.color}22, ${stage.color}10)`,
                      }}
                    >
                      <div
                        className="mx-auto mt-3 h-4 w-4 rounded-full shadow-sm"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-extrabold text-gray-900">
                          {stage.stage}
                        </h3>
                        {stage.calculatedStatus === "Dominant" && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                              statusStyle
                                ? `${statusStyle.text} ${statusStyle.bg}`
                                : "bg-amber-50 text-amber-900"
                            }`}
                          >
                            Dominant
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-gray-900 ring-1 ring-gray-200"
                          title="Final value"
                        >
                          <span className="text-[11px] font-extrabold text-gray-600">
                            Final Value
                          </span>
                          <span
                            className="text-base font-black leading-none"
                            style={{ color: stage.color }}
                          >
                            {stage.score.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="relative h-2 w-24 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: idx * 0.08 + 0.2,
                          ease: [0.43, 0.13, 0.23, 0.96],
                        }}
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
                          boxShadow: `0 0 10px ${stage.color}30`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </AnimatedContainer>

      <Aura
        data={emotionalStageAssessment.map((s) => ({
          stage: s.stage,
          value: s.score,
          color: s.color,
          status: s.status,
        }))}
      />
    </div>
  );
};

export default EmotionalStageAssessment;
