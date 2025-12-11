import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SectionHeader } from "@/components/assessmentDashboard";
import { MOCK_SUB_STAGES } from "@/data/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import hrDashboardData from "@/data/hrDashboardData.json";

const STAGES = [
  "Honeymoon",
  "Self-Introspection",
  "Soul-Searching",
  "Steady-State",
] as const;

const SubStageDistributionChart = () => {
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>("All Departments");

  // Get all unique departments
  const allDepartments = useMemo(() => {
    const departments = [
      ...new Set(hrDashboardData.employee.map((emp) => emp.department)),
    ].sort();
    return ["All Departments", ...departments];
  }, []);

  // Filter employees by selected department
  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === "All Departments")
      return hrDashboardData.employee;
    return hrDashboardData.employee.filter(
      (emp) => emp.department === selectedDepartment
    );
  }, [selectedDepartment]);

  // Process all data in one optimized useMemo
  const quadrantData = useMemo(() => {
    const stageCounts: Record<string, number> = {};
    const subStageCounts: Record<string, Record<string, number>> = {};

    // Initialize
    STAGES.forEach((stage) => {
      stageCounts[stage] = 0;
      subStageCounts[stage] = {};
      (MOCK_SUB_STAGES[stage] || []).forEach((sub) => {
        subStageCounts[stage][sub.label] = 0;
      });
    });

    // Count employees
    filteredEmployees.forEach((emp) => {
      const stage = emp.stageDetails.stage;
      if (STAGES.includes(stage as (typeof STAGES)[number])) {
        stageCounts[stage]++;
        emp.stageDetails.subStageDetails.forEach((sub) => {
          const subStage = sub.subStage.trim();
          if (subStageCounts[stage][subStage] !== undefined) {
            subStageCounts[stage][subStage]++;
          }
        });
      }
    });

    // Format data - Always show all sub-stages (including 0 values)
    return STAGES.map((stage) => ({
      stage,
      color: getStagePieColor(stage),
      total: stageCounts[stage] || 0,
      chartData: (MOCK_SUB_STAGES[stage] || []).map((sub) => ({
        subStage: sub.label,
        employees: subStageCounts[stage][sub.label] || 0,
      })),
    }));
  }, [filteredEmployees]);

  // Constants
  const BUBBLE_SIZES = { min: 55, max: 130 };
  const SHINE_GRADIENTS = [
    `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8), transparent 50%)`,
    `radial-gradient(circle at 60% 60%, rgba(255,255,255,0.6), transparent 50%)`,
    `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8), transparent 50%)`,
  ];

  // Helper functions
  const splitText = (text: string): string[] => {
    if (text.length <= 14) return [text];
    const words = text.split(/[\s-]+/);
    if (words.length === 1) {
      const mid = Math.ceil(text.length / 2);
      return [text.substring(0, mid), text.substring(mid)];
    }
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  const getBubbleSize = (value: number, maxValue: number) => {
    if (maxValue === 0 || value === 0) return BUBBLE_SIZES.min;
    return (
      BUBBLE_SIZES.min +
      (value / maxValue) * (BUBBLE_SIZES.max - BUBBLE_SIZES.min)
    );
  };

  const getBubbleStyles = (isEmpty: boolean, color: string, size: number) => ({
    width: `${size}px`,
    height: `${size}px`,
    background: isEmpty
      ? `linear-gradient(135deg, ${color}30, ${color}20)`
      : `radial-gradient(circle at 30% 30%, ${color}, ${color}cc, ${color}99)`,
    boxShadow: isEmpty
      ? `0 4px 12px ${color}20, inset 0 2px 8px ${color}15`
      : `0 10px 30px ${color}50, 0 4px 12px ${color}30, inset 0 -3px 15px ${color}80, inset 0 3px 15px ${color}40`,
    border: isEmpty ? `2px dashed ${color}50` : `3px solid ${color}90`,
    opacity: isEmpty ? 0.4 : 1,
  });

  // Bubble Chart Component
  const BubbleChartSection = ({
    stageData,
  }: {
    stageData: {
      stage: string;
      color: string;
      chartData: Array<{ subStage: string; employees: number }>;
    };
  }) => {
    if (!stageData.chartData?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <Users className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-xs text-gray-500">No data available</p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...stageData.chartData.map((d) => d.employees),
      1
    );

    return (
      <div className="h-[200px] w-full">
        <div className="flex flex-col h-full">
          {/* Bubbles */}
          <div className="flex-1 flex items-center justify-evenly gap-3 px-2">
            {stageData.chartData.map((item, idx) => {
              const isEmpty = item.employees === 0;
              const bubbleSize = getBubbleSize(item.employees, maxValue);

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.08,
                    duration: 0.5,
                    type: "spring" as const,
                    stiffness: 150,
                    damping: 15,
                  }}
                  whileHover={{ scale: isEmpty ? 1 : 1.1, y: isEmpty ? 0 : -8 }}
                  className="flex flex-col items-center justify-center flex-1 min-w-0"
                >
                  <div
                    className="relative rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer"
                    style={getBubbleStyles(
                      isEmpty,
                      stageData.color,
                      bubbleSize
                    )}
                  >
                    {!isEmpty && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full overflow-hidden"
                          animate={{ background: SHINE_GRADIENTS }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{ opacity: 0.4 }}
                        />
                        <div
                          className="absolute inset-2 rounded-full"
                          style={{
                            background: `radial-gradient(circle at center, ${stageData.color}40, transparent 70%)`,
                            opacity: 0.6,
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: stageData.color }}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.4, 0, 0.4],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${stageData.color}30, transparent 70%)`,
                          }}
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1, scale: 1.3 }}
                          transition={{ duration: 0.3 }}
                        />
                      </>
                    )}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Users
                        className={`shrink-0 mb-1 ${
                          isEmpty
                            ? "h-3.5 w-3.5 text-gray-400"
                            : "h-5 w-5 text-white"
                        }`}
                        style={
                          !isEmpty
                            ? {
                                filter: `drop-shadow(0 2px 4px ${stageData.color}90)`,
                              }
                            : {}
                        }
                      />
                      <span
                        className={`font-extrabold drop-shadow-2xl ${
                          isEmpty
                            ? "text-gray-400 text-lg font-bold"
                            : "text-3xl text-white"
                        }`}
                        style={
                          !isEmpty
                            ? {
                                textShadow: `0 3px 8px ${stageData.color}90, 0 1px 3px rgba(0,0,0,0.3)`,
                              }
                            : {}
                        }
                      >
                        {item.employees}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* X-axis Labels */}
          <div className="flex items-start justify-evenly gap-3 px-2 pt-2 border-t border-gray-200">
            {stageData.chartData.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-start flex-1 min-w-0"
              >
                <div className="text-center w-full px-1">
                  {splitText(item.subStage).map((line, lineIdx) => (
                    <div
                      key={lineIdx}
                      className={`text-[9px] font-bold leading-tight ${
                        item.employees === 0 ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md"
      style={{ overflow: "visible" }}
    >
      <SectionHeader
        title="Sub-Stage Distribution Analysis"
        description="Visual breakdown of employee emotional sub-stages across all parent stages. Compare distribution patterns and identify focus areas."
        actions={
          <FilterSelect
            label="Department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={allDepartments}
            className="w-full sm:w-auto min-w-[180px]"
          />
        }
      />

      {/* Quadrant Layout - 4 Stages in 2x2 Grid */}
      <div className="relative mt-2">
        <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 transform -translate-y-1/2" />
          </div>

          {quadrantData.map((stageData, idx) => {
            const borderClasses = [
              "border-r border-b",
              "border-l border-b",
              "border-r border-t",
              "border-l border-t",
            ];

            return (
              <motion.div
                key={stageData.stage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
                className={`relative p-2.5 ${borderClasses[idx]} border-gray-200 bg-white hover:bg-gray-50/50 transition-colors duration-200`}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stageData.color }}
                    />
                    <h3 className="text-xs font-bold text-gray-900">
                      {stageData.stage}
                    </h3>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-sm transition-all hover:shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${stageData.color}20, ${stageData.color}10)`,
                      border: `2px solid ${stageData.color}40`,
                    }}
                  >
                    <Users
                      className="h-3.5 w-3.5"
                      style={{ color: stageData.color }}
                    />
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: stageData.color }}
                    >
                      {stageData.total}
                    </span>
                    <span
                      className="text-[10px] font-semibold "
                      style={{ color: stageData.color }}
                    >
                      Total
                    </span>
                  </div>
                </div>
                <BubbleChartSection stageData={stageData} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default SubStageDistributionChart;
