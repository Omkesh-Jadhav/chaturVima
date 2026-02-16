import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import {
  MOCK_EMOTIONAL_INTENSITY_HEATMAP,
  ASSESSMENT_TYPES,
  STAGE_ORDER,
} from "@/data/assessmentDashboard";
import { getCategoryPalette, getStageColor } from "@/utils/assessmentConfig";
import { useUser } from "@/context/UserContext";
import {
  getEmployeeWeightedAssessmentSummary,
  type EmployeeWeightedAssessmentSummary,
} from "@/api/api-functions/employee-dashboard";
import type { EmotionalIntensityRow } from "@/data/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const EmotionalIntensityHeatmap = () => {
  const { user } = useUser();
  const [summary, setSummary] =
    useState<EmployeeWeightedAssessmentSummary | null>(null);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        const data = await getEmployeeWeightedAssessmentSummary(employeeId);
        setSummary(data);
      } catch (error) {
        console.error(
          "Failed to fetch employee weighted assessment summary for heatmap:",
          error
        );
        setSummary(null);
      }
    };

    fetchData();
  }, [user?.employee_id]);

  const emotionalIntensityHeatmap: EmotionalIntensityRow[] = useMemo(() => {
    if (!summary) return MOCK_EMOTIONAL_INTENSITY_HEATMAP;

    return summary.stages.map((stage) => ({
      stage: stage.stage,
      values: {
        "Employee Self Assessment": stage.percentage,
        "Manager Relationship Assessment": stage.percentage,
        "Department Assessment": stage.percentage,
        "Company Assessment": stage.percentage,
      },
    }));
  }, [summary]);

  const assessmentTypes = ASSESSMENT_TYPES;

  const transformedHeatmap = useMemo(() => {
    // Use STAGE_ORDER to ensure consistent ordering
    const emotionalStages = STAGE_ORDER.filter((stage) =>
      emotionalIntensityHeatmap.some((row) => row.stage === stage)
    );
    return assessmentTypes.map((assessmentType) => ({
      assessmentType,
      values: emotionalStages.reduce((acc, stage) => {
        const row = emotionalIntensityHeatmap.find((r) => r.stage === stage);
        const value = row?.values[assessmentType as keyof typeof row.values];
        acc[stage] = value ?? 0;
        return acc;
      }, {} as Record<string, number>),
    }));
  }, [emotionalIntensityHeatmap, assessmentTypes]);

  const logicalOutcomes = useMemo(() => {
    if (summary?.logical_outcomes?.length) {
      return summary.logical_outcomes
        .map((entry) => {
          const [, description] =
            Object.entries(entry).find(([key]) => key !== "sr_no") ?? [];
          return typeof description === "string" ? description : "";
        })
        .filter((text) => text.trim().length > 0);
    }

    const outcomes: string[] = [];
    const stageAverages = emotionalIntensityHeatmap.map((row) => ({
      stage: row.stage,
      avg:
        Object.values(row.values).reduce((sum, val) => sum + val, 0) /
        Object.values(row.values).length,
    }));

    if (stageAverages.length === 0) {
      return outcomes;
    }

    const highestStage = stageAverages.reduce((max, stage) =>
      stage.avg > max.avg ? stage : max
    );
    const lowestStage = stageAverages.reduce((min, stage) =>
      stage.avg < min.avg ? stage : min
    );

    if (
      highestStage.stage === "Steady-State" &&
      lowestStage.stage === "Soul-Searching"
    ) {
      outcomes.push(
        "Leadership disillusionment contrasts with optimistic employees in a stable organization."
      );
    }

    const employeeValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Employee Self Assessment"]
    );
    const managerValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Manager Relationship Assessment"]
    );
    if (
      employeeValues.some(
        (emp, idx) => emp > 70 && managerValues[idx] < emp - 10
      )
    ) {
      outcomes.push("Employees feel unsupported as challenges persist.");
    }

    const deptValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Department Assessment"]
    );
    if (
      deptValues.some((val, idx) => idx > 0 && val < deptValues[idx - 1] - 5)
    ) {
      outcomes.push("Departmental growth slows.");
    }

    if (outcomes.length === 0) {
      outcomes.push(
        "Emotional intensity varies significantly across organizational levels.",
        "Different stages show distinct patterns in assessment responses.",
        "Organizational alignment requires attention across multiple dimensions."
      );
    }

    return outcomes;
  }, [summary, emotionalIntensityHeatmap]);

  const headerColors: Record<
    string,
    { bg: string; border: string; dot: string }
  > = useMemo(() => {
    const stages = STAGE_ORDER;
    const lightToDarkMap: Record<string, string> = {
      Honeymoon: "#FFE5B4",
      "Self-Introspection": "#C9C5E8",
      "Soul-Searching": "#FFC4B8",
      "Steady-State": "#B8E8E3",
    };
    return stages.reduce((acc, stage) => {
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
    const stages = STAGE_ORDER;
    return stages.reduce((acc, stage) => {
      const main = getStageColor(stage, "main");
      const dark = getStageColor(stage, "dark");
      // Create intermediate color for gradient
      const mid = main; // Can be adjusted if needed
      acc[stage] = `linear-gradient(135deg, ${main}, ${mid}, ${dark})`;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const shadowColors: Record<string, string> = useMemo(() => {
    const stages = STAGE_ORDER;
    return stages.reduce((acc, stage) => {
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
        title="Stage Assessment Heatmap"
        description="Performance analysis across emotional stages by assessment type"
      />

      <div className="mt-4">
        <div
          className="overflow-x-auto overflow-y-visible scrollbar-hide"
          style={{ paddingBottom: "4px" }}
        >
          <div className="inline-block min-w-full">
            <div
              className="grid mb-2"
              style={{
                gridTemplateColumns: "180px repeat(4, minmax(110px, 1fr))",
                gap: "8px",
              }}
            >
              <div className="flex items-center justify-start pl-2" />
              {STAGE_ORDER.map((stage) => {
                const row = emotionalIntensityHeatmap.find((r) => r.stage === stage);
                if (!row) return null;
                const headerColor = headerColors[row.stage] || {
                  bg: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
                  border: "#6b7280",
                  dot: "linear-gradient(135deg, #6b7280, #4b5563)",
                };

                return (
                  <div
                    key={stage}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 shadow-sm"
                    style={{
                      borderColor: `${headerColor.border}30`,
                      background: headerColor.bg,
                    }}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full mb-1.5 shadow-md"
                      style={{
                        background: headerColor.dot,
                        boxShadow: `0 0 8px ${headerColor.border}60, 0 0 12px ${headerColor.border}30`,
                      }}
                    />
                    <span className="text-xs font-bold text-gray-900 text-center leading-tight">
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              {transformedHeatmap.map((row, rowIdx) => {
                const stages = STAGE_ORDER.filter((stage) =>
                  emotionalIntensityHeatmap.some((r) => r.stage === stage)
                );
                return (
                  <div
                    key={row.assessmentType}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns:
                        "180px repeat(4, minmax(110px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    <div className="flex items-center p-2.5 rounded-lg border-2 border-gray-200/60 bg-linear-to-r from-gray-50 via-white to-gray-50 shadow-sm">
                      <span className="text-sm font-bold text-gray-800 leading-tight">
                        {row.assessmentType}
                      </span>
                    </div>

                    {stages.map((stage, cellIdx) => {
                      const value = row.values[stage] ?? 0;
                      const palette = getCategoryPalette(stage);
                      const isZero = value === 0;
                      const cellGradient =
                        cellGradients[stage] ||
                        `linear-gradient(135deg, ${palette.from}, ${palette.accent})`;
                      const shadowColor = shadowColors[stage] || palette.accent;

                      return (
                        <div
                          key={`${row.assessmentType}-${stage}`}
                          className={`relative rounded-lg transition-all hover:shadow-lg group overflow-hidden ${
                            isZero
                              ? "border border-gray-200 bg-white"
                              : "bg-gray-50"
                          }`}
                          style={
                            !isZero
                              ? {
                                  border: `1px solid ${shadowColor}30`,
                                  boxShadow: `0 2px 8px ${shadowColor}20`,
                                }
                              : {}
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
                                duration: 0.6,
                                delay: rowIdx * 0.03 + cellIdx * 0.02,
                                ease: "easeOut",
                              }}
                            >
                              <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
                                <svg
                                  className="absolute top-0 left-0 w-full h-full"
                                  viewBox="0 0 200 20"
                                  preserveAspectRatio="none"
                                  style={{ height: "100%" }}
                                >
                                  <path
                                    d="M0,10 Q25,2 50,10 T100,10 T150,10 T200,10 L200,20 L0,20 Z"
                                    fill={cellGradient}
                                    opacity="1"
                                  />
                                  <path
                                    d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 L200,20 L0,20 Z"
                                    fill={shadowColor}
                                    opacity="0.6"
                                  />
                                  <path
                                    d="M0,11 Q30,3 60,11 T120,11 T180,11 L200,11 L200,20 L0,20 Z"
                                    fill={shadowColor}
                                    opacity="0.5"
                                  />
                                </svg>
                              </div>
                              <div
                                className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
                                style={{
                                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)`,
                                  clipPath:
                                    "polygon(0 0, 100% 0, 100% 30%, 95% 40%, 90% 30%, 85% 40%, 80% 30%, 75% 40%, 70% 30%, 65% 40%, 60% 30%, 55% 40%, 50% 30%, 45% 40%, 40% 30%, 35% 40%, 30% 30%, 25% 40%, 20% 30%, 15% 40%, 10% 30%, 5% 40%, 0% 30%)",
                                }}
                              />
                              <div
                                className="absolute inset-0 opacity-12"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                                    radial-gradient(circle at 60% 50%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                                    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                                  backgroundSize:
                                    "40px 40px, 50px 50px, 35px 35px",
                                }}
                              />
                            </motion.div>
                          )}

                          <div className="relative z-10 flex items-center justify-center min-h-[55px] px-3 py-2.5">
                            <span
                              className={`text-sm font-bold ${
                                isZero
                                  ? "text-gray-900"
                                  : value > 50
                                  ? "text-white drop-shadow-lg"
                                  : "text-gray-900 drop-shadow-sm"
                              }`}
                              style={
                                !isZero && value > 50
                                  ? { textShadow: "0 2px 4px rgba(0,0,0,0.5)" }
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
                                pointerEvents: "none",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="rounded-xl bg-linear-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 border-2 border-blue-100/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900">
                Logical Outcomes
              </h3>
            </div>
            <ul className="space-y-2.5">
              {logicalOutcomes.map((outcome, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 border border-gray-200/40 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="shrink-0 w-5 h-5 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mt-0.5 shadow-sm">
                    <span className="text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-800 leading-relaxed flex-1">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default EmotionalIntensityHeatmap;
