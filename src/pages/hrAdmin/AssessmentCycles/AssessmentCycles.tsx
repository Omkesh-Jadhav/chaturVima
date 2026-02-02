import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { CycleTable, CycleDrawer, ShareDrawer } from "@/components/assessmentCycles";
import { FilterBar, Button } from "@/components/ui";
import { createAssessmentCycle } from "@/api/api-functions/assessment-cycle";
import {
  departmentHeadsDirectory,
  loadShareMatrix,
  persistShareMatrix,
  loadCycles,
  persistCycles,
  CYCLES_STORAGE_KEY,
  statusFilters,
  yearFilters,
} from "@/data/assessmentCycles";
import type {
  AssessmentCycle,
  CycleFormPayload,
  ShareMatrix,
} from "@/types/assessmentCycles";
import { useDepartments } from "@/hooks/useDepartments";

const AssessmentCycles = () => {
  // Fetch departments from API
  const { data: departments = [] } = useDepartments();
  const departmentOptions = useMemo(() => {
    if (!departments || departments.length === 0) return [];
    return departments.map((dept) => dept.name).sort();
  }, [departments]);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(statusFilters[0]);
  const [year, setYear] = useState(yearFilters[0]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [cycles, setCycles] = useState<AssessmentCycle[]>(() => loadCycles());
  const [shareMatrix, setShareMatrix] = useState<ShareMatrix>(() =>
    loadShareMatrix()
  );

  // Listen for cycle updates from other tabs/pages
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CYCLES_STORAGE_KEY) {
        setCycles(loadCycles());
      }
      if (event.key === "cv_hr_share_matrix_v1") {
        setShareMatrix(loadShareMatrix());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [drawerState, setDrawerState] = useState<{
    mode: "create" | "schedule" | "edit";
    open: boolean;
    cycle?: AssessmentCycle | null;
  }>({ mode: "create", open: false, cycle: null });

  const [shareDrawerState, setShareDrawerState] = useState<{
    open: boolean;
    cycle?: AssessmentCycle | null;
  }>({ open: false, cycle: null });

  const openCreateDrawer = () =>
    setDrawerState({ mode: "create", open: true, cycle: null });
  const openScheduleDrawer = (cycle: AssessmentCycle) =>
    setDrawerState({ mode: "schedule", open: true, cycle });
  const openEditDrawer = (cycle: AssessmentCycle) =>
    setDrawerState({ mode: "edit", open: true, cycle });
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, cycle: null }));

  const openShareDrawer = (cycle: AssessmentCycle) =>
    setShareDrawerState({ open: true, cycle });
  const closeShareDrawer = () =>
    setShareDrawerState({ open: false, cycle: null });

  // API mutation for creating assessment cycle
  const createCycleMutation = useMutation({
    mutationFn: createAssessmentCycle,
    onSuccess: (data, variables) => {
      // Create local cycle object from API response
      const newCycle: AssessmentCycle = {
        id: data?.name || `cycle-${Date.now()}`,
        name: data?.cycle_name || variables.name,
        startDate: data?.start_date || variables.startDate,
        endDate: data?.end_date || variables.endDate,
        type: (data?.assessment_type as AssessmentCycle["type"]) || variables.type,
        period: (data?.period as AssessmentCycle["period"]) || variables.period,
        status: "Draft",
        departments: variables.departments,
        assessmentTypes: variables.assessmentType ? [variables.assessmentType] : [],
        participants: 0,
        owner: "HR Ops",
        linkedTeams: 0,
        notes: variables.notes,
      };
      setCycles((prev) => {
        const updated = [newCycle, ...prev];
        persistCycles(updated);
        return updated;
      });
      closeDrawer();
    },
    onError: (error) => {
      console.error("Failed to create assessment cycle:", error);
      alert("Failed to create assessment cycle. Please try again.");
    },
  });

  const handleCreate = (payload: CycleFormPayload) => {
    createCycleMutation.mutate(payload);
  };

  const handleSchedule = (payload: CycleFormPayload) => {
    if (!drawerState.cycle) return;
    setCycles((prev) => {
      const updated = prev.map((cycle) =>
        cycle.id === drawerState.cycle?.id
          ? {
              ...cycle,
              startDate: payload.startDate,
              endDate: payload.endDate,
              status: cycle.status === "Draft" ? "Upcoming" : cycle.status,
              assessmentTypes: payload.assessmentType ? [payload.assessmentType] : cycle.assessmentTypes,
              notes: payload.notes,
            }
          : cycle
      );
      persistCycles(updated);
      return updated;
    });
    closeDrawer();
  };

  const handleEdit = (payload: CycleFormPayload) => {
    if (!drawerState.cycle) return;
    setCycles((prev) => {
      const updated = prev.map((cycle) =>
        cycle.id === drawerState.cycle?.id
          ? {
              ...cycle,
              name: payload.name,
              type: payload.type,
              period: payload.period,
              startDate: payload.startDate,
              endDate: payload.endDate,
              departments: payload.departments,
              assessmentTypes: payload.assessmentType ? [payload.assessmentType] : [],
              notes: payload.notes,
            }
          : cycle
      );
      persistCycles(updated);
      return updated;
    });
    closeDrawer();
  };

  const handleShareToggle = (headId: string, hasAccess: boolean) => {
    const cycleId = shareDrawerState.cycle?.id;
    if (!cycleId) return;
    setShareMatrix((prev) => {
      const next: ShareMatrix = {
        ...prev,
        [cycleId]: { ...(prev[cycleId] || {}), [headId]: hasAccess },
      };
      persistShareMatrix(next);
      return next;
    });
  };

  const filteredCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      const matchesSearch =
        !search ||
        cycle.name.toLowerCase().includes(search.toLowerCase()) ||
        cycle.departments.some((dept) =>
          dept.toLowerCase().includes(search.toLowerCase())
        );
      const matchesStatus = status === "All Status" || cycle.status === status;
      const matchesDepartments =
        selectedDepartments.length === 0 ||
        cycle.departments.some((dept) => selectedDepartments.includes(dept));
      const matchesYear =
        year === "All Years" ||
        new Date(cycle.startDate).getFullYear().toString() === year;
      return (
        matchesSearch && matchesStatus && matchesDepartments && matchesYear
      );
    });
  }, [cycles, search, status, selectedDepartments, year]);

  const handleClearFilters = () => {
    setStatus(statusFilters[0]);
    setYear(yearFilters[0]);
    setSelectedDepartments([]);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Assessment Cycles
          </h1>
          <p className="mt-1 text-gray-600">
            Create, schedule, and share assessment cycles with department heads.
            Manage cycle lifecycle and track participation across your organization.
          </p>
        </div>
        <div className="flex items-center justify-end flex-shrink-0">
          <Button
            onClick={openCreateDrawer}
            variant="gradient"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create cycle
          </Button>
        </div>
      </div>

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search cycles or departments",
          className: "w-full sm:w-auto",
        }}
        filters={[
          {
            label: "Status",
            value: status,
            onChange: setStatus,
            options: statusFilters,
          },
          {
            label: "Year",
            value: year,
            onChange: setYear,
            options: yearFilters,
          },
        ]}
        checkboxFilters={[
          {
            label: "Departments",
            options: departmentOptions,
            selected: selectedDepartments,
            onChange: setSelectedDepartments,
            placeholder: "All departments",
          },
        ]}
        onClearFilters={handleClearFilters}
      />

      <CycleTable
        data={filteredCycles}
        onSchedule={openScheduleDrawer}
        onShare={openShareDrawer}
        onEdit={openEditDrawer}
        variant="hr"
      />

      <CycleDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        cycle={drawerState.cycle}
        onClose={closeDrawer}
        onSubmit={
          drawerState.mode === "create"
            ? handleCreate
            : drawerState.mode === "edit"
            ? handleEdit
            : handleSchedule
        }
        isLoading={drawerState.mode === "create" ? createCycleMutation.isPending : false}
      />

      <ShareDrawer
        open={shareDrawerState.open}
        cycle={shareDrawerState.cycle}
        onClose={closeShareDrawer}
        departmentHeads={departmentHeadsDirectory}
        shareMatrix={shareMatrix}
        onToggle={handleShareToggle}
      />
    </div>
  );
};

export default AssessmentCycles;
