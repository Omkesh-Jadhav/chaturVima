// Drawer component for creating and scheduling assessment cycles
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { toggleArrayItem, areAllSelected } from "@/utils/commonUtils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  DepartmentBadge,
  EmployeeCard,
  DepartmentSelector,
} from "./components";
import { DEFAULT_PAYLOAD, FIELD_CLASSES, DRAWER_CONFIG } from "./constants";

type DrawerMode = "create" | "schedule";

interface CycleDrawerProps {
  open: boolean;
  mode: DrawerMode;
  cycle?: AssessmentCycle | null;
  onClose: () => void;
  onSubmit: (payload: CycleFormPayload) => void;
  fixedDepartment?: string;
}

const CycleDrawer = ({
  open,
  mode,
  cycle,
  onClose,
  onSubmit,
  fixedDepartment,
}: CycleDrawerProps) => {
  // State
  const [form, setForm] = useState<CycleFormPayload>(DEFAULT_PAYLOAD);
  const [enableManualSelection, setEnableManualSelection] = useState(false);
  const [selectedDeptsForManual, setSelectedDeptsForManual] = useState<
    string[]
  >([]);
  const [activeDeptId, setActiveDeptId] = useState(
    manualDepartments[0]?.id ?? ""
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Custom hooks
  useBodyScrollLock(open);

  // Reset manual selection state
  const resetManualSelection = useCallback(() => {
    setEnableManualSelection(false);
    setSelectedEmployees([]);
    setSelectedDeptsForManual([]);
    setEmployeeSearch("");
  }, []);

  // Initialize form based on mode
  useEffect(() => {
    if (mode === "schedule" && cycle) {
      const departments = fixedDepartment
        ? [fixedDepartment]
        : cycle.departments;
      setForm({
        name: cycle.name,
        type: cycle.type,
        period: cycle.period,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        departments,
        assessmentTypes: cycle.assessmentTypes ?? [],
        notes: cycle.notes,
      });
      resetManualSelection();

      const deptToUse = fixedDepartment || (cycle.departments[0] ?? null);
      if (deptToUse) {
        const matchingDept = manualDepartments.find(
          (d) => d.name === deptToUse
        );
        if (matchingDept) setActiveDeptId(matchingDept.id);
      }
    } else if (mode === "create") {
      setForm(DEFAULT_PAYLOAD);
      resetManualSelection();
    }
  }, [mode, cycle, open, fixedDepartment, resetManualSelection]);

  // Auto-set fixed department when manual selection is enabled
  useEffect(() => {
    if (enableManualSelection && fixedDepartment) {
      setSelectedDeptsForManual((prev) =>
        prev.includes(fixedDepartment) ? prev : [fixedDepartment]
      );
    } else if (!enableManualSelection) {
      setSelectedDeptsForManual([]);
    }
  }, [enableManualSelection, fixedDepartment]);

  // Available departments for manual selection
  const availableDepartments = useMemo(() => {
    if (mode !== "schedule" || !enableManualSelection) return manualDepartments;
    if (fixedDepartment) {
      return manualDepartments.filter((dept) => dept.name === fixedDepartment);
    }
    if (selectedDeptsForManual.length > 0) {
      return manualDepartments.filter((dept) =>
        selectedDeptsForManual.includes(dept.name)
      );
    }
    return manualDepartments;
  }, [mode, enableManualSelection, selectedDeptsForManual, fixedDepartment]);

  // Sync active department with available departments
  useEffect(() => {
    if (enableManualSelection && availableDepartments.length > 0) {
      const currentDept = availableDepartments.find(
        (d) => d.id === activeDeptId
      );
      if (!currentDept) setActiveDeptId(availableDepartments[0].id);
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
    const searchTerm = employeeSearch.trim().toLowerCase();
    if (!searchTerm) return activeDepartment.employees;
    return activeDepartment.employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm)
    );
  }, [activeDepartment, employeeSearch, enableManualSelection]);

  const selectedInActiveDept = useMemo(() => {
    if (!activeDepartment) return 0;
    return activeDepartment.employees.filter((e) =>
      selectedEmployees.includes(e.id)
    ).length;
  }, [activeDepartment, selectedEmployees]);

  // Form handlers
  const handleChange = useCallback(
    <K extends keyof CycleFormPayload>(
      field: K,
      value: CycleFormPayload[K]
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleDepartment = useCallback((dept: string) => {
    setForm((prev) => ({
      ...prev,
      departments: toggleArrayItem(prev.departments, dept),
    }));
  }, []);

  const toggleAllDepartments = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      departments: areAllSelected(departmentOptions, prev.departments)
        ? []
        : [...departmentOptions],
    }));
  }, []);

  const selectAllDepartments = useCallback(() => {
    setForm((prev) => ({ ...prev, departments: [...departmentOptions] }));
  }, []);

  // Manual selection handlers
  const toggleManualDept = useCallback((dept: string) => {
    setSelectedDeptsForManual((prev) => {
      const newDepts = toggleArrayItem(prev, dept);
      if (newDepts.length === 0) setSelectedEmployees([]);
      return newDepts;
    });
  }, []);

  const toggleEmployee = useCallback((employeeId: string) => {
    setSelectedEmployees((prev) => toggleArrayItem(prev, employeeId));
  }, []);

  const selectAllInDepartment = useCallback(() => {
    if (!activeDepartment) return;
    const allIds = activeDepartment.employees.map((e) => e.id);
    const allSelected = areAllSelected(allIds, selectedEmployees);
    setSelectedEmployees((prev) =>
      allSelected
        ? prev.filter((id) => !allIds.includes(id))
        : [...prev, ...allIds.filter((id) => !prev.includes(id))]
    );
  }, [activeDepartment, selectedEmployees]);

  const handleManualSelectionToggle = useCallback(
    (checked: boolean) => {
      setEnableManualSelection(checked);
      if (checked && cycle) {
        if (fixedDepartment) {
          setSelectedDeptsForManual([fixedDepartment]);
        } else if (selectedDeptsForManual.length === 0) {
          setSelectedDeptsForManual([...cycle.departments]);
        }
      } else {
        resetManualSelection();
      }
    },
    [
      cycle,
      fixedDepartment,
      selectedDeptsForManual.length,
      resetManualSelection,
    ]
  );

  // Validation
  const validateManualSelection = useCallback((): string | null => {
    if (!enableManualSelection) return null;
    if (!fixedDepartment && selectedDeptsForManual.length === 0) {
      return "Please select at least one department for employee selection.";
    }
    if (selectedEmployees.length === 0) {
      return "Please select at least one employee.";
    }
    return null;
  }, [
    enableManualSelection,
    fixedDepartment,
    selectedDeptsForManual,
    selectedEmployees,
  ]);

  // Submit handler
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const validationError = validateManualSelection();
      if (validationError) {
        alert(validationError);
        return;
      }
      const finalPayload = fixedDepartment
        ? { ...form, departments: [fixedDepartment] }
        : form;
      onSubmit(finalPayload);
    },
    [form, fixedDepartment, validateManualSelection, onSubmit]
  );

  // Computed values
  const config = DRAWER_CONFIG[mode];
  const title = config.title;
  const description = config.getDescription(cycle?.name);
  const submitButtonText =
    mode === "create"
      ? config.getSubmitText()
      : enableManualSelection
      ? config.getSubmitText(selectedEmployees.length)
      : config.getSubmitText();

  const isSubmitDisabled =
    enableManualSelection &&
    (selectedDeptsForManual.length === 0 || selectedEmployees.length === 0);

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
            {/* Header */}
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

            {/* Form Content */}
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                {/* Cycle Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Cycle Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Q1 2025 Performance Review"
                    className={FIELD_CLASSES}
                  />
                </div>

                {/* Assessment Types */}
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
                </div>

                {/* Type & Period */}
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

                {/* Dates */}
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

                {/* Departments - Schedule Mode */}
                {mode === "schedule" && !fixedDepartment && (
                  <DepartmentSelector
                    departments={departmentOptions}
                    selected={form.departments}
                    onToggle={toggleDepartment}
                    onSelectAll={toggleAllDepartments}
                    showSelectAll={true}
                  />
                )}

                {/* Departments - Create Mode */}
                {mode === "create" && (
                  <DepartmentSelector
                    departments={departmentOptions}
                    selected={form.departments}
                    onToggle={toggleDepartment}
                    onSelectAll={selectAllDepartments}
                    showSelectAll={true}
                  />
                )}

                {/* Fixed Department Display */}
                {mode === "schedule" && fixedDepartment && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500">
                      Department
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <DepartmentBadge
                        department={fixedDepartment}
                        isActive={true}
                        variant="display"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Schedule for {fixedDepartment} department only
                    </p>
                  </div>
                )}

                {/* Manual Employee Selection */}
                {mode === "schedule" && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableManualSelection}
                        onChange={(e) =>
                          handleManualSelectionToggle(e.target.checked)
                        }
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
                        {!fixedDepartment && (
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
                              {departmentOptions.map((dept) => (
                                <DepartmentBadge
                                  key={dept}
                                  department={dept}
                                  isActive={selectedDeptsForManual.includes(
                                    dept
                                  )}
                                  onClick={() => toggleManualDept(dept)}
                                />
                              ))}
                            </div>
                            {selectedDeptsForManual.length === 0 && (
                              <p className="text-xs text-amber-600">
                                Please select at least one department to choose
                                employees
                              </p>
                            )}
                          </div>
                        )}

                        {fixedDepartment && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">
                              Department
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <DepartmentBadge
                                department={fixedDepartment}
                                isActive={true}
                                variant="display"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Email Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Email Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Key objectives, blackout dates, or data dependencies..."
                    className={FIELD_CLASSES}
                  />
                </div>

                {/* Employee Selection UI */}
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

                      {/* Department Tabs */}
                      <div className="flex flex-wrap gap-2">
                        {availableDepartments.map((dept) => (
                          <DepartmentBadge
                            key={dept.id}
                            department={dept.name}
                            isActive={dept.id === activeDeptId}
                            onClick={() => {
                              setActiveDeptId(dept.id);
                              setEmployeeSearch("");
                            }}
                          />
                        ))}
                      </div>

                      {/* Employee Search & Selection */}
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
                              className={FIELD_CLASSES}
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

                        {/* Employee Count */}
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

                        {/* Employee List */}
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1.5 rounded-lg border border-gray-100 p-2">
                          {filteredEmployees.length === 0 ? (
                            <p className="p-4 text-center text-xs text-gray-500">
                              {employeeSearch
                                ? "No employees match your search"
                                : "No employees in this department"}
                            </p>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                isSelected={selectedEmployees.includes(
                                  employee.id
                                )}
                                onToggle={() => toggleEmployee(employee.id)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  variant="gradient"
                  size="md"
                  className="w-full"
                >
                  {submitButtonText}
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
