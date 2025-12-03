import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CycleTable from "@/components/assessmentCycles/CycleTable";
import CycleDrawer from "@/components/assessmentCycles/CycleDrawer";
import ShareDrawer from "@/components/assessmentCycles/ShareDrawer";
import { FilterBar, Button } from "@/components/ui";
import {
  departmentHeadsDirectory,
  loadShareMatrix,
  persistShareMatrix,
  loadCycles,
  persistCycles,
  CYCLES_STORAGE_KEY,
  statusFilters,
  yearFilters,
  departmentOptions,
} from "@/data/assessmentCycles";
import type {
  AssessmentCycle,
  CycleFormPayload,
  ShareMatrix,
} from "@/types/assessmentCycles";

const AssessmentCycles = () => {
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
    mode: "create" | "schedule";
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
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, cycle: null }));

  const openShareDrawer = (cycle: AssessmentCycle) =>
    setShareDrawerState({ open: true, cycle });
  const closeShareDrawer = () =>
    setShareDrawerState({ open: false, cycle: null });

  const handleCreate = (payload: CycleFormPayload) => {
    const newCycle: AssessmentCycle = {
      id: `cycle-${Date.now()}`,
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      type: payload.type,
      period: payload.period,
      status: "Draft",
      departments: payload.departments,
      assessmentTypes: payload.assessmentTypes,
      allowCustomUpload: payload.allowCustomUpload,
      customQuestionnaireName: payload.customQuestionnaireName,
      participants: 0,
      owner: "HR Ops",
      linkedTeams: 0,
      notes: payload.notes,
    };
    setCycles((prev) => {
      const updated = [newCycle, ...prev];
      persistCycles(updated);
      return updated;
    });
    closeDrawer();
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
              assessmentTypes: payload.assessmentTypes,
              allowCustomUpload: payload.allowCustomUpload,
              customQuestionnaireName: payload.customQuestionnaireName,
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Assessment cycles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Create, schedule, and share cycles with just a couple of clicks.
          </p>
        </div>
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
        variant="hr"
      />

      <CycleDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        cycle={drawerState.cycle}
        onClose={closeDrawer}
        onSubmit={drawerState.mode === "create" ? handleCreate : handleSchedule}
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
