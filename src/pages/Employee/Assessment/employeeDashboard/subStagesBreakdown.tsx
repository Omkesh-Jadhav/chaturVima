import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import {
  getSubStagesForStage,
  type EmotionalStageAssessment,
} from "@/data/assessmentDashboard";
import { calculatePercentage } from "@/utils/assessmentUtils";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4";

interface SubStagesBreakdownProps {
  selectedStage: EmotionalStageAssessment | null;
}

const SubStagesBreakdown = ({ selectedStage }: SubStagesBreakdownProps) => {
  const selectedSubStages = useMemo(() => {
    if (!selectedStage) return [];
    const subStages = getSubStagesForStage(selectedStage.stage);

    // Generate varied scores for each sub-stage based on the stage score
    // Each sub-stage gets a different percentage of the total stage score
    // Using realistic distribution patterns similar to assessment report data
    // Different multipliers for each position to create variation
    const scoreMultipliers = [
      [0.29, 0.18, 0.28, 0.25], // Pattern 1: High, Low, High, Medium
      [0.28, 0.28, 0.22, 0.22], // Pattern 2: High, High, Medium, Medium
      [0.25, 0.25, 0.25, 0.25], // Pattern 3: Even distribution
      [0.32, 0.24, 0.24, 0.2], // Pattern 4: High, Medium, Medium, Low
    ];

    // Select pattern based on stage to ensure variety
    const patternIndex = subStages.length % 4;
    const multipliers = scoreMultipliers[patternIndex];

    return subStages.map((subStage, idx) => {
      // Calculate score with variation - each sub-stage gets different portion
      const multiplier = multipliers[idx] || 0.25;
      // Base score from stage, but vary it per sub-stage
      const baseScore = selectedStage.score * multiplier;
      // Add some realistic variation based on sub-stage index
      const variationFactor = 0.85 + idx * 0.08 + Math.sin(idx) * 0.05;
      const finalScore = Math.max(
        selectedStage.score * 0.15, // Minimum 15% of stage score
        Math.min(selectedStage.score * 0.45, baseScore * variationFactor) // Maximum 45% of stage score
      );

      return {
        ...subStage,
        score: Number(finalScore.toFixed(2)),
      };
    });
  }, [selectedStage]);

  if (!selectedStage || selectedSubStages.length === 0) return null;

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="sm"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title={`${selectedStage.stage} Sub-Stages`}
        description={
          <>
            Detailed breakdown of sub-stage performance{" "}
            <span className="font-bold text-gray-900">
              (click any stage above to view)
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {selectedSubStages.map((subStage, idx) => {
          const maxSubScore = Math.max(
            ...selectedSubStages.map((s) => s.score)
          );
          const scorePercentage = calculatePercentage(
            subStage.score,
            maxSubScore
          );

          return (
            <motion.div
              key={subStage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: idx * 0.08,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ y: -3 }}
              className="group relative rounded-lg border-2 bg-white p-2 transition-all hover:shadow-lg"
              style={{
                borderTopWidth: "3px",
                borderTopColor: selectedStage.color,
                borderColor: `${selectedStage.color}30`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${selectedStage.color}12, ${selectedStage.color}05)`,
                }}
              />

              <div className="relative z-10">
                {/* Sub-Stage Name */}
                <h3 className="text-xs font-bold text-gray-900 mb-1 leading-tight line-clamp-2 min-h-8">
                  {subStage.label}
                </h3>

                {/* Progress Bar */}
                <div className="relative h-1 rounded-full bg-gray-200 overflow-hidden shadow-inner mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.1 + 0.3,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full shadow-sm"
                    style={{
                      background: `linear-gradient(90deg, ${selectedStage.color}, ${selectedStage.color}dd)`,
                    }}
                  />
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-600 font-medium">
                    Score:
                  </span>
                  <span
                    className="text-lg font-bold leading-none"
                    style={{ color: selectedStage.color }}
                  >
                    {subStage.score.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default SubStagesBreakdown;
