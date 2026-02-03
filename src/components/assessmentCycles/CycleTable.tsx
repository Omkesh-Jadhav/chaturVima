import { motion } from "framer-motion";
import { MoreHorizontal, ClipboardList } from "lucide-react";
import { Tooltip, Button } from "@/components/ui";
import type { AssessmentCycle } from "@/types/assessmentCycles";
import { CYCLE_STATUS_COLORS } from "@/utils/assessmentUtils";

type TableVariant = "hr" | "department-head";

interface CycleTableProps {
  data: AssessmentCycle[];
  onSchedule?: (cycle: AssessmentCycle) => void;
  onShare?: (cycle: AssessmentCycle) => void;
  variant?: TableVariant;
  scheduleAccess?: Record<string, boolean>;
}

const CycleTable = ({
  data,
  onSchedule,
  onShare,
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50">
            <th className={`${cellPadding} text-left text-xs font-semibold uppercase tracking-wider text-gray-500`}>
              Cycle
            </th>
            <th className={`${cellPadding} text-left text-xs font-semibold uppercase tracking-wider text-gray-500`}>
              Status
            </th>
            {!isDepartmentHead && (
              <th className={`${cellPadding} text-left text-xs font-semibold uppercase tracking-wider text-gray-500`}>
                Departments
              </th>
            )}
            <th className={`${cellPadding} text-left text-xs font-semibold uppercase tracking-wider text-gray-500`}>
              Assessments
            </th>
            <th className={`${cellPadding} text-left text-xs font-semibold uppercase tracking-wider text-gray-500`}>
              Progress
            </th>
            <th className={`${cellPadding} text-right text-xs font-semibold uppercase tracking-wider text-gray-500`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((cycle, idx) => {
            const palette = CYCLE_STATUS_COLORS[cycle.status];
            const isCompleted = cycle.status === "Completed";
            const canSchedule = isCompleted ? false : isDepartmentHead ? scheduleAccess[cycle.id] : true;
            const canShare = !isCompleted;

            return (
              <motion.tr
                key={cycle.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {/* Cycle Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{cycle.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(cycle.startDate).toLocaleDateString()} – {new Date(cycle.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">{cycle.type}</div>
                  </div>
                </td>

                {/* Status Column */}
                <td className={`${cellPadding} align-middle`}>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${palette.bg} ${palette.text}`}>
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
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700"
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
                          <button className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100">
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                )}

                {/* Assessments Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="text-sm font-semibold text-gray-900">{cycle.linkedTeams} linked</div>
                </td>

                {/* Progress Column */}
                <td className={`${cellPadding} align-middle`}>
                  <div className="space-y-1.5">
                    <div className="text-sm font-semibold text-gray-900">{cycle.participants}%</div>
                    <div className="h-2 w-32 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-navy"
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
                    {!isDepartmentHead && (
                      <Button
                        onClick={() => canShare && onShare?.(cycle)}
                        disabled={!canShare}
                        variant="secondary"
                        size="xs"
                      >
                        Share to HOD's
                      </Button>
                    )}
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
