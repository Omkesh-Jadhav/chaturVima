import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { Tooltip, Button } from "@/components/ui";
import type { AssessmentCycle } from "@/types/assessmentCycles";

type TableVariant = "hr" | "department-head";

interface CycleTableProps {
  data: AssessmentCycle[];
  onSchedule?: (cycle: AssessmentCycle) => void;
  onShare?: (cycle: AssessmentCycle) => void;
  variant?: TableVariant;
  scheduleAccess?: Record<string, boolean>;
}

const statusColors: Record<
  AssessmentCycle["status"],
  { bg: string; text: string }
> = {
  Active: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Upcoming: { bg: "bg-orange-100", text: "text-orange-800" },
  Completed: { bg: "bg-slate-200", text: "text-slate-800" },
  Draft: { bg: "bg-indigo-100", text: "text-indigo-800" },
};

const CycleTable = ({
  data,
  onSchedule,
  onShare,
  variant = "hr",
  scheduleAccess = {},
}: CycleTableProps) => {
  const isDepartmentHead = variant === "department-head";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            <th className="px-5 py-3 text-left">Cycle</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Departments</th>
            <th className="px-4 py-3 text-left">Assessments</th>
            <th className="px-4 py-3 text-left">Progress</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((cycle, idx) => {
            const palette = statusColors[cycle.status];
            const isCompleted = cycle.status === "Completed";
            const canSchedule = isCompleted
              ? false
              : isDepartmentHead
              ? scheduleAccess[cycle.id]
              : true;
            const canShare = !isCompleted;

            return (
              <motion.tr
                key={cycle.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-brand-teal/5"
              >
                <td className="px-5 py-4 align-top">
                  <div className="font-semibold text-gray-900">
                    {cycle.name}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(cycle.startDate).toLocaleDateString()} –{" "}
                    {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">{cycle.type}</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${palette.bg} ${palette.text}`}
                  >
                    {cycle.status}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    {cycle.departments.slice(0, 2).map((dept) => (
                      <span
                        key={dept}
                        className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600"
                      >
                        {dept}
                      </span>
                    ))}
                    {cycle.departments.length > 2 && (
                      <Tooltip
                        content={
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 mb-1.5">
                              Remaining departments:
                            </div>
                            <div className="space-y-1">
                              {cycle.departments.slice(2).map((dept) => (
                                <div key={dept} className="text-gray-700">
                                  {dept}
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                        position="right"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100">
                          <MoreHorizontal className="h-3 w-3" />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  {cycle.assessmentTypes?.length ? (
                    <div className="text-sm font-semibold text-gray-900">
                      {cycle.assessmentTypes.length} linked
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Select assessment types to plan coverage.
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="text-sm font-semibold text-gray-900">
                    {cycle.participants}%
                  </div>
                  <div className="mt-1 h-1.5 w-28 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand-teal to-brand-navy"
                      style={{ width: `${cycle.participants}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right align-top">
                  <div className="flex items-center justify-end gap-3">
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
                    <p className="mt-1 text-[11px] font-medium text-amber-600">
                      Waiting for HR access
                    </p>
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
