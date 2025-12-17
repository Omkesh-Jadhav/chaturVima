import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getSubStagesForStage } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import type { EmotionalStageAssessment } from "@/data/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4";

interface StageGaugeData extends EmotionalStageAssessment {
  count: number;
  scoreOnScale: number;
}

interface OrganizationalSubStagesBreakdownProps {
  selectedStage: StageGaugeData | null;
}

const OrganizationalSubStagesBreakdown = ({
  selectedStage,
}: OrganizationalSubStagesBreakdownProps) => {
  const selectedSubStages = useMemo(() => {
    if (!selectedStage) return [];
    const subStages = getSubStagesForStage(selectedStage.stage);

    // Count employees in each sub-stage
    return subStages.map((subStage) => {
      let count = 0;

      hrDashboardData.employee.forEach((employee) => {
        if (employee.stageDetails.stage === selectedStage.stage) {
          employee.stageDetails.subStageDetails.forEach((subStageDetail) => {
            if (subStageDetail.subStage.trim() === subStage.label) {
              count++;
            }
          });
        }
      });

      return {
        ...subStage,
        count,
      };
    });
  }, [selectedStage]);

  if (!selectedStage || selectedSubStages.length === 0) return null;

  const maxCount = Math.max(...selectedSubStages.map((s) => s.count), 1);

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
            Sub-stage distribution on 0-5 scale.
            <span className="font-bold text-gray-900">
              (click any stage above to view)
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {selectedSubStages.map((subStage, idx) => {
          // Calculate score on 0-5 scale
          const scoreOnScale =
            maxCount > 0 ? (subStage.count / maxCount) * 5 : 0;
          const scalePercentage = (scoreOnScale / 5) * 100;

          return (
            <motion.div
              key={subStage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: idx * 0.06,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ y: -2 }}
              className="group relative rounded-lg border-2 bg-white p-3 transition-all hover:shadow-md"
              style={{
                borderTopWidth: "3px",
                borderTopColor: selectedStage.color,
                borderColor: `${selectedStage.color}30`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${selectedStage.color}08, ${selectedStage.color}03)`,
                }}
              />

              <div className="relative z-10 space-y-2">
                {/* Sub-stage Name - Better Readable */}
                <h3 className="text-[11px] font-bold text-gray-900">
                  {subStage.label}
                </h3>

                {/* Score & Scale - Better Sizes */}
                <div className="space-y-1">
                  {/* Score on 0-5 Scale */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-medium">
                      Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-[20px] font-black"
                        style={{ color: selectedStage.color }}
                      >
                        {scoreOnScale.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400 font-bold">
                        /5.0
                      </span>
                    </div>
                  </div>

                  {/* 0-5 Scale Visualization */}
                  <div className="relative">
                    <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scalePercentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: idx * 0.08 + 0.2,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${selectedStage.color}, ${selectedStage.color}dd)`,
                          boxShadow: `0 0 8px ${selectedStage.color}30`,
                        }}
                      />
                      {/* Score indicator dot */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: idx * 0.08 + 1,
                          type: "spring",
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
                        style={{
                          left: `${scalePercentage}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundColor: selectedStage.color,
                        }}
                      />
                    </div>
                    {/* Scale markers */}
                    <div className="flex items-center justify-between mt-1">
                      {[0, 1, 2, 3, 4, 5].map((mark) => (
                        <div
                          key={mark}
                          className={`text-[10px] font-bold transition-colors ${
                            scoreOnScale >= mark
                              ? "text-gray-900"
                              : "text-gray-300"
                          }`}
                        >
                          {mark}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Count */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-sm text-gray-600 font-semibold">
                      {subStage.count}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      employees
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default OrganizationalSubStagesBreakdown;
