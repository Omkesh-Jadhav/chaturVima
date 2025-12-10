import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SectionHeader } from "@/components/assessmentDashboard";
import { MOCK_SUB_STAGES } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const STAGES = ["Honeymoon", "Self-Introspection", "Soul-Searching", "Steady-State"] as const;

const STAGE_COLORS: Record<string, string> = {
  Honeymoon: "#10B981",
  "Self-Introspection": "#3B82F6",
  "Soul-Searching": "#F59E0B",
  "Steady-State": "#8B5CF6",
};

const SubStageDistributionHealth = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments");

  // Get all unique departments
  const allDepartments = useMemo(() => {
    const departments = [...new Set(hrDashboardData.employee.map((emp) => emp.department))].sort();
    return ["All Departments", ...departments];
  }, []);

  // Filter employees by selected department
  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === "All Departments") return hrDashboardData.employee;
    return hrDashboardData.employee.filter((emp) => emp.department === selectedDepartment);
  }, [selectedDepartment]);

  // Get employee count per stage
  const stageEmployeeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Honeymoon: 0,
      "Self-Introspection": 0,
      "Soul-Searching": 0,
      "Steady-State": 0,
    };
    filteredEmployees.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in counts) counts[stage]++;
    });
    return counts;
  }, [filteredEmployees]);

  // Process sub-stage distribution - Always show all 4 sub-stages for each stage
  const subStageGroups = useMemo(() => {
    const stageGroups: Record<string, { subStage: string; count: number }[]> = {
      Honeymoon: [],
      "Self-Introspection": [],
      "Soul-Searching": [],
      "Steady-State": [],
    };

    // Initialize all sub-stages from MOCK_SUB_STAGES with 0 count
    STAGES.forEach((stage) => {
      const subStages = MOCK_SUB_STAGES[stage] || [];
      stageGroups[stage] = subStages.map((subStage) => ({
        subStage: subStage.label,
        count: 0,
      }));
    });

    // Count employees for each sub-stage
    filteredEmployees.forEach((employee) => {
      const mainStage = employee.stageDetails.stage;

      employee.stageDetails.subStageDetails.forEach((subStageDetail) => {
        const subStage = subStageDetail.subStage.trim();
        const existing = stageGroups[mainStage]?.find((s) => s.subStage === subStage);

        if (existing) {
          existing.count++;
        }
      });
    });

    // Sort by count descending
    Object.keys(stageGroups).forEach((stage) => {
      stageGroups[stage].sort((a, b) => b.count - a.count);
    });

    return stageGroups;
  }, [filteredEmployees]);

  const getStageColor = (stage: string): string => {
    return STAGE_COLORS[stage] || "#6B7280";
  };

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Sub-Stage Distribution Analysis"
        description="Detailed breakdown of employee emotional sub-stages within each parent stage. Identify specific areas of focus for personalized employee development and support strategies."
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

      <div className="space-y-3 mt-3">
        {STAGES.map((stage, stageIdx) => {
          const stageSubStages = subStageGroups[stage] || [];
          const stageColor = getStageColor(stage);
          const totalInStage = stageEmployeeCounts[stage] || 0;

          // Always show all stages, even if no employees
          const maxCount = Math.max(...stageSubStages.map((s) => s.count), 1);

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIdx * 0.1 }}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: stageColor,
              }}
            >
               {/* Compact Stage Header with Highlighted Employee Count */}
               <div
                 className="px-2.5 py-1.5 border-b border-gray-100"
                 style={{
                   background: `linear-gradient(135deg, ${stageColor}10, ${stageColor}05)`,
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
                   <div
                     className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                     style={{
                       backgroundColor: `${stageColor}18`,
                       border: `1px solid ${stageColor}35`,
                     }}
                   >
                     <Users className="h-3.5 w-3.5" style={{ color: stageColor }} />
                     <span
                       className="text-sm font-bold leading-none"
                       style={{ color: stageColor }}
                     >
                       {totalInStage}
                     </span>
                     <span className="text-[9px] text-gray-600 font-medium">
                       employees
                     </span>
                   </div>
                 </div>
               </div>

               {/* Sub-Stages Grid - 4 Cards per Row */}
               <div className="p-1.5">
                 <div className="grid grid-cols-4 gap-1.5">
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
                         whileHover={{ y: -2 }}
                         className="group relative overflow-hidden rounded border border-gray-200 bg-white p-2 transition-all hover:shadow-md hover:border-gray-300"
                         style={{
                           borderTopWidth: "2px",
                           borderTopColor: stageColor,
                           willChange: "transform",
                         }}
                       >
                         <div
                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                           style={{
                             background: `linear-gradient(135deg, ${stageColor}08, transparent)`,
                           }}
                         />

                         <div className="relative z-10">
                           {/* Sub-Stage Name */}
                           <h4 className="text-[10px] font-semibold text-gray-900 mb-1 line-clamp-2 min-h-8 leading-tight">
                             {subStage.subStage}
                           </h4>

                           {/* Count and Percentage - Inline */}
                           <div className="flex items-center justify-between mb-1">
                             <div className="flex items-baseline gap-0.5">
                               <span
                                 className="text-lg font-bold leading-none"
                                 style={{ color: stageColor }}
                               >
                                 {subStage.count}
                               </span>
                               <span className="text-[9px] text-gray-500">
                                 employees
                               </span>
                             </div>
                             <span
                               className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                               style={{
                                 color: stageColor,
                                 backgroundColor: `${stageColor}15`,
                               }}
                             >
                               {percentage}%
                             </span>
                           </div>

                           {/* Progress Bar */}
                           <div className="relative h-0.5 rounded-full bg-gray-100 overflow-hidden">
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
