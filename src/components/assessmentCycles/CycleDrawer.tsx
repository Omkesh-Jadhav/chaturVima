// Drawer component for creating and scheduling assessment cycles
import { useEffect, useState, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CalendarInput,
  FilterSelect,
  Button,
} from "@/components/ui";
import type {
  AssessmentCycle,
  CycleFormPayload,
} from "@/types/assessmentCycles";
import {
  assessmentTypeOptions,
} from "@/data/assessmentCycles";
import { useDepartments } from "@/hooks/useDepartments";
import { useGetEmployees } from "@/hooks/useEmployees";
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

type DrawerMode = "create" | "schedule" | "edit";

interface CycleDrawerProps {
  open: boolean;
  mode: DrawerMode;
  cycle?: AssessmentCycle | null;
  onClose: () => void;
  onSubmit: (payload: CycleFormPayload) => void;
  onSave?: (payload: CycleFormPayload) => void;
  fixedDepartment?: string;
  isLoading?: boolean;
}

export interface CycleDrawerRef {
  markAsSaved: () => void;
  showError: (message: string) => void;
}

const CycleDrawer = forwardRef<CycleDrawerRef, CycleDrawerProps>(
  (
    {
      open,
      mode,
      cycle,
      onClose,
      onSubmit,
      onSave,
      fixedDepartment,
      isLoading = false,
    },
    ref
  ) => {
  // Fetch departments from API
  const { data: departments = [], isLoading: isLoadingDepartments, error: departmentsError } = useDepartments();
  const departmentOptions = useMemo(() => {
    if (!departments || departments.length === 0) return [];
    return departments.map((dept) => dept.name).sort();
  }, [departments]);
  
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
  const [hasSaved, setHasSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [departmentError, setDepartmentError] = useState<string>("");

  // Custom hooks
  useBodyScrollLock(open);

  // Reset manual selection state
  const resetManualSelection = useCallback(() => {
    setEnableManualSelection(false);
    setSelectedEmployees([]);
    setSelectedDeptsForManual([]);
    setEmployeeSearch("");
    setDepartmentError("");
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    markAsSaved: () => {
      setHasSaved(true);
      setSaveMessage({ type: "success", text: "Saved successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    },
    showError: (message: string) => {
      setSaveMessage({ type: "error", text: message });
      setTimeout(() => setSaveMessage(null), 3000);
    },
  }), []);

  // Initialize form based on mode
  useEffect(() => {
    if ((mode === "schedule" || mode === "edit") && cycle) {
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
        assessmentType: cycle.assessmentTypes?.[0] ?? "",
        notes: cycle.notes,
      });
      resetManualSelection();
      setHasSaved(false); // Reset saved state when opening drawer

      const deptToUse = fixedDepartment || (cycle.departments[0] ?? null);
      if (deptToUse) {
        const matchingDept = manualDepartments.find(
          (d) => d.name === deptToUse
        );
        if (matchingDept) setActiveDeptId(matchingDept.id);
      }
    } else if (mode === "create") {
      setForm({
        ...DEFAULT_PAYLOAD,
        type: "" as unknown as AssessmentCycle["type"], // Empty for "Select Type" placeholder
        period: "" as unknown as AssessmentCycle["period"], // Empty for "Select Period" placeholder
      });
      resetManualSelection();
      setHasSaved(false);
    }
    // Clear error when drawer closes
    if (!open) {
      setDepartmentError("");
    }
  }, [mode, cycle, open, fixedDepartment, resetManualSelection]);

  // Auto-set fixed department when manual selection is enabled
  useEffect(() => {
    if (enableManualSelection && fixedDepartment) {
      setSelectedDeptsForManual((prev) =>
        prev.includes(fixedDepartment) ? prev : [fixedDepartment]
      );
      // Set active department ID for fixed department
      const deptId = `dept-${fixedDepartment.toLowerCase().replace(/\s+/g, "-")}`;
      setActiveDeptId(deptId);
    } else if (!enableManualSelection) {
      setSelectedDeptsForManual([]);
    }
  }, [enableManualSelection, fixedDepartment]);

  // Ensure activeDeptId is set when departments are selected
  useEffect(() => {
    if (enableManualSelection && selectedDeptsForManual.length > 0) {
      const deptList = fixedDepartment ? [fixedDepartment] : selectedDeptsForManual;
      if (deptList.length > 0) {
        const currentDeptId = `dept-${deptList[0].toLowerCase().replace(/\s+/g, "-")}`;
        // Check if current activeDeptId matches any selected department
        const matchingDept = deptList.find((d) => {
          const deptId = `dept-${d.toLowerCase().replace(/\s+/g, "-")}`;
          return deptId === activeDeptId;
        });
        // If no match, set to first department
        if (!matchingDept) {
          setActiveDeptId(currentDeptId);
        }
      }
    }
  }, [enableManualSelection, selectedDeptsForManual, fixedDepartment, activeDeptId]);

  // Determine active department name for fetching employees
  const activeDepartmentName = useMemo(() => {
    if (mode !== "schedule" || !enableManualSelection) return undefined;
    if (fixedDepartment) return fixedDepartment;
    if (selectedDeptsForManual.length > 0) {
      // Find department by activeDeptId or use first selected
      const dept = selectedDeptsForManual.find((d) => {
        const deptId = `dept-${d.toLowerCase().replace(/\s+/g, "-")}`;
        return deptId === activeDeptId;
      });
      // Always return a department name if we have selected departments
      return dept || selectedDeptsForManual[0];
    }
    return undefined;
  }, [mode, enableManualSelection, fixedDepartment, selectedDeptsForManual, activeDeptId]);

  // Fetch employees for active department
  const { data: employeesData } = useGetEmployees(activeDepartmentName);

  // Transform API employees to Employee format
  const apiEmployees = useMemo(() => {
    if (!employeesData) return [];
    
    // API returns data directly as array or wrapped in data/message property
    const employees = Array.isArray(employeesData) 
      ? employeesData 
      : employeesData?.data || employeesData?.message || [];
    
    if (!Array.isArray(employees) || employees.length === 0) return [];
    
    return employees
      .map((emp: { name?: string; employee_name?: string; designation?: string }) => ({
        id: emp.name || `emp-${emp.employee_name || ""}`,
        name: emp.employee_name || emp.name || "",
        title: emp.designation || "",
      }))
      .filter((emp: { name: string }) => emp.name);
  }, [employeesData]);

  // Available departments for manual selection (use API data when available, fallback to static)
  const availableDepartments = useMemo(() => {
    if (mode !== "schedule" || !enableManualSelection) return manualDepartments;
    
    // Build departments list from selected departments
    const deptList = fixedDepartment ? [fixedDepartment] : selectedDeptsForManual;
    if (deptList.length === 0) return manualDepartments;

    // Create department objects with API employees for active department, empty for others
    return deptList.map((deptName) => {
      const deptId = `dept-${deptName.toLowerCase().replace(/\s+/g, "-")}`;
      const isActive = deptId === activeDeptId;
      
      return {
        id: deptId,
        name: deptName,
        summary: "",
        employees: isActive && apiEmployees.length > 0 ? apiEmployees : [],
      };
    });
  }, [mode, enableManualSelection, fixedDepartment, selectedDeptsForManual, activeDeptId, apiEmployees]);

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
    return activeDepartment.employees.filter((emp: { name: string }) =>
      emp.name.toLowerCase().includes(searchTerm)
    );
  }, [activeDepartment, employeeSearch, enableManualSelection]);

  const selectedInActiveDept = useMemo(() => {
    if (!activeDepartment) return 0;
    return activeDepartment.employees.filter((e: { id: string }) =>
      selectedEmployees.includes(e.id)
    ).length;
  }, [activeDepartment, selectedEmployees]);

  // Form handlers
  const handleChange = useCallback(
    <K extends keyof CycleFormPayload>(field: K, value: CycleFormPayload[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (hasSaved) {
        setHasSaved(false);
        setSaveMessage(null);
      }
    },
    [hasSaved]
  );

  const toggleDepartment = useCallback((dept: string) => {
    // Check if department has employees
    const departmentData = departments.find((d) => d.name === dept);
    if (departmentData && departmentData.employee_count === 0) {
      setDepartmentError(`"${dept}" department has no employees. Please select a department with employees to proceed.`);
      return;
    }
    
    setDepartmentError("");
    setForm((prev) => ({ ...prev, departments: toggleArrayItem(prev.departments, dept) }));
    if (hasSaved) {
      setHasSaved(false);
      setSaveMessage(null);
    }
  }, [hasSaved, departments]);

  // Edit mode: add department only (cannot remove initial departments)
  const initialDepartments = useMemo(
    () => (mode === "edit" && cycle?.departments ? [...cycle.departments] : []),
    [mode, cycle?.departments]
  );
  const addedDepartments = useMemo(
    () => form.departments.filter((d) => !initialDepartments.includes(d)),
    [form.departments, initialDepartments]
  );
  const availableToAdd = useMemo(
    () => departmentOptions.filter((d) => !form.departments.includes(d)),
    [departmentOptions, form.departments]
  );

  const addDepartmentInEditMode = useCallback(
    (dept: string) => {
      const departmentData = departments.find((d) => d.name === dept);
      if (departmentData && departmentData.employee_count === 0) {
        setDepartmentError(`"${dept}" department has no employees. Please select a department with employees to proceed.`);
        return;
      }
      setDepartmentError("");
      setForm((prev) => ({
        ...prev,
        departments: prev.departments.includes(dept) ? prev.departments : [...prev.departments, dept],
      }));
      if (hasSaved) {
        setHasSaved(false);
        setSaveMessage(null);
      }
    },
    [departments, hasSaved]
  );

  const removeAddedDepartment = useCallback(
    (dept: string) => {
      if (initialDepartments.includes(dept)) return;
      setForm((prev) => ({
        ...prev,
        departments: prev.departments.filter((d) => d !== dept),
      }));
      if (hasSaved) {
        setHasSaved(false);
        setSaveMessage(null);
      }
    },
    [initialDepartments, hasSaved]
  );


  // Manual selection handlers
  const toggleManualDept = useCallback((dept: string) => {
    // Check if department has employees (only when selecting, not deselecting)
    const isCurrentlySelected = selectedDeptsForManual.includes(dept);
    if (!isCurrentlySelected) {
      const departmentData = departments.find((d) => d.name === dept);
      if (departmentData && departmentData.employee_count === 0) {
        setDepartmentError(`"${dept}" department has no employees. Please select a department with employees to proceed.`);
        return;
      }
    }
    
    setDepartmentError("");
    setSelectedDeptsForManual((prev) => {
      const newDepts = toggleArrayItem(prev, dept);
      if (newDepts.length === 0) {
        setSelectedEmployees([]);
      } else {
        // If this is the first department being selected, set it as active
        if (prev.length === 0 && newDepts.length === 1) {
          const deptId = `dept-${dept.toLowerCase().replace(/\s+/g, "-")}`;
          setActiveDeptId(deptId);
        }
        // If the currently active department was deselected, switch to first available
        else if (prev.includes(dept) && !newDepts.includes(dept)) {
          const currentDeptId = `dept-${dept.toLowerCase().replace(/\s+/g, "-")}`;
          if (activeDeptId === currentDeptId && newDepts.length > 0) {
            const firstDeptId = `dept-${newDepts[0].toLowerCase().replace(/\s+/g, "-")}`;
            setActiveDeptId(firstDeptId);
            setSelectedEmployees([]);
          }
        }
      }
      return newDepts;
    });
  }, [activeDeptId, departments, selectedDeptsForManual]);

  const toggleEmployee = useCallback((employeeId: string) => {
    setSelectedEmployees((prev) => toggleArrayItem(prev, employeeId));
    if (hasSaved) {
      setHasSaved(false);
      setSaveMessage(null);
    }
  }, [hasSaved]);

  const selectAllInDepartment = useCallback(() => {
    if (!activeDepartment) return;
    const allIds = activeDepartment.employees.map((e: { id: string }) => e.id);
    const allSelected = areAllSelected(allIds, selectedEmployees);
    setSelectedEmployees((prev) =>
      allSelected
        ? prev.filter((id: string) => !allIds.includes(id))
        : [...prev, ...allIds.filter((id: string) => !prev.includes(id))]
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
  const validateForm = useCallback((): string | null => {
    if (mode === "edit") {
      if (!form.startDate) return "Please select a start date.";
      if (!form.endDate) return "Please select an end date.";
      if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
        return "End date must be on or after start date.";
      }
      return null;
    }
    if (!form.assessmentType || form.assessmentType === "Select assessment type") {
      return "Please select an assessment type.";
    }
    if (!form.type) return "Please select a type.";
    if (!form.period) return "Please select a period.";
    if (enableManualSelection) {
      if (!fixedDepartment && selectedDeptsForManual.length === 0) {
        return "Please select at least one department for employee selection.";
      }
      if (selectedEmployees.length === 0) {
        return "Please select at least one employee.";
      }
    }
    return null;
  }, [mode, form.assessmentType, form.type, form.period, form.startDate, form.endDate, enableManualSelection, fixedDepartment, selectedDeptsForManual, selectedEmployees]);

  // Submit handler
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const error = validateForm();
      if (error) {
        setSaveMessage({ type: "error", text: error });
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }
      onSubmit(fixedDepartment ? { ...form, departments: [fixedDepartment] } : form);
    },
    [form, fixedDepartment, validateForm, onSubmit]
  );

  // Computed values
  const config = DRAWER_CONFIG[mode];
  const title = config.title;
  const description = config.getDescription(cycle?.name);
  const isEditDatesOnly = mode === "edit";
  const submitButtonText =
    mode === "create"
      ? config.getSubmitText()
      : enableManualSelection
      ? config.getSubmitText(selectedEmployees.length)
      : config.getSubmitText();

  const isSubmitDisabled = isEditDatesOnly
    ? !form.startDate || !form.endDate
    : ((!form.assessmentType || form.assessmentType === "Select assessment type") ||
        !form.type ||
        !form.period ||
        (enableManualSelection &&
          (selectedDeptsForManual.length === 0 || selectedEmployees.length === 0)));

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
                    className={cn(FIELD_CLASSES, isEditDatesOnly && "cursor-not-allowed bg-gray-100 text-gray-700")}
                    disabled={isEditDatesOnly}
                    readOnly={isEditDatesOnly}
                  />
                </div>

                {/* Assessment Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Assessment Type
                  </label>
                  <FilterSelect
                    label="Assessment Type"
                    value={form.assessmentType || "Select assessment type"}
                    onChange={(value) =>
                      handleChange("assessmentType", value)
                    }
                    options={[
                      "Select assessment type",
                      ...assessmentTypeOptions,
                    ]}
                    disabled={isEditDatesOnly}
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
                      value={mode === "create" && !form.type ? "Select Type" : form.type || "Select Type"}
                      onChange={(value) => {
                        if (value !== "Select Type") {
                          handleChange("type", value as AssessmentCycle["type"]);
                        } else if (mode === "create") {
                          handleChange("type", "" as unknown as AssessmentCycle["type"]);
                        }
                      }}
                      options={["Select Type", "Quarterly", "Annual", "Adhoc"]}
                      disabled={isEditDatesOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500">
                      Period
                    </label>
                    <FilterSelect
                      label="Period"
                      value={mode === "create" && !form.period ? "Select Period" : form.period || "Select Period"}
                      onChange={(value) => {
                        if (value !== "Select Period") {
                          handleChange(
                            "period",
                            value as AssessmentCycle["period"]
                          );
                        } else if (mode === "create") {
                          handleChange("period", "" as unknown as AssessmentCycle["period"]);
                        }
                      }}
                      options={["Select Period", "Fiscal", "Calendar"]}
                      disabled={isEditDatesOnly}
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
                    disabled={isEditDatesOnly}
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
                  <div className="space-y-2">
                    {isLoadingDepartments ? (
                      <div className="text-xs text-gray-500">Loading departments...</div>
                    ) : departmentsError ? (
                      <div className="text-xs text-red-500">Error loading departments. Please try again.</div>
                    ) : departmentOptions.length === 0 ? (
                      <div className="text-xs text-amber-600">No departments available.</div>
                    ) : (
                      <>
                        <DepartmentSelector
                          departments={departmentOptions}
                          selected={form.departments}
                          onToggle={toggleDepartment}
                        />
                        {departmentError && (
                          <p className="mt-2 text-xs text-red-600">{departmentError}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Departments - Create Mode (edit mode shows read-only below) */}
                {mode === "create" && (
                  <div className="space-y-2">
                    {isLoadingDepartments ? (
                      <div className="text-xs text-gray-500">Loading departments...</div>
                    ) : departmentsError ? (
                      <div className="text-xs text-red-500">Error loading departments. Please try again.</div>
                    ) : departmentOptions.length === 0 ? (
                      <div className="text-xs text-amber-600">No departments available.</div>
                    ) : (
                      <>
                        <DepartmentSelector
                          departments={departmentOptions}
                          selected={form.departments}
                          onToggle={toggleDepartment}
                        />
                        {departmentError && (
                          <p className="mt-2 text-xs text-red-600">{departmentError}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Departments - Edit mode: read-only initial + add new (cannot update/remove initial) */}
                {mode === "edit" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase text-gray-500">
                      Departments
                    </label>
                    {/* Initial (existing) departments - read-only */}
                    {initialDepartments.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500">
                          Current departments (cannot be changed)
                        </span>
                        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                          {initialDepartments.map((dept) => (
                            <span
                              key={dept}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Added departments - removable */}
                    {addedDepartments.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500">
                          Added departments
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {addedDepartments.map((dept) => (
                            <span
                              key={dept}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-teal/30 bg-brand-teal/5 px-2.5 py-1 text-xs font-semibold text-brand-teal"
                            >
                              {dept}
                              <button
                                type="button"
                                onClick={() => removeAddedDepartment(dept)}
                                className="rounded p-0.5 hover:bg-brand-teal/20"
                                aria-label={`Remove ${dept}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Add another department */}
                    {availableToAdd.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500">
                          Add department
                        </span>
                        {isLoadingDepartments ? (
                          <div className="text-xs text-gray-500">Loading departments...</div>
                        ) : departmentsError ? (
                          <div className="text-xs text-red-500">Error loading departments.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableToAdd.map((dept) => (
                              <DepartmentBadge
                                key={dept}
                                department={dept}
                                isActive={false}
                                onClick={() => addDepartmentInEditMode(dept)}
                              />
                            ))}
                          </div>
                        )}
                        {departmentError && (
                          <p className="mt-1 text-xs text-red-600">{departmentError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Fixed Department Display */}
                {(mode === "schedule" || mode === "edit") && fixedDepartment && (
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
                      {mode === "schedule" 
                        ? `Schedule for ${fixedDepartment} department only`
                        : `Editing cycle for ${fixedDepartment} department`}
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
                              {isLoadingDepartments ? (
                                <div className="text-xs text-gray-500">Loading departments...</div>
                              ) : departmentsError ? (
                                <div className="text-xs text-red-500">Error loading departments.</div>
                              ) : departmentOptions.length === 0 ? (
                                <div className="text-xs text-amber-600">No departments available.</div>
                              ) : (
                                departmentOptions.map((dept) => (
                                  <DepartmentBadge
                                    key={dept}
                                    department={dept}
                                    isActive={selectedDeptsForManual.includes(
                                      dept
                                    )}
                                    onClick={() => toggleManualDept(dept)}
                                  />
                                ))
                              )}
                            </div>
                            {departmentError && (
                              <p className="mt-2 text-xs text-red-600">{departmentError}</p>
                            )}
                            {selectedDeptsForManual.length === 0 && !departmentError && (
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
                    className={cn(FIELD_CLASSES, isEditDatesOnly && "cursor-not-allowed bg-gray-100 text-gray-700")}
                    disabled={isEditDatesOnly}
                    readOnly={isEditDatesOnly}
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
                            filteredEmployees.map((employee: { id: string; name: string; title: string }) => (
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

                {/* Submit Buttons */}
                {mode === "schedule" ? (
                  <div className="space-y-3">
                    {saveMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg border-2 p-3 ${
                          saveMessage.type === "success"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <p className={`text-sm font-semibold flex items-center gap-2 ${
                          saveMessage.type === "success" ? "text-green-700" : "text-red-700"
                        }`}>
                          <span>{saveMessage.type === "success" ? "✓" : "⚠️"}</span>
                          {saveMessage.text}
                        </p>
                      </motion.div>
                    )}
                    <div className="flex gap-3">
                      <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!onSave) return;
                        const error = validateForm();
                        if (error) {
                          setSaveMessage({ type: "error", text: error });
                          setTimeout(() => setSaveMessage(null), 3000);
                          return;
                        }
                        const finalPayload = fixedDepartment
                          ? { ...form, departments: [fixedDepartment], employees: enableManualSelection ? selectedEmployees : undefined }
                          : { ...form, employees: enableManualSelection ? selectedEmployees : undefined };
                        onSave(finalPayload);
                      }}
                      disabled={isSubmitDisabled || isLoading}
                      variant="outline"
                      size="md"
                      className="flex-1 border-brand-teal text-brand-teal hover:bg-brand-teal/5"
                    >
                      Save
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled || isLoading || !hasSaved}
                      variant="gradient"
                      size="md"
                      className="flex-1"
                      isLoading={isLoading}
                    >
                      Schedule
                    </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled || isLoading}
                    variant="gradient"
                    size="md"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    {submitButtonText}
                  </Button>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CycleDrawer.displayName = "CycleDrawer";

export default CycleDrawer;
