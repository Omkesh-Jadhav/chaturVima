import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer, Tooltip } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import {
  ASSESSMENT_TYPES,
  MOCK_SUB_STAGES,
  MOCK_EMOTIONAL_INTENSITY_HEATMAP,
} from "@/data/assessmentDashboard";
import { getStageColor } from "@/utils/assessmentConfig";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

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

  // Group stages in pairs for quadrant layout
  const stagePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < subStagesByStage.length; i += 2) {
      pairs.push(subStagesByStage.slice(i, i + 2));
    }
    return pairs;
  }, [subStagesByStage]);

  const getSubStageValue = (
    assessmentType: string,
    stage: string,
    subStageIndex: number,
    totalSubStages: number
  ): number => {
    const stageData = MOCK_EMOTIONAL_INTENSITY_HEATMAP.find(
      (r) => r.stage === stage
    );
    if (!stageData) return 0;

    const stageValue =
      stageData.values[assessmentType as keyof typeof stageData.values] ?? 0;

    const baseValue = stageValue / totalSubStages;
    const variation = [1.2, 0.9, 1.1, 0.8][subStageIndex % 4] || 1;
    return Math.min(100, Math.round(baseValue * variation));
  };

  const headerColors: Record<
    string,
    { bg: string; border: string; dot: string }
  > = useMemo(() => {
    const lightToDarkMap: Record<string, string> = {
      Honeymoon: "#FFE5B4",
      "Self-Introspection": "#C9C5E8",
      "Soul-Searching": "#FFC4B8",
      "Steady-State": "#B8E8E3",
    };
    return STAGES.reduce((acc, stage) => {
      const main = getStageColor(stage, "main");
      const light = getStageColor(stage, "light");
      const dark = getStageColor(stage, "dark");
      acc[stage] = {
        bg: `linear-gradient(135deg, ${light}, ${
          lightToDarkMap[stage] || light
        })`,
        border: main,
        dot: `linear-gradient(135deg, ${main}, ${dark})`,
      };
      return acc;
    }, {} as Record<string, { bg: string; border: string; dot: string }>);
  }, []);

  const cellGradients: Record<string, string> = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      const main = getStageColor(stage, "main");
      const dark = getStageColor(stage, "dark");
      acc[stage] = `linear-gradient(135deg, ${main}, ${dark})`;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const shadowColors: Record<string, string> = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage] = getStageColor(stage, "main");
      return acc;
    }, {} as Record<string, string>);
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

      <div className="mt-6 space-y-8">
        {stagePairs.map((pair, pairIdx) => (
          <motion.div
            key={pairIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pairIdx * 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {pair.map(({ stage, subStages }, stageIdx) => {
              const headerColor = headerColors[stage];
              const cellGradient = cellGradients[stage];
              const shadowColor = shadowColors[stage];

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: pairIdx * 0.15 + stageIdx * 0.08 }}
                  className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{
                    borderColor: `${headerColor.border}25`,
                    boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px ${headerColor.border}15`,
                  }}
                >
                  {/* Stage Header */}
                  <div
                    className="flex items-center justify-center p-3.5 rounded-lg border border-gray-200 mb-4 shadow-sm"
                    style={{
                      borderColor: `${headerColor.border}35`,
                      background: headerColor.bg,
                      boxShadow: `0 2px 8px ${headerColor.border}15`,
                    }}
                  >
                    <span className="text-sm font-bold text-gray-900">
                      {stage}
                    </span>
                  </div>

                  {/* Sub-Stage Headers */}
                  <div className="mb-3 overflow-x-auto scrollbar-hide">
                    <div
                      className="grid w-full"
                      style={{
                        gridTemplateColumns: `140px repeat(${subStages.length}, minmax(120px, 1fr))`,
                        gap: "8px",
                      }}
                    >
                      <div className="flex items-center justify-start pl-3 text-xs font-bold text-gray-700 bg-gray-50 rounded-lg py-2.5 shrink-0 shadow-sm border border-gray-200">
                        Assessment
                      </div>
                      {subStages.map((subStage) => (
                        <Tooltip
                          key={subStage.id}
                          content={subStage.label}
                          position="top"
                        >
                          <div
                            className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md min-h-[60px] overflow-hidden w-full"
                            style={{
                              background: `linear-gradient(135deg, ${headerColor.border}10, ${headerColor.border}05)`,
                              borderColor: `${headerColor.border}25`,
                            }}
                          >
                            <span className="text-[10px] font-semibold text-gray-800 text-center leading-tight break-words px-1 w-full line-clamp-3">
                              {subStage.label}
                            </span>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Assessment Type Rows */}
                  <div className="space-y-2 overflow-x-auto scrollbar-hide">
                    {ASSESSMENT_TYPES.map((assessmentType, rowIdx) => {
                      return (
                        <motion.div
                          key={assessmentType}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              pairIdx * 0.15 + stageIdx * 0.08 + rowIdx * 0.05,
                          }}
                          className="grid items-center w-full"
                          style={{
                            gridTemplateColumns: `140px repeat(${subStages.length}, minmax(120px, 1fr))`,
                            gap: "8px",
                          }}
                        >
                          <Tooltip
                            content={assessmentType}
                            position="right"
                            className="shrink-0"
                          >
                            <div className="flex items-center p-3 rounded-lg border border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 shadow-sm hover:shadow-md transition-all">
                              <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">
                                {assessmentType}
                              </span>
                            </div>
                          </Tooltip>

                          {subStages.map((subStage, cellIdx) => {
                            const value = getSubStageValue(
                              assessmentType,
                              stage,
                              cellIdx,
                              subStages.length
                            );
                            const isZero = value === 0;

                            return (
                              <motion.div
                                key={`${assessmentType}-${subStage.id}`}
                                whileHover={{ scale: 1.01 }}
                                className={`relative rounded-lg transition-all hover:shadow-lg group overflow-hidden w-full max-w-full ${
                                  isZero
                                    ? "border border-gray-200 bg-white"
                                    : "bg-gray-50"
                                }`}
                                style={
                                  !isZero
                                    ? {
                                        border: `1px solid ${shadowColor}30`,
                                        boxShadow: `0 2px 8px ${shadowColor}20, 0 1px 2px rgba(0,0,0,0.05)`,
                                      }
                                    : {
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                      }
                                }
                              >
                                {!isZero && (
                                  <motion.div
                                    className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                                    style={{
                                      background: cellGradient,
                                      height: `${value}%`,
                                    }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${value}%` }}
                                    transition={{
                                      duration: 0.8,
                                      delay:
                                        pairIdx * 0.15 +
                                        stageIdx * 0.08 +
                                        rowIdx * 0.05 +
                                        cellIdx * 0.03 +
                                        0.2,
                                      ease: "easeOut",
                                    }}
                                  />
                                )}

                                <div className="relative z-10 flex items-center justify-center min-h-[55px] px-3 py-2.5">
                                  <span
                                    className={`text-sm font-bold transition-all ${
                                      isZero
                                        ? "text-gray-400"
                                        : value > 50
                                        ? "text-white drop-shadow-lg"
                                        : "text-gray-900 drop-shadow-sm"
                                    }`}
                                    style={
                                      !isZero && value > 50
                                        ? {
                                            textShadow:
                                              "0 2px 4px rgba(0,0,0,0.5)",
                                          }
                                        : !isZero
                                        ? {
                                            textShadow:
                                              "0 1px 2px rgba(255,255,255,0.8)",
                                          }
                                        : {}
                                    }
                                  >
                                    {value}%
                                  </span>
                                </div>

                                {!isZero && (
                                  <div
                                    className="absolute inset-0 rounded-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                      borderColor: shadowColor,
                                      boxShadow: `0 0 16px ${shadowColor}40`,
                                      pointerEvents: "none",
                                    }}
                                  />
                                )}
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>
    </AnimatedContainer>
  );
};

export default AssessmentTypesSubStagesHeatmap;
