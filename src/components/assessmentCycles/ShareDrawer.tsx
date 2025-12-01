import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import type {
  AssessmentCycle,
  DepartmentHeadAccess,
  ShareMatrix,
} from "@/types/assessmentCycles";

interface ShareDrawerProps {
  open: boolean;
  cycle?: AssessmentCycle | null;
  onClose: () => void;
  departmentHeads: DepartmentHeadAccess[];
  shareMatrix: ShareMatrix;
  onToggle: (headId: string, hasAccess: boolean) => void;
}

const ShareDrawer = ({
  open,
  cycle,
  onClose,
  departmentHeads,
  shareMatrix,
  onToggle,
}: ShareDrawerProps) => {
  const accessMap = cycle ? shareMatrix[cycle.id] ?? {} : {};
  const [visibleDepartments, setVisibleDepartments] = useState<string[]>([]);

  useEffect(() => {
    setVisibleDepartments([]);
  }, [cycle, open]);

  const toggleDeptFilter = (dept: string) => {
    setVisibleDepartments((prev) =>
      prev.includes(dept)
        ? prev.filter((item) => item !== dept)
        : [...prev, dept]
    );
  };

  const filteredHeads = useMemo(() => {
    if (!cycle) return departmentHeads;
    const allowedDepts =
      visibleDepartments.length === 0 ? cycle.departments : visibleDepartments;
    return departmentHeads.filter(
      (head) =>
        cycle.departments.includes(head.department) &&
        allowedDepts.includes(head.department)
    );
  }, [cycle, departmentHeads, visibleDepartments]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
            className="h-full w-full max-w-md bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Share scheduling access
                </h2>
                <p className="text-sm text-gray-500">
                  {cycle
                    ? `Select department heads who can schedule ${cycle.name}.`
                    : "Select department heads for scheduling."}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="rounded-full p-2 text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 px-6 py-6">
              {cycle && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Departments</span>
                    <button
                      type="button"
                      onClick={() => setVisibleDepartments(cycle.departments)}
                      className="text-brand-teal"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cycle.departments.map((dept) => {
                      const isActive = visibleDepartments.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDeptFilter(dept)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                            isActive
                              ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {filteredHeads.length === 0 && (
                <p className="text-sm text-gray-500">
                  No managers available for the selected departments.
                </p>
              )}
              {filteredHeads.map((head) => {
                const hasAccess = Boolean(accessMap?.[head.id]);
                return (
                  <div
                    key={head.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={head.avatar}
                        alt={head.name}
                        className="h-10 w-10 rounded-full border border-gray-100 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {head.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {head.department} • {head.activeCycles} active cycles
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => onToggle(head.id, !hasAccess)}
                      variant={hasAccess ? "outline" : "ghost"}
                      size="xs"
                      className={`rounded-full ${
                        hasAccess
                          ? "bg-brand-teal/10 text-brand-teal border-brand-teal/20"
                          : "text-gray-600"
                      }`}
                    >
                      {hasAccess ? "Access granted" : "Give access"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareDrawer;
