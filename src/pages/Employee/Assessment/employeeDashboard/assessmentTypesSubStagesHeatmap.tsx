import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AnimatedContainer, Tooltip } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { STAGE_ORDER } from "@/data/assessmentDashboard";
import { getStageColor } from "@/utils/assessmentConfig";
import { useUser } from "@/context/UserContext";
import { useSelectedAssessmentCycle } from "@/context/SelectedAssessmentCycleContext";
import { employeeAssessmentHistory } from "@/api/api-functions/employee-dashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const STAGES = STAGE_ORDER;

// Assessment type mapping
const ASSESSMENT_TYPE_MAPPING: Record<string, string> = {
  "Self": "Employee Self Assessment",
  "Boss": "Manager Relationship Management", 
  "Dept": "Department Assessment",
  "Company": "Company Assessment"
};

interface SubStage {
  sub_stage: string;
  score: number;
  percentage: number;
}

interface Stage {
  stage: string;
  percentage: number;
  sub_stages: SubStage[];
}

interface AssessmentHistoryItem {
  submission_id: string;
  questionnaire: string;
  status: string;
  last_submitted_on: string;
  dominant_stage: string;
  stages: Stage[];
}

interface AssessmentData {
  assessment_cycle: string;
  cycle_name: string;
  status: string;
  start_date: string;
  end_date: string;
  last_submitted_on: string;
  dominant_stage: string;
  stages: Stage[];
  items: AssessmentHistoryItem[];
}

interface SubStageDisplay {
  id: string;
  label: string;
  value: number;
}


const AssessmentTypesSubStagesHeatmap = () => {
  const { user } = useUser();
  const { selectedCycle } = useSelectedAssessmentCycle();
  
  const { data: historyData } = useQuery({
    queryKey: ['employeeAssessmentHistory', user?.employee_id, selectedCycle?.cycleId],
    queryFn: () => {
      if (!user?.employee_id) return Promise.reject('No employee ID');
      return employeeAssessmentHistory(user.employee_id, selectedCycle?.cycleId);
    },
    enabled: !!user?.employee_id && !!selectedCycle?.cycleId,
  });

  const assessmentData: AssessmentData | undefined = historyData?.message?.[0];

  // Get unique assessment types from API data
  const availableAssessmentTypes = useMemo(() => {
    if (!assessmentData?.items) return [];
    const types = [...new Set(assessmentData.items.map((item: AssessmentHistoryItem) => item.questionnaire))];
    return types.map((type: string) => ASSESSMENT_TYPE_MAPPING[type] || type);
  }, [assessmentData]);

  const subStagesByStage = useMemo(() => {
    if (!assessmentData?.items?.length) {
      return STAGES.map((stage) => ({
        stage,
        subStages: [{ id: `${stage}-0`, label: "Not Available", value: 0 }]
      }));
    }

    return STAGES.map((stage) => {
      // Get sub-stages from the first item (they should be consistent across assessment types)
      const firstItem = assessmentData.items[0];
      const stageData = firstItem?.stages?.find((s: Stage) => s.stage === stage);
      
      const subStages: SubStageDisplay[] = stageData?.sub_stages?.length
        ? stageData.sub_stages.map((subStage: SubStage, index: number) => ({
            id: `${stage}-${index}`,
            label: subStage.sub_stage,
            value: subStage.percentage,
          }))
        : [{ id: `${stage}-0`, label: "Not Available", value: 0 }];
      return { stage, subStages };
    });
  }, [assessmentData]);

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
    subStageIndex: number
  ): number => {
    if (!assessmentData?.items) return 0;

    // Find the original questionnaire type from the mapping
    const originalType = Object.keys(ASSESSMENT_TYPE_MAPPING).find(
      key => ASSESSMENT_TYPE_MAPPING[key] === assessmentType
    );
    
    if (!originalType) return 0;

    // Find the assessment item for this type
    const assessmentItem = assessmentData.items.find(
      (item: AssessmentHistoryItem) => item.questionnaire === originalType
    );
    
    if (!assessmentItem) return 0;

    const stageData = assessmentItem.stages.find((s: Stage) => s.stage === stage);
    if (!stageData?.sub_stages) return 0;

    const subStage = stageData.sub_stages[subStageIndex];
    if (!subStage) return 0;

    return Math.min(100, Math.max(0, Math.round(subStage.percentage)));
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
                  className="relative bg-white rounded-xl border border-gray-200 p-3 shadow-lg transition-all duration-300 overflow-hidden"
                  style={{
                    borderColor: `${headerColor.border}25`,
                    boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px ${headerColor.border}15`,
                  }}
                >
                  {/* Stage Header */}
                  <div
                    className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 mb-3 shadow-sm"
                    style={{
                      borderColor: `${headerColor.border}35`,
                      background: headerColor.bg,
                      boxShadow: `0 2px 8px ${headerColor.border}15`,
                    }}
                  >
                    <span className="text-xs font-bold text-gray-900">
                      {stage}
                    </span>
                  </div>

                  {/* Sub-Stage Headers */}
                  <div className="mb-3 overflow-x-auto scrollbar-hide">
                    <div
                      className="grid w-full"
                      style={{
                        gridTemplateColumns: `100px repeat(${subStages.length}, minmax(90px, 1fr))`,
                        gap: "6px",
                      }}
                    >
                      <div className="flex items-center justify-start pl-2 text-[10px] font-bold text-gray-700 bg-gray-50 rounded-lg py-2 shrink-0 shadow-sm border border-gray-200">
                        Assessment
                      </div>
                      {subStages.map((subStage: SubStageDisplay) => (
                        <Tooltip
                          key={subStage.id}
                          content={subStage.label}
                          position="bottom"
                          className="w-full"
                        >
                          <div
                            className="flex items-center justify-center p-2 rounded-lg border-2 shadow-sm min-h-[50px] overflow-hidden w-full"
                            style={{
                              background: `linear-gradient(135deg, ${headerColor.border}10, ${headerColor.border}05)`,
                              borderColor: `${headerColor.border}25`,
                            }}
                          >
                            <span className="text-[9px] font-semibold text-gray-800 text-center leading-tight wrap-break-word px-1 w-full line-clamp-3">
                              {subStage.label}
                            </span>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Assessment Type Rows */}
                  <div className="space-y-1.5 overflow-x-auto scrollbar-hide">
                    {availableAssessmentTypes.map((assessmentType, rowIdx) => {
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
                            gridTemplateColumns: `100px repeat(${subStages.length}, minmax(90px, 1fr))`,
                            gap: "6px",
                          }}
                        >
                          <Tooltip
                            content={assessmentType}
                            position="right"
                            className="shrink-0"
                          >
                            <div className="flex items-center p-2 rounded-lg border-2 border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 shadow-sm">
                              <span className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-2">
                                {assessmentType}
                              </span>
                            </div>
                          </Tooltip>

                          {subStages.map((subStage: SubStageDisplay, cellIdx: number) => {
                            const value = getSubStageValue(
                              assessmentType,
                              stage,
                              cellIdx
                            );
                            const isZero = value === 0;

                            return (
                              <motion.div
                                key={`${assessmentType}-${subStage.id}`}
                                className={`relative rounded-lg transition-all overflow-hidden w-full max-w-full ${
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

                                <div className="relative z-10 flex items-center justify-center min-h-[45px] px-2 py-1.5">
                                  <span
                                    className={`text-xs font-bold transition-all ${
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
