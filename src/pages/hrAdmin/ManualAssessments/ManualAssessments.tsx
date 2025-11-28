import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { manualDepartments } from "@/data/manualAssessments";
import { cn } from "@/utils/cn";
import CycleDrawer from "@/components/assessmentCycles/CycleDrawer";
import type { CycleFormPayload } from "@/types/assessmentCycles";

const ManualAssessments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDepartmentId, setActiveDepartmentId] = useState(
    manualDepartments[0]?.id ?? ""
  );
  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sourceCycle, setSourceCycle] = useState<{
    cycleId: string;
    cycleName: string;
    departments: string[];
    assessmentTypes?: string[];
  } | null>(null);

  // Handle navigation state from Assessment Cycles page
  useEffect(() => {
    if (location.state) {
      const state = location.state as {
        cycleId: string;
        cycleName: string;
        departments: string[];
        assessmentTypes?: string[];
      };
      setSourceCycle(state);
      // Pre-select the first department from the cycle
      if (state.departments.length > 0) {
        const matchingDept = manualDepartments.find(
          (dept) => dept.name === state.departments[0]
        );
        if (matchingDept) {
          setActiveDepartmentId(matchingDept.id);
        }
      }
    } else {
      // If no source cycle, redirect back to Assessment Cycles
      navigate("/hr/assessment-cycles");
    }
  }, [location.state, navigate]);

  const activeDepartment =
    manualDepartments.find((dept) => dept.id === activeDepartmentId) ??
    manualDepartments[0];

  const filteredEmployees = useMemo(() => {
    if (!activeDepartment) return [];
    if (!search.trim()) return activeDepartment.employees;
    return activeDepartment.employees.filter((employee) =>
      employee.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeDepartment, search]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleDepartmentChange = (deptId: string) => {
    setActiveDepartmentId(deptId);
    setSelectedEmployees([]);
    setSearch("");
  };

  const handleSchedule = (payload: CycleFormPayload) => {
    if (!selectedEmployees.length) {
      alert("Please select at least one employee.");
      return;
    }

    if (!sourceCycle) return;

    // Prepare scheduled cycle data to update the original cycle
    const scheduledData = {
      cycleId: sourceCycle.cycleId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      notes: payload.notes,
      status: "Upcoming" as const,
    };

    // Navigate back to Assessment Cycles page with scheduled data
    navigate("/hr/assessment-cycles", {
      state: { scheduledCycle: scheduledData },
    });
  };

  if (!sourceCycle) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-teal">
          Manual Selection
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Schedule for Selected Employees
        </h1>
        <p className="text-sm text-gray-600">
          Select specific employees from any department to schedule "
          {sourceCycle.cycleName}" manually. Original departments:{" "}
          {sourceCycle.departments.join(", ")}.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Departments
            </p>
            <p className="text-sm text-gray-600">
              Select any department to view and choose employees. Original cycle
              departments are highlighted.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {manualDepartments.map((dept) => {
              const isActive = dept.id === activeDepartment?.id;
              const isOriginalDept = sourceCycle.departments.includes(
                dept.name
              );
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDepartmentChange(dept.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                    isActive
                      ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                      : isOriginalDept
                      ? "border-brand-teal/40 bg-brand-teal/5 text-brand-teal/80 hover:border-brand-teal/60"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {dept.name}
                  {isOriginalDept && (
                    <span className="ml-1.5 text-[10px]">• Original</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {activeDepartment?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {activeDepartment?.summary}
                </p>
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20 sm:w-64"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.includes(employee.id);
                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => toggleEmployee(employee.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all",
                      isSelected
                        ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                      {employee.name
                        .split(" ")
                        .map((part) => part.charAt(0))
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {employee.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {employee.title}
                      </p>
                      <p className="truncate text-[11px] text-gray-400">
                        {employee.location}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                        isSelected
                          ? "border-brand-teal bg-brand-teal text-white"
                          : "border-gray-200 text-gray-500"
                      )}
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
              {!filteredEmployees.length && (
                <p className="col-span-full rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No employees match this search.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Selection Summary
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedEmployees.length}{" "}
              {selectedEmployees.length === 1 ? "employee" : "employees"}
            </p>
            <p className="text-xs text-gray-500">
              {activeDepartment?.name} •{" "}
              {selectedEmployees.length
                ? "Ready to schedule"
                : "Select employees to continue"}
            </p>
          </div>

          <button
            type="button"
            disabled={!selectedEmployees.length}
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition",
              selectedEmployees.length
                ? "bg-linear-to-r from-brand-teal to-brand-navy hover:shadow-lg"
                : "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
            )}
          >
            Schedule Cycle
          </button>
        </div>
      </div>

      <CycleDrawer
        open={isDrawerOpen}
        mode="schedule"
        cycle={
          sourceCycle
            ? {
                id: sourceCycle.cycleId,
                name: sourceCycle.cycleName,
                departments: sourceCycle.departments,
                assessmentTypes: sourceCycle.assessmentTypes ?? [],
                type: "Quarterly",
                period: "Fiscal",
                status: "Draft",
                startDate: "",
                endDate: "",
                participants: 0,
                owner: "HR Admin",
                linkedTeams: 0,
                notes: "",
              }
            : null
        }
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSchedule}
      />
    </div>
  );
};

export default ManualAssessments;
