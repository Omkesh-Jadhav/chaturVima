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
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

interface SubStagesBreakdownProps {
  selectedStage: EmotionalStageAssessment | null;
}

const SubStagesBreakdown = ({ selectedStage }: SubStagesBreakdownProps) => {
  const selectedSubStages = useMemo(() => {
    if (!selectedStage) return [];
    const subStages = getSubStagesForStage(selectedStage.stage);
    const totalWeight = subStages.reduce((sum, sub) => sum + sub.value, 0);
    return subStages.map((subStage) => ({
      ...subStage,
      score: (subStage.value / totalWeight) * selectedStage.score,
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {selectedSubStages.map((subStage, idx) => {
          const maxSubScore = Math.max(
            ...selectedSubStages.map((s) => s.score)
          );
          const scorePercentage = calculatePercentage(
            subStage.score,
            maxSubScore
          );

          return (
            <AnimatedContainer
              key={subStage.id}
              animation="scaleIn"
              transitionPreset="spring"
              delay={idx * 0.08}
              className="group relative rounded-lg border border-gray-200 bg-linear-to-br from-white to-gray-50/50 p-3.5 transition-all hover:shadow-md hover:border-gray-300 hover:scale-105 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5 leading-tight line-clamp-2">
                    {subStage.label}
                  </h3>
                </div>
              </div>

              <div className="mb-2.5">
                <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.1 + 0.3,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${selectedStage.color}, ${selectedStage.color}dd)`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <span
                  className="text-lg font-bold"
                  style={{ color: selectedStage.color }}
                >
                  {subStage.score.toFixed(1)}
                </span>
              </div>
            </AnimatedContainer>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default SubStagesBreakdown;
