import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Users, TrendingUp } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { CheckboxDropdown } from "@/components/ui/CheckboxDropdown";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import hrDashboardData from "@/data/hrDashboardData.json";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const STAGES = [
  "Honeymoon",
  "Self-Introspection",
  "Soul-Searching",
  "Steady-State",
] as const;

const DepartmentDistribution = () => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // Get all unique departments
  const allDepartments = useMemo(() => {
    return [
      ...new Set(hrDashboardData.employee.map((emp) => emp.department)),
    ].sort();
  }, []);

  // Process department data - aggregate at department level
  const departmentData = useMemo(() => {
    // Get unique departments
    let departments = [
      ...new Set(hrDashboardData.employee.map((emp) => emp.department)),
    ];

    // Filter by selected departments
    if (selectedDepartments.length > 0) {
      departments = departments.filter((dept) =>
        selectedDepartments.includes(dept)
      );
    }

    return departments.map((dept) => {
      // Aggregate employees by department
      let deptEmployees = hrDashboardData.employee.filter(
        (emp) => emp.department === dept
      );

      // Filter by selected stages if any selected
      if (selectedStages.length > 0) {
        deptEmployees = deptEmployees.filter((emp) =>
          selectedStages.includes(emp.stageDetails.stage)
        );
      }

      // Count stages
      const stageCounts = deptEmployees.reduce(
        (acc, emp) => {
          const stage = emp.stageDetails.stage;
          if (STAGES.includes(stage as (typeof STAGES)[number])) {
            acc[stage as (typeof STAGES)[number]] =
              (acc[stage as (typeof STAGES)[number]] || 0) + 1;
          }
          return acc;
        },
        {
          Honeymoon: 0,
          "Self-Introspection": 0,
          "Soul-Searching": 0,
          "Steady-State": 0,
        } as Record<(typeof STAGES)[number], number>
      );

      // Find dominant stage
      const dominantStage = Object.entries(stageCounts).reduce(
        (max, [stage, count]) => (count > max.count ? { stage, count } : max),
        { stage: "", count: 0 } as { stage: string; count: number }
      );

      return {
        department: dept,
        totalEmployees: deptEmployees.length,
        stageDistribution: {
          Honeymoon: stageCounts.Honeymoon,
          "Self-Introspection": stageCounts["Self-Introspection"],
          "Soul-Searching": stageCounts["Soul-Searching"],
          "Steady-State": stageCounts["Steady-State"],
        },
        dominantStage: dominantStage.stage,
        dominantCount: dominantStage.count,
      };
    });
  }, [selectedDepartments, selectedStages]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalEmployees = departmentData.reduce(
      (sum, dept) => sum + dept.totalEmployees,
      0
    );
    const totalDepartments = departmentData.length;

    return { totalEmployees, totalDepartments };
  }, [departmentData]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Department Distribution"
        description="Stage-wise employee distribution across all organizational departments"
        actions={
          <div className="flex gap-2">
            <CheckboxDropdown
              label="Department"
              options={allDepartments}
              selected={selectedDepartments}
              onChange={setSelectedDepartments}
              placeholder="All Departments"
              className="w-full sm:w-auto min-w-[180px]"
            />
            <CheckboxDropdown
              label="Stage"
              options={[...STAGES]}
              selected={selectedStages}
              onChange={setSelectedStages}
              placeholder="All Stages"
              className="w-full sm:w-auto min-w-[180px]"
            />
          </div>
        }
      />

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-gray-200 bg-linear-to-br from-brand-teal/5 to-brand-navy/5 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-brand-teal/10">
              <Building2 className="h-4 w-4 text-brand-teal" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                Total Departments
              </div>
              <div className="text-xl font-bold text-gray-900">
                {overallStats.totalDepartments}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-linear-to-br from-blue-50 to-indigo-50 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                Total Employees
              </div>
              <div className="text-xl font-bold text-gray-900">
                {overallStats.totalEmployees.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards - Scrollable Grid */}
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {departmentData.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            No departments found for selected filters
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {departmentData.map((dept, idx) => {
              const stageColor = getStagePieColor(dept.dominantStage);
              const maxStageCount = Math.max(
                ...Object.values(dept.stageDistribution)
              );

              return (
                <motion.div
                  key={dept.department}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 shadow-sm"
                  style={{
                    borderTopWidth: "4px",
                    borderTopColor: stageColor,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="p-1.5 rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${stageColor}15`,
                      }}
                    >
                      <Building2
                        className="h-4 w-4"
                        style={{ color: stageColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {dept.department}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {dept.totalEmployees} employees
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dominant Stage Badge */}
                  <div className="mb-2.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-600">
                        Dominant
                      </span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stageColor }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: stageColor }}
                        >
                          {dept.dominantStage.split("-")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-gray-700">
                      {dept.dominantCount} employees
                    </div>
                  </div>

                  {/* Stage Distribution */}
                  <div className="space-y-2">
                    {STAGES.map((stage) => {
                      const count = dept.stageDistribution[stage];
                      const stageColorValue = getStagePieColor(stage);
                      const barWidth =
                        maxStageCount > 0 ? (count / maxStageCount) * 100 : 0;

                      return (
                        <div
                          key={stage}
                          className="group/item rounded-lg border border-gray-200 bg-white p-1.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: stageColorValue }}
                              />
                              <span className="text-[10px] font-medium text-gray-700 truncate">
                                {stage.split("-")[0]}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <TrendingUp
                                className="h-3 w-3 text-gray-400"
                                style={{ color: stageColorValue }}
                              />
                              <span
                                className="text-xs font-bold min-w-[25px] text-right"
                                style={{ color: stageColorValue }}
                              >
                                {count}
                              </span>
                            </div>
                          </div>
                          <div className="relative h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{
                                duration: 0.7,
                                delay: idx * 0.03 + 0.15,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full shadow-sm"
                              style={{
                                backgroundColor: stageColorValue,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default DepartmentDistribution;
