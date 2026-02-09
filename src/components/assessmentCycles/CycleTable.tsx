import { motion } from "framer-motion";
import { MoreHorizontal, ClipboardList } from "lucide-react";
import { Tooltip, Button } from "@/components/ui";
import type { AssessmentCycle } from "@/types/assessmentCycles";
import { CYCLE_STATUS_COLORS } from "@/utils/assessmentUtils";

// Assessment Type color mapping for badges
const getAssessmentTypeBadgeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    "Employee Self Assessment": "bg-blue-50 text-blue-700 border-blue-200",
    "Manager Relationship Assessment": "bg-green-50 text-green-700 border-green-200",
    "Department Assessment": "bg-orange-50 text-orange-700 border-orange-200",
    "Company Assessment": "bg-purple-50 text-purple-700 border-purple-200",
  };
  return colorMap[type] || "bg-gray-50 text-gray-700 border-gray-200";
};

type TableVariant = "hr" | "department-head";

interface CycleTableProps {
  data: AssessmentCycle[];
  onSchedule?: (cycle: AssessmentCycle) => void;
  variant?: TableVariant;
  scheduleAccess?: Record<string, boolean>;
}

const CycleTable = ({
  data,
  onSchedule,
  variant = "hr",
  scheduleAccess = {},
}: CycleTableProps) => {
  const isDepartmentHead = variant === "department-head";
  const cellPadding = "px-6 py-4";

  // Empty state
  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ClipboardList className="h-10 w-10 text-gray-400" />
            </div>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2 text-lg font-semibold text-gray-900"
          >
            No data found
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500"
          >
            No assessment cycles match your current filters.
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-linear-to-r from-gray-50 via-gray-50 to-gray-100">
            <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Cycle
            </th>
            <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Status
            </th>
            {!isDepartmentHead && (
              <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
                Departments
              </th>
            )}
            <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Assessments
            </th>
            <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Assessment Types
            </th>
            <th className={`${cellPadding} text-left text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Progress
            </th>
            <th className={`${cellPadding} text-right text-xs font-bold uppercase tracking-wider text-gray-700`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((cycle, idx) => {
            const palette = CYCLE_STATUS_COLORS[cycle.status];
            const isCompleted = cycle.status === "Completed";
            const isActive = cycle.status === "Active";
            const canSchedule = !isCompleted && !isActive ? (isDepartmentHead ? scheduleAccess[cycle.id] : true) : false;

            return (
              <motion.tr
                key={cycle.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-linear-to-r hover:from-brand-teal/5 hover:via-white hover:to-gray-50 transition-all duration-200 group"
              >
                {/* Cycle Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 group-hover:text-brand-teal transition-colors">{cycle.name}</div>
                    <div className="text-xs text-gray-600 font-medium">
                      {new Date(cycle.startDate).toLocaleDateString()} – {new Date(cycle.endDate).toLocaleDateString()}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">{cycle.type}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{cycle.period}</span>
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className={`${cellPadding} align-middle`}>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm border ${palette.bg} ${palette.text} ${palette.border || 'border-transparent'}`}>
                    {cycle.status}
                  </span>
                </td>

                {/* Departments Column */}
                {!isDepartmentHead && (
                  <td className={`${cellPadding} align-middle`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {cycle.departments.slice(0, 2).map((dept) => (
                        <span
                          key={dept}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:shadow transition-shadow"
                        >
                          {dept}
                        </span>
                      ))}
                      {cycle.departments.length > 2 && (
                        <Tooltip
                          content={
                            <div className="space-y-1">
                              <div className="mb-1.5 font-semibold text-gray-900">Remaining departments:</div>
                              {cycle.departments.slice(2).map((dept) => (
                                <div key={dept} className="text-gray-700">{dept}</div>
                              ))}
                            </div>
                          }
                          position="right"
                        >
                          <button className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                )}

                {/* Assessments Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5">
                    <span className="text-sm font-bold text-blue-700">{cycle.linkedTeams}</span>
                    <span className="text-xs font-medium text-blue-600">count</span>
                  </div>
                </td>

                {/* Assessment Types Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {cycle.assessmentTypes && cycle.assessmentTypes.length > 0 ? (
                      cycle.assessmentTypes.map((type, idx) => {
                        const badgeColor = getAssessmentTypeBadgeColor(type);
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow-md ${badgeColor}`}
                          >
                            {type}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic font-medium">-</span>
                    )}
                  </div>
                </td>

                {/* Progress Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{cycle.participants}%</span>
                      <span className="text-xs text-gray-500 font-medium">complete</span>
                    </div>
                    <div className="h-2.5 w-36 rounded-full bg-gray-200 shadow-inner overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-brand-teal via-brand-teal to-brand-navy shadow-sm transition-all duration-500"
                        style={{ width: `${Math.min(cycle.participants, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Actions Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => canSchedule && onSchedule?.(cycle)}
                      disabled={!canSchedule}
                      variant="primary"
                      size="xs"
                    >
                      Schedule Cycle
                    </Button>
                  </div>
                  {isDepartmentHead && !canSchedule && (
                    <p className="mt-2 text-right text-xs font-medium text-amber-600">Waiting for HR access</p>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CycleTable;
