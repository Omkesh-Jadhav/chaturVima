import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const SubStageDistributionHealth = () => {
  // Get actual employee count per stage - Same logic as StageDistributionHealth
  const getStageEmployeeCount = () => {
    const stageCount: { [key: string]: number } = {
      Honeymoon: 0,
      "Self-Introspection": 0,
      "Soul-Searching": 0,
      "Steady-State": 0,
    };
    hrDashboardData.employee.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in stageCount) {
        stageCount[stage]++;
      }
    });
    return stageCount;
  };

  // Sub-Stage Distribution Data - Count unique employees per sub-stage
  const processSubStageDistribution = () => {
    const stageGroups: Record<
      string,
      { subStage: string; count: number; employeeIds?: Set<string> }[]
    > = {
      Honeymoon: [],
      "Self-Introspection": [],
      "Soul-Searching": [],
      "Steady-State": [],
    };

    hrDashboardData.employee.forEach((employee) => {
      const mainStage = employee.stageDetails.stage;
      const employeeId = employee.name; // Using name as unique identifier

      employee.stageDetails.subStageDetails.forEach((subStageDetail) => {
        const subStage = subStageDetail.subStage.trim();
        const existing = stageGroups[mainStage]?.find(
          (s) => s.subStage === subStage
        );
        if (existing) {
          // Only count if this employee hasn't been counted for this sub-stage
          if (!existing.employeeIds?.has(employeeId)) {
            existing.count++;
            if (!existing.employeeIds) {
              existing.employeeIds = new Set<string>();
            }
            existing.employeeIds.add(employeeId);
          }
        } else {
          if (stageGroups[mainStage]) {
            const employeeIds = new Set<string>();
            employeeIds.add(employeeId);
            stageGroups[mainStage].push({ subStage, count: 1, employeeIds });
          }
        }
      });
    });

    // Sort sub-stages within each stage by count and remove employeeIds
    Object.keys(stageGroups).forEach((stage) => {
      stageGroups[stage].sort((a, b) => b.count - a.count);
      // Clean up employeeIds for return
      stageGroups[stage] = stageGroups[stage].map((item) => ({
        subStage: item.subStage,
        count: item.count,
      }));
    });

    return stageGroups;
  };

  const getStageColor = (stage: string): string => {
    const colors: { [key: string]: string } = {
      Honeymoon: "#10B981",
      "Self-Introspection": "#3B82F6",
      "Soul-Searching": "#F59E0B",
      "Steady-State": "#8B5CF6",
    };
    return colors[stage] || "#6B7280";
  };

  const subStageGroups = processSubStageDistribution();
  const stageEmployeeCounts = getStageEmployeeCount();
  const stages = [
    "Honeymoon",
    "Self-Introspection",
    "Soul-Searching",
    "Steady-State",
  ];

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Sub-Stage Distribution Analysis"
        description="Detailed breakdown of employee emotional sub-stages within each parent stage. Identify specific areas of focus for personalized employee development and support strategies."
      />

      <div className="space-y-3 mt-3">
        {/* Compact Badge-Style Grid Layout - 4 Cards per Row */}
        {stages.map((stage, stageIdx) => {
          const stageSubStages = subStageGroups[stage] || [];
          const stageColor = getStageColor(stage);
          const totalInStage = stageEmployeeCounts[stage] || 0; // Use actual employee count, not sum of sub-stages

          if (stageSubStages.length === 0) return null;

          const maxCount = Math.max(...stageSubStages.map((s) => s.count), 1);

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIdx * 0.1 }}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: stageColor,
              }}
            >
              {/* Compact Stage Header */}
              <div
                className="px-2.5 py-1.5 border-b border-gray-100"
                style={{
                  background: `linear-gradient(135deg, ${stageColor}08, ${stageColor}03)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: stageColor }}
                    />
                    <h3 className="text-xs font-bold text-gray-900">{stage}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-600">
                      {totalInStage} employees
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Stages Grid - 4 Cards per Row, Compact */}
              <div className="p-2">
                <div className="grid grid-cols-4 gap-2">
                  {stageSubStages.map((subStage, idx) => {
                    const percentage =
                      totalInStage > 0
                        ? ((subStage.count / totalInStage) * 100).toFixed(0)
                        : "0";
                    const barPercentage = (subStage.count / maxCount) * 100;

                    return (
                      <motion.div
                        key={subStage.subStage}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: stageIdx * 0.05 + idx * 0.03,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        className="group relative overflow-hidden rounded-md border border-gray-200 bg-white p-1.5 transition-all hover:shadow-sm hover:border-gray-300"
                        style={{
                          borderTopWidth: "2px",
                          borderTopColor: stageColor,
                        }}
                      >
                        {/* Gradient Background on Hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: `linear-gradient(135deg, ${stageColor}05, transparent)`,
                          }}
                        />

                        <div className="relative z-10">
                          {/* Sub-Stage Name - Compact */}
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1.5 line-clamp-2 min-h-8 leading-tight">
                            {subStage.subStage}
                          </h4>

                          {/* Count Display - Smaller but Prominent */}
                          <div className="flex items-baseline justify-between mb-1.5">
                            <div className="flex items-baseline gap-0.5">
                              <span
                                className="text-lg font-bold leading-none"
                                style={{ color: stageColor }}
                              >
                                {subStage.count}
                              </span>
                              <span className="text-[9px] text-gray-500 ml-0.5">
                                employees
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">
                              {percentage}%
                            </span>
                          </div>

                          {/* Progress Bar - Thinner */}
                          <div className="relative h-1 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barPercentage}%` }}
                              transition={{
                                duration: 0.6,
                                delay: stageIdx * 0.05 + idx * 0.03 + 0.2,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${stageColor}, ${stageColor}dd)`,
                                boxShadow: `0 0 3px ${stageColor}40`,
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default SubStageDistributionHealth;
