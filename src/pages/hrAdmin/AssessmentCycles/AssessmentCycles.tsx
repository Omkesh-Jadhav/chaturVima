import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CycleTable, CycleDrawer, ShareDrawer } from "@/components/assessmentCycles";
import { FilterBar, Button } from "@/components/ui";
import { createAssessmentCycle, getAssessmentCycles, type GetAssessmentCyclesParams } from "@/api/api-functions/assessment-cycle";
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
  const [shareMatrix, setShareMatrix] = useState<ShareMatrix>(() =>
    loadShareMatrix()
  );
  
  const queryClient = useQueryClient();
  
  // Build query params for API
  const queryParams = useMemo<GetAssessmentCyclesParams>(() => {
    const params: GetAssessmentCyclesParams = {};
    
    if (selectedDepartments.length > 0) {
      params.department = selectedDepartments;
    }
    
    if (search) {
      params.search = search;
    }
    
    if (status && status !== "All Status") {
      params.status = status;
    }
    
    if (year && year !== "All Years") {
      params.year = year;
    }
    
    return params;
  }, [selectedDepartments, search, status, year]);
  
  // Fetch cycles from API
  const { data: cycles = [], isLoading: isLoadingCycles, refetch: refetchCycles } = useQuery({
    queryKey: ["assessmentCycles", queryParams],
    queryFn: () => getAssessmentCycles(queryParams),
    staleTime: 30000, // 30 seconds
  });

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
    onSuccess: () => {
      // Invalidate and refetch cycles after creation
      queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
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

  const handleSave = (payload: CycleFormPayload) => {
    // Save is handled locally for now - will be updated when UPDATE API is integrated
    // Don't close drawer on save, just update the cycle locally
    queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
  };

  const handleSchedule = (payload: CycleFormPayload) => {
    // Schedule will update the cycle status - will be integrated with UPDATE API
    queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
    closeDrawer();
  };

  const handleEdit = (payload: CycleFormPayload) => {
    // Edit will update the cycle - will be integrated with UPDATE API
    queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
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

  // API handles filtering, so we just use the cycles directly
  const filteredCycles = cycles;

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
        <div className="flex items-center justify-end shrink-0">
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

      {isLoadingCycles ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading assessment cycles...</div>
        </div>
      ) : (
        <CycleTable
          data={filteredCycles}
          onSchedule={openScheduleDrawer}
          onShare={openShareDrawer}
          variant="hr"
        />
      )}

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
        onSave={drawerState.mode === "schedule" ? handleSave : undefined}
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
