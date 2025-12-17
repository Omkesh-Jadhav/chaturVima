import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { MOCK_EMOTIONAL_STAGE_ASSESSMENT } from "@/data/assessmentDashboard";
import type { EmotionalStageAssessment as EmotionalStageAssessmentType } from "@/data/assessmentDashboard";
import { calculatePercentage, findMaxByKey } from "@/utils/assessmentUtils";
import {
  STATUS_STYLES,
  ANIMATION_DELAYS,
} from "@/components/assessmentDashboard";
import { CARD_BASE_CLASSES } from "@/utils/gaugeStyles";
import Aura from "./aura";


interface EmotionalStageAssessmentProps {
  onStageSelect: (stage: EmotionalStageAssessmentType | null) => void;
  selectedStage: EmotionalStageAssessmentType | null;
}

const EmotionalStageAssessment = ({
  onStageSelect,
  selectedStage,
}: EmotionalStageAssessmentProps) => {
  const emotionalStageAssessment = MOCK_EMOTIONAL_STAGE_ASSESSMENT;
  const maxScore = findMaxByKey(emotionalStageAssessment, "score");

  // Find the stage with the highest score
  const maxScoreValue = Math.max(
    ...emotionalStageAssessment.map((stage) => stage.score),
    0
  );

  // Calculate status based on highest score (not percentage)
  const stagesWithStatus = emotionalStageAssessment.map((stage) => {
    // Mark as Dominant if it has the highest score
    const calculatedStatus =
      stage.score === maxScoreValue && maxScoreValue > 0
        ? "Dominant"
        : undefined;

    return { ...stage, calculatedStatus };
  });

  const dominantStage = stagesWithStatus.find(
    (s) => s.calculatedStatus === "Dominant"
  );

  useEffect(() => {
    if (!selectedStage && dominantStage) {
      onStageSelect(dominantStage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStageClick = (stage: EmotionalStageAssessmentType) => {
    const newSelection = selectedStage?.stage === stage.stage ? null : stage;
    onStageSelect(newSelection);
  };

  return (
    <div className="relative z-10 grid gap-6 xl:grid-cols-5">
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        className={`${CARD_BASE_CLASSES} xl:col-span-3`}
      >
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Emotional Stage Assessment
          </h2>
          <p className="text-xs text-gray-500">
            Current emotional state distribution
          </p>
        </div>

        <div className="space-y-1.5">
          {stagesWithStatus.map((stage, idx) => {
            const percentage = calculatePercentage(stage.score, maxScore);
            const statusStyle = stage.calculatedStatus
              ? STATUS_STYLES[stage.calculatedStatus]
              : null;
            const isSelected = selectedStage?.stage === stage.stage;

            return (
              <AnimatedContainer
                key={stage.stage}
                animation="fadeInUp"
                delay={idx * ANIMATION_DELAYS.stageCard}
                transitionPreset="normal"
                onClick={() => handleStageClick(stage)}
                className={`group rounded-lg border p-3 transition-all cursor-pointer ${
                  statusStyle
                    ? `${statusStyle.bg} border-gray-200`
                    : "bg-white border-gray-200"
                } ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-brand-teal shadow-md"
                    : "hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {stage.stage}
                    </h3>
                    <div
                      className="text-lg font-bold leading-none mt-0.5"
                      style={{ color: stage.color }}
                    >
                      {stage.score.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {stage.calculatedStatus === "Dominant" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusStyle
                            ? `${statusStyle.text} ${statusStyle.bg}`
                            : ""
                        }`}
                      >
                        Dominant
                      </span>
                    )}
                    <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.6,
                          delay: idx * 0.1 + 0.2,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </AnimatedContainer>

      <Aura data={emotionalStageAssessment} />
    </div>
  );
};

export default EmotionalStageAssessment;
