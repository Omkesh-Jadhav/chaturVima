import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { Tooltip } from "@/components/ui";
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
  Active: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Upcoming: { bg: "bg-amber-50", text: "text-amber-700" },
  Completed: { bg: "bg-gray-100", text: "text-gray-600" },
  Draft: { bg: "bg-blue-50", text: "text-blue-700" },
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
            <th className="px-4 py-3 text-left">Cycle</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Departments</th>
            <th className="px-4 py-3 text-left">Questionnaires</th>
            <th className="px-4 py-3 text-left">Progress</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((cycle, idx) => {
            const palette = statusColors[cycle.status];
            const canSchedule = isDepartmentHead
              ? scheduleAccess[cycle.id]
              : true;

            return (
              <motion.tr
                key={cycle.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="hover:bg-brand-teal/5"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900">
                    {cycle.name}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(cycle.startDate).toLocaleDateString()} –{" "}
                    {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">{cycle.type}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${palette.bg} ${palette.text}`}
                  >
                    {cycle.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-1">
                    {cycle.departments.slice(0, 3).map((dept) => (
                      <span
                        key={dept}
                        className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600"
                      >
                        {dept}
                      </span>
                    ))}
                    {cycle.departments.length > 3 && (
                      <Tooltip
                        content={
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 mb-1.5">
                              Remaining departments:
                            </div>
                            <div className="space-y-1">
                              {cycle.departments.slice(3).map((dept) => (
                                <div key={dept} className="text-gray-700">
                                  {dept}
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                        position="right"
                      >
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-200 bg-gray-50 text-gray-500 cursor-help hover:bg-gray-100 hover:border-gray-300 transition-colors">
                          <MoreHorizontal className="h-3 w-3" />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {cycle.questionnaires}
                </td>
                <td className="px-4 py-4">
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
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => canSchedule && onSchedule?.(cycle)}
                      disabled={!canSchedule}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                        canSchedule
                          ? "bg-brand-teal text-white hover:bg-brand-teal/90"
                          : "cursor-not-allowed bg-gray-100 text-gray-400"
                      }`}
                    >
                      Schedule
                    </button>
                    {!isDepartmentHead && (
                      <button
                        onClick={() => onShare?.(cycle)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50"
                      >
                        Share
                      </button>
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
