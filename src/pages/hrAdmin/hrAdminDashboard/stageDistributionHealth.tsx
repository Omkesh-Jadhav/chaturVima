import { useMemo, useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { STAGE_ORDER } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import { sortStagesByScore } from "@/utils/assessmentUtils";
import Aura from "@/pages/Employee/Assessment/employeeDashboard/aura";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const STAGES = STAGE_ORDER;

interface StageData {
  id: string;
  label: string;
  value: number;
  color: string;
}

const StageDistributionHealth = () => {
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

  // Memoize stage distribution calculation
  const { stageData, totalEmployees, dominantStage } = useMemo(() => {
    const stageCount: Record<string, number> = Object.fromEntries(
      STAGES.map((stage) => [stage, 0])
    );

    // Count employees per stage
    filteredEmployees.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in stageCount) {
        stageCount[stage]++;
      }
    });

    // Transform to chart data format
    const data: StageData[] = STAGES.map((stage) => ({
      id: stage,
      label: stage,
      value: stageCount[stage],
      color: getStagePieColor(stage),
    }));

    // Sort by value (high to low)
    const sortedData = sortStagesByScore<StageData>(data, "value");

    // Calculate totals
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);
    const dominant = sortedData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      sortedData[0]
    );

    return {
      stageData: sortedData,
      totalEmployees: total,
      dominantStage: dominant,
    };
  }, [filteredEmployees]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Stage Distribution Analysis"
        description="Comprehensive overview of employee emotional journey across all organizational stages. Track engagement levels and identify areas for targeted support."
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

      <div className="grid gap-3 md:grid-cols-3 mt-3">
        <div className="md:col-span-2 h-60">
          <Aura
            variant="embed"
            heightClassName="h-60"
            valueLabel="Employees"
            showShare
            data={stageData.map((s) => ({
              stage: s.label,
              value: s.value,
              color: s.color,
            }))}
          />
        </div>

        <div className="space-y-2.5">
          {/* Total Employees Card */}
          <div className="rounded-lg border border-gray-200 bg-linear-to-br from-brand-teal/5 to-brand-navy/5 p-2.5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-brand-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded bg-linear-to-br from-brand-teal/20 to-brand-navy/20">
                  <Users className="h-3.5 w-3.5 text-brand-teal" />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  Total Employees Assessed
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalEmployees.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Across all stages
              </div>
            </div>
          </div>

          {/* Dominant Stage Card */}
          <div
            className="rounded-lg border border-gray-200 bg-white p-2.5 relative overflow-hidden group"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: dominantStage.color,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${dominantStage.color}08, transparent)`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  className="h-3.5 w-3.5"
                  style={{ color: dominantStage.color }}
                />
                <span className="text-xs font-medium text-gray-600">
                  Dominant Stage
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: dominantStage.color }}
                />
                <span className="text-sm font-semibold text-gray-900">
                  {dominantStage.label}
                </span>
              </div>
              <div
                className="text-lg font-bold mt-1"
                style={{ color: dominantStage.color }}
              >
                {dominantStage.value.toLocaleString()} employees
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default StageDistributionHealth;
