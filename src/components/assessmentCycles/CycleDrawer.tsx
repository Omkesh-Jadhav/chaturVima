import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CalendarInput, FilterSelect } from "@/components/ui";
import type {
  AssessmentCycle,
  CycleFormPayload,
} from "@/types/assessmentCycles";
import { departmentOptions } from "@/data/assessmentCycles";

type DrawerMode = "create" | "schedule";

interface CycleDrawerProps {
  open: boolean;
  mode: DrawerMode;
  cycle?: AssessmentCycle | null;
  onClose: () => void;
  onSubmit: (payload: CycleFormPayload) => void;
}

const defaultPayload: CycleFormPayload = {
  name: "",
  type: "Quarterly",
  period: "Fiscal",
  startDate: "",
  endDate: "",
  departments: departmentOptions,
  notes: "",
};

const fieldClasses =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all";

const CycleDrawer = ({
  open,
  mode,
  cycle,
  onClose,
  onSubmit,
}: CycleDrawerProps) => {
  const [form, setForm] = useState<CycleFormPayload>(defaultPayload);

  useEffect(() => {
    if (mode === "schedule" && cycle) {
      setForm({
        name: cycle.name,
        type: cycle.type,
        period: cycle.period,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        departments: cycle.departments,
        notes: cycle.notes,
      });
    } else if (mode === "create") {
      setForm(defaultPayload);
    }
  }, [mode, cycle, open]);

  const handleChange = <K extends keyof CycleFormPayload>(
    field: K,
    value: CycleFormPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDepartment = (dept: string) => {
    setForm((prev) => {
      const exists = prev.departments.includes(dept);
      const departments = exists
        ? prev.departments.filter((item) => item !== dept)
        : [...prev.departments, dept];
      return { ...prev, departments };
    });
  };

  const selectAllDepartments = () => {
    setForm((prev) => ({ ...prev, departments: departmentOptions }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  const title =
    mode === "create" ? "Create Assessment Cycle" : "Schedule assessment";
  const description =
    mode === "create"
      ? "Define cadence, coverage, and communication in a single flow."
      : `Drop reminders and go-live windows for ${cycle?.name ?? "the cycle"}.`;

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
            className="h-full w-full max-w-lg bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              {mode === "create" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Cycle Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Q1 2025 Growth Pulse"
                    className={fieldClasses}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Type
                  </label>
                  <FilterSelect
                    label="Type"
                    value={form.type}
                    onChange={(value) => handleChange("type", value)}
                    options={["Quarterly", "Annual", "Ad hoc"]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Period
                  </label>
                  <FilterSelect
                    label="Period"
                    value={form.period}
                    onChange={(value) => handleChange("period", value)}
                    options={["Fiscal", "Calendar"]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CalendarInput
                  label="Start Date"
                  required
                  value={form.startDate}
                  onChange={(next) => handleChange("startDate", next)}
                />
                <CalendarInput
                  label="End Date"
                  required
                  value={form.endDate}
                  onChange={(next) => handleChange("endDate", next)}
                  min={form.startDate || undefined}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Departments
                  </label>
                  <button
                    type="button"
                    onClick={selectAllDepartments}
                    className="text-[11px] font-semibold text-brand-teal"
                  >
                    Select all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {departmentOptions.map((dept) => {
                    const isActive = form.departments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
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

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-500">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Key objectives, blackout dates, or data dependencies..."
                  className={fieldClasses}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-linear-to-r from-brand-teal to-brand-navy py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                {mode === "create" ? "Create Cycle" : "Save Schedule"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CycleDrawer;
