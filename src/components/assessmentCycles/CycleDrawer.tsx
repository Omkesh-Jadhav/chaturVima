import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CalendarInput,
  CheckboxDropdown,
  FilterSelect,
  Button,
} from "@/components/ui";
import type {
  AssessmentCycle,
  CycleFormPayload,
} from "@/types/assessmentCycles";
import {
  assessmentTypeOptions,
  departmentOptions,
} from "@/data/assessmentCycles";
import { manualDepartments } from "@/data/manualAssessments";
import { cn } from "@/utils/cn";

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
  departments: [],
  assessmentTypes: [],
  allowCustomUpload: false,
  customQuestionnaireName: "",
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
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [enableManualSelection, setEnableManualSelection] = useState(false);
  const [selectedDeptsForManual, setSelectedDeptsForManual] = useState<
    string[]
  >([]);
  const [activeDeptId, setActiveDeptId] = useState(
    manualDepartments[0]?.id ?? ""
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const requiresAssessmentSelection =
    form.allowCustomUpload && form.assessmentTypes.length === 0;

  useEffect(() => {
    if (typeof document === "undefined" || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (mode === "schedule" && cycle) {
      setForm({
        name: cycle.name,
        type: cycle.type,
        period: cycle.period,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        departments: cycle.departments, // Pre-select cycle departments by default
        assessmentTypes: cycle.assessmentTypes ?? [],
        allowCustomUpload: Boolean(cycle.allowCustomUpload),
        customQuestionnaireName: cycle.customQuestionnaireName ?? "",
        notes: cycle.notes,
      });
      // Reset manual selection when opening schedule
      setEnableManualSelection(false);
      setSelectedEmployees([]);
      setSelectedDeptsForManual([]);
      setEmployeeSearch("");
      // Pre-select first department from cycle if manual selection is enabled later
      if (cycle.departments.length > 0) {
        const matchingDept = manualDepartments.find(
          (d) => d.name === cycle.departments[0]
        );
        if (matchingDept) {
          setActiveDeptId(matchingDept.id);
        }
      }
    } else if (mode === "create") {
      setForm(defaultPayload);
      setEnableManualSelection(false);
      setSelectedEmployees([]);
      setSelectedDeptsForManual([]);
    }
  }, [mode, cycle, open]);

  // Reset selected departments when manual selection is disabled
  useEffect(() => {
    if (!enableManualSelection) {
      setSelectedDeptsForManual([]);
    }
  }, [enableManualSelection]);

  // Filter departments based on selected departments for manual selection
  const availableDepartments = useMemo(() => {
    if (mode === "schedule" && enableManualSelection) {
      // Filter by selected departments for manual selection, or show all if none selected
      if (selectedDeptsForManual.length > 0) {
        return manualDepartments.filter((dept) =>
          selectedDeptsForManual.includes(dept.name)
        );
      }
      // Show all departments if none selected yet
      return manualDepartments;
    }
    return manualDepartments;
  }, [mode, enableManualSelection, selectedDeptsForManual]);

  // Update activeDeptId when availableDepartments changes
  useEffect(() => {
    if (enableManualSelection && availableDepartments.length > 0) {
      const currentDept = availableDepartments.find(
        (d) => d.id === activeDeptId
      );
      if (!currentDept) {
        setActiveDeptId(availableDepartments[0].id);
      }
    }
  }, [enableManualSelection, availableDepartments, activeDeptId]);

  const activeDepartment = useMemo(
    () =>
      availableDepartments.find((d) => d.id === activeDeptId) ??
      availableDepartments[0],
    [activeDeptId, availableDepartments]
  );

  const filteredEmployees = useMemo(() => {
    if (!activeDepartment || !enableManualSelection) return [];
    if (!employeeSearch.trim()) return activeDepartment.employees;
    return activeDepartment.employees.filter((emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [activeDepartment, employeeSearch, enableManualSelection]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllInDepartment = () => {
    if (!activeDepartment) return;
    const allIds = activeDepartment.employees.map((e) => e.id);
    const allSelected = allIds.every((id) => selectedEmployees.includes(id));
    if (allSelected) {
      // Deselect all from this department
      setSelectedEmployees((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      // Select all from this department
      setSelectedEmployees((prev) => {
        const newIds = allIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const selectedInActiveDept = useMemo(() => {
    if (!activeDepartment) return 0;
    return activeDepartment.employees.filter((e) =>
      selectedEmployees.includes(e.id)
    ).length;
  }, [activeDepartment, selectedEmployees]);

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

  const toggleManualDept = (dept: string) => {
    setSelectedDeptsForManual((prev) => {
      const exists = prev.includes(dept);
      if (exists) {
        const newDepts = prev.filter((d) => d !== dept);
        // If no departments selected, clear employee selection
        if (newDepts.length === 0) {
          setSelectedEmployees([]);
        }
        return newDepts;
      }
      return [...prev, dept];
    });
  };

  const selectAllDepartments = () => {
    setForm((prev) => ({ ...prev, departments: departmentOptions }));
  };

  const toggleAllDepartments = () => {
    const allSelected = departmentOptions.every((dept) =>
      form.departments.includes(dept)
    );
    if (allSelected) {
      // Deselect all departments
      setForm((prev) => ({ ...prev, departments: [] }));
    } else {
      // Select all departments
      setForm((prev) => ({ ...prev, departments: [...departmentOptions] }));
    }
  };

  const toggleCustomUpload = () => {
    setForm((prev) => ({
      ...prev,
      allowCustomUpload: !prev.allowCustomUpload,
      customQuestionnaireName: prev.allowCustomUpload
        ? ""
        : prev.customQuestionnaireName,
    }));
  };

  const handleUploadClick = () => {
    if (requiresAssessmentSelection) return;
    uploadInputRef.current?.click();
  };

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange("customQuestionnaireName", file.name);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (requiresAssessmentSelection) {
      return;
    }
    if (
      enableManualSelection &&
      (selectedDeptsForManual.length === 0 || selectedEmployees.length === 0)
    ) {
      if (selectedDeptsForManual.length === 0) {
        alert("Please select at least one department for employee selection.");
      } else {
        alert("Please select at least one employee.");
      }
      return;
    }
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
            className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
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
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Cycle Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Q1 2025 Performance Review"
                    className={fieldClasses}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Assessment Types
                  </label>
                  <CheckboxDropdown
                    label="assessment types"
                    options={assessmentTypeOptions}
                    selected={form.assessmentTypes}
                    onChange={(selected) =>
                      handleChange("assessmentTypes", selected)
                    }
                    placeholder="Select assessment types"
                    className="w-full"
                    selectAllLabel="Select all"
                  />
                  <label className="flex items-start gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.allowCustomUpload}
                      onChange={toggleCustomUpload}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                    />
                    <span>Add custom questionnaire upload</span>
                  </label>
                  {form.allowCustomUpload && (
                    <div className="rounded-2xl border border-dashed border-brand-teal/40 bg-brand-teal/5 p-4">
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xlsx,.csv"
                        className="sr-only"
                        onChange={handleUploadChange}
                      />
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={requiresAssessmentSelection}
                        className={`rounded-xl border border-brand-teal/40 px-4 py-2 text-xs font-semibold shadow-sm transition ${
                          requiresAssessmentSelection
                            ? "cursor-not-allowed bg-white/70 text-brand-teal/50"
                            : "bg-white text-brand-teal hover:bg-brand-teal/5"
                        }`}
                      >
                        {form.customQuestionnaireName
                          ? "Replace file"
                          : "Upload file"}
                      </button>
                      {form.customQuestionnaireName && (
                        <p className="mt-2 text-xs text-gray-600">
                          {form.customQuestionnaireName}
                        </p>
                      )}
                      <p
                        className={`mt-2 text-xs ${
                          requiresAssessmentSelection
                            ? "font-semibold text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {requiresAssessmentSelection
                          ? "Select at least one assessment type before uploading a custom questionnaire."
                          : "Attach PDF, DOCX, XLSX, or CSV templates for assessors."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500">
                      Type
                    </label>
                    <FilterSelect
                      label="Type"
                      value={form.type}
                      onChange={(value) =>
                        handleChange("type", value as AssessmentCycle["type"])
                      }
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
                      onChange={(value) =>
                        handleChange(
                          "period",
                          value as AssessmentCycle["period"]
                        )
                      }
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

                {mode === "schedule" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase text-gray-500">
                        Departments
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllDepartments}
                        className="text-[11px] font-semibold text-brand-teal"
                      >
                        {departmentOptions.every((dept) =>
                          form.departments.includes(dept)
                        ) && departmentOptions.length > 0
                          ? "Deselect all"
                          : "Select all"}
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
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                              isActive
                                ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            )}
                          >
                            {dept}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {mode === "create" && (
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
                )}

                {mode === "schedule" && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableManualSelection}
                        onChange={(e) => {
                          setEnableManualSelection(e.target.checked);
                          if (e.target.checked && cycle) {
                            // Pre-select cycle departments when enabling manual selection
                            if (selectedDeptsForManual.length === 0) {
                              setSelectedDeptsForManual([...cycle.departments]);
                            }
                          } else {
                            setSelectedEmployees([]);
                            setSelectedDeptsForManual([]);
                            setEmployeeSearch("");
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Manual Employee Selection
                        </span>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Select specific employees instead of all employees in
                          departments
                        </p>
                      </div>
                    </label>

                    {enableManualSelection && (
                      <div className="ml-7 space-y-3 border-t border-gray-100 pt-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase text-gray-500">
                              Select Departments for Employee Selection
                            </label>
                            {selectedDeptsForManual.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDeptsForManual([]);
                                  setSelectedEmployees([]);
                                }}
                                className="text-[11px] font-semibold text-red-500 hover:text-red-600"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {departmentOptions.map((dept) => {
                              const isSelected =
                                selectedDeptsForManual.includes(dept);
                              return (
                                <button
                                  type="button"
                                  key={dept}
                                  onClick={() => toggleManualDept(dept)}
                                  className={cn(
                                    "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                                    isSelected
                                      ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                                  )}
                                >
                                  {dept}
                                </button>
                              );
                            })}
                          </div>
                          {selectedDeptsForManual.length === 0 && (
                            <p className="text-xs text-amber-600">
                              Please select at least one department to choose
                              employees
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Email Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Key objectives, blackout dates, or data dependencies..."
                    className={fieldClasses}
                  />
                </div>

                {mode === "schedule" &&
                  enableManualSelection &&
                  selectedDeptsForManual.length > 0 && (
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase text-gray-500">
                          Select Employees
                        </label>
                        <span className="text-xs font-semibold text-brand-teal">
                          {selectedEmployees.length} employee
                          {selectedEmployees.length !== 1 ? "s" : ""} selected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableDepartments.map((dept) => {
                          const isActive = dept.id === activeDeptId;
                          return (
                            <button
                              type="button"
                              key={dept.id}
                              onClick={() => {
                                setActiveDeptId(dept.id);
                                setEmployeeSearch("");
                              }}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                                isActive
                                  ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                              )}
                            >
                              {dept.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={employeeSearch}
                              onChange={(e) =>
                                setEmployeeSearch(e.target.value)
                              }
                              placeholder={`Search ${
                                activeDepartment?.employees.length ?? 0
                              } employees...`}
                              className={fieldClasses}
                            />
                            {employeeSearch && (
                              <button
                                type="button"
                                onClick={() => setEmployeeSearch("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {activeDepartment && (
                            <button
                              type="button"
                              onClick={selectAllInDepartment}
                              className={cn(
                                "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                                selectedInActiveDept ===
                                  activeDepartment.employees.length
                                  ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              {selectedInActiveDept ===
                              activeDepartment.employees.length
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            {filteredEmployees.length} employee
                            {filteredEmployees.length !== 1 ? "s" : ""}
                            {employeeSearch && " found"}
                          </span>
                          {activeDepartment && (
                            <span>
                              {selectedInActiveDept} /{" "}
                              {activeDepartment.employees.length} selected
                            </span>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1.5 rounded-lg border border-gray-100 p-2">
                          {filteredEmployees.length === 0 ? (
                            <p className="p-4 text-center text-xs text-gray-500">
                              {employeeSearch
                                ? "No employees match your search"
                                : "No employees in this department"}
                            </p>
                          ) : (
                            filteredEmployees.map((employee) => {
                              const isSelected = selectedEmployees.includes(
                                employee.id
                              );
                              return (
                                <button
                                  key={employee.id}
                                  type="button"
                                  onClick={() => toggleEmployee(employee.id)}
                                  className={cn(
                                    "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all",
                                    isSelected
                                      ? "border-brand-teal bg-brand-teal/10"
                                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase text-gray-500">
                                    {employee.name
                                      .split(" ")
                                      .map((p) => p.charAt(0))
                                      .slice(0, 2)
                                      .join("")}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-gray-900">
                                      {employee.name}
                                    </p>
                                    <p className="truncate text-[11px] text-gray-500">
                                      {employee.title}
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all",
                                      isSelected
                                        ? "border-brand-teal bg-brand-teal text-white"
                                        : "border-gray-300 bg-white text-transparent"
                                    )}
                                  >
                                    {isSelected ? "✓" : ""}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <Button
                  type="submit"
                  disabled={
                    enableManualSelection &&
                    (selectedDeptsForManual.length === 0 ||
                      selectedEmployees.length === 0)
                  }
                  variant="gradient"
                  size="md"
                  className="w-full"
                >
                  {mode === "create"
                    ? "Create Cycle"
                    : enableManualSelection
                    ? `Schedule for ${
                        selectedEmployees.length
                      } Selected Employee${
                        selectedEmployees.length !== 1 ? "s" : ""
                      }`
                    : "Save Schedule"}
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CycleDrawer;
