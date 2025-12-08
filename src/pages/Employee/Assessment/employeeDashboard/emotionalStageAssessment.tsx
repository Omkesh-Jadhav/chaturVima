import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ResponsivePie } from "@nivo/pie";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import {
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_EMOTIONAL_STAGE_ASSESSMENT,
} from "@/data/assessmentDashboard";
import type { EmotionalStageAssessment } from "@/data/assessmentDashboard";
import { calculatePercentage, findMaxByKey } from "@/utils/assessmentUtils";
import { getStagePieColor, type StageDatum } from "@/utils/assessmentConfig";
import {
  STATUS_STYLES,
  ANIMATION_DELAYS,
  PIE_GRADIENTS,
  PIE_FILL,
} from "@/components/assessmentDashboard";
import { pieChartTheme } from "@/components/assessmentDashboard/pieChartTheme";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

interface EmotionalStageAssessmentProps {
  onStageSelect: (stage: EmotionalStageAssessment | null) => void;
  selectedStage: EmotionalStageAssessment | null;
}

const EmotionalStageAssessment = ({
  onStageSelect,
  selectedStage,
}: EmotionalStageAssessmentProps) => {
  const categoryDistribution = MOCK_CATEGORY_DISTRIBUTION;
  const emotionalStageAssessment = MOCK_EMOTIONAL_STAGE_ASSESSMENT;
  const maxScore = findMaxByKey(emotionalStageAssessment, "score");
  const dominantStage = emotionalStageAssessment.find(
    (s) => s.status === "Dominant"
  );

  useEffect(() => {
    if (!selectedStage && dominantStage) {
      onStageSelect(dominantStage);
    }
  }, []);

  const handleStageClick = (stage: EmotionalStageAssessment) => {
    const newSelection = selectedStage?.stage === stage.stage ? null : stage;
    onStageSelect(newSelection);
  };

  return (
    <div className="relative z-10 grid gap-6 xl:grid-cols-3">
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        className={`${CARD_BASE_CLASSES} xl:col-span-2`}
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
          {emotionalStageAssessment.map((stage, idx) => {
            const percentage = calculatePercentage(stage.score, maxScore);
            const statusStyle = stage.status
              ? STATUS_STYLES[stage.status]
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
                    {stage.status && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusStyle
                            ? `${statusStyle.text} ${statusStyle.bg}`
                            : ""
                        }`}
                      >
                        {stage.status}
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

      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="xs"
        className={`${CARD_BASE_CLASSES} p-5`}
      >
        <SectionHeader
          title="Stage Distribution"
          description="Current sentiment spread across stages"
        />
        <div className="mt-4 h-72">
          <ResponsivePie
            data={categoryDistribution}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.65}
            padAngle={2}
            cornerRadius={6}
            activeOuterRadiusOffset={10}
            colors={(d: StageDatum) => getStagePieColor(d.label)}
            enableArcLinkLabels={false}
            arcLabelsSkipAngle={10}
            arcLabel={(d: StageDatum) => `${d.value}%`}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2.2]],
            }}
            arcLabelsRadiusOffset={0.55}
            defs={PIE_GRADIENTS}
            fill={PIE_FILL}
            theme={pieChartTheme}
            animate
            motionConfig="gentle"
          />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default EmotionalStageAssessment;
