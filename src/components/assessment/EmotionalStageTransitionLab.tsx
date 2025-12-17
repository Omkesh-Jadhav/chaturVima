/**
 * Emotional Stage Transition Lab Component
 *
 * Displays historical assessment data showing transitions between emotional stages
 * across multiple assessment cycles.
 */
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { formatDisplayDate } from "@/utils/dateUtils";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { STAGE_ORDER } from "@/data/assessmentDashboard";

export type HistoricalAssessment = {
  id: string;
  title: string;
  date: string;
  dominantStage: string;
  stageScores: {
    Honeymoon: number;
    "Self-Introspection": number;
    "Soul-Searching": number;
    "Steady-State": number;
  };
  score: number;
};

// Mock historical assessments data - Based on Emotional Stage Assessment format
const MOCK_HISTORICAL_ASSESSMENTS: HistoricalAssessment[] = [
  {
    id: "hist-1",
    title: "Honeymoon Calibration Pulse",
    date: "2025-11-08",
    dominantStage: "Honeymoon",
    stageScores: {
      Honeymoon: 153.73,
      "Self-Introspection": 122.47,
      "Soul-Searching": 121.07,
      "Steady-State": 118.73,
    },
    score: 516,
  },
  {
    id: "hist-2",
    title: "Self-Introspection Depth Scan",
    date: "2025-10-28",
    dominantStage: "Self-Introspection",
    stageScores: {
      Honeymoon: 128.45,
      "Self-Introspection": 145.32,
      "Soul-Searching": 112.18,
      "Steady-State": 98.65,
    },
    score: 484.6,
  },
  {
    id: "hist-3",
    title: "Q3 Performance Review",
    date: "2025-09-10",
    dominantStage: "Honeymoon",
    stageScores: {
      Honeymoon: 142.88,
      "Self-Introspection": 118.25,
      "Soul-Searching": 105.42,
      "Steady-State": 95.33,
    },
    score: 461.88,
  },
];

interface EmotionalStageTransitionLabProps {
  historicalAssessments?: HistoricalAssessment[];
}

const EmotionalStageTransitionLab = ({
  historicalAssessments = MOCK_HISTORICAL_ASSESSMENTS,
}: EmotionalStageTransitionLabProps) => {
  // Limit to first 3 assessments and reverse to show latest first
  const displayedAssessments = historicalAssessments.slice(0, 3).reverse();

  // Don't render if less than 2 assessments
  if (displayedAssessments.length < 2) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            Complete at least 2 assessments to view transition analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assessment Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {displayedAssessments.map((assessment, assessmentIdx) => {
          const isCurrent = assessmentIdx === 0;

          // Get stage scores in order
          const stageScores = STAGE_ORDER.map((stage) => {
            const score = assessment.stageScores[stage];
            return {
              stage,
              score,
              color: getStagePieColor(stage),
              isDominant: stage === assessment.dominantStage,
            };
          });

          const maxScore = Math.max(...stageScores.map((s) => s.score));

          return (
            <div
              key={assessment.id}
              className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm overflow-hidden"
            >
              {/* Badge - Sticker style with colors */}
              {isCurrent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-3 right-3 rounded-md bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg z-10"
                >
                  Current
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-3 right-3 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg z-10"
                >
                  Previous
                </motion.div>
              )}

              {/* Assessment Header */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-16">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {assessment.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDisplayDate(assessment.date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Cards - Similar to Emotional Stage Assessment */}
              <div className="space-y-2">
                {stageScores.map((stageData, idx) => {
                  const percentage = (stageData.score / maxScore) * 100;

                  return (
                    <motion.div
                      key={stageData.stage}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: assessmentIdx * 0.1 + idx * 0.05,
                      }}
                      className={`rounded-lg border p-3 ${
                        stageData.isDominant
                          ? "border-2 border-gray-300 shadow-md"
                          : "border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {stageData.stage}
                          </h4>
                          <div
                            className="text-lg font-bold leading-none mt-0.5"
                            style={{ color: stageData.color }}
                          >
                            {stageData.score.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {stageData.isDominant && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                              style={{
                                color: stageData.color,
                              }}
                            >
                              Dominant
                            </span>
                          )}
                          <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{
                                delay: assessmentIdx * 0.1 + idx * 0.05 + 0.2,
                                duration: 0.6,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: stageData.color }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionalStageTransitionLab;
