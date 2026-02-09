import { useMemo, useState, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CycleTable, CycleDrawer } from "@/components/assessmentCycles";
import type { CycleDrawerRef } from "@/components/assessmentCycles/CycleDrawer";
import { FilterBar, Button } from "@/components/ui";
import { createAssessmentCycle, updateAssessmentCycle, scheduleAssessmentCycle, getAssessmentCycles, type GetAssessmentCyclesParams } from "@/api/api-functions/assessment-cycle";
import {
  statusFilters,
  yearFilters,
} from "@/data/assessmentCycles";
import type {
  AssessmentCycle,
  CycleFormPayload,
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
  const { data: cycles = [], isLoading: isLoadingCycles } = useQuery({
    queryKey: ["assessmentCycles", queryParams],
    queryFn: () => getAssessmentCycles(queryParams),
    staleTime: 30000, // 30 seconds
  });

  const [drawerState, setDrawerState] = useState<{
    mode: "create" | "schedule" | "edit";
    open: boolean;
    cycle?: AssessmentCycle | null;
  }>({ mode: "create", open: false, cycle: null });

  const openCreateDrawer = () =>
    setDrawerState({ mode: "create", open: true, cycle: null });
  const openScheduleDrawer = (cycle: AssessmentCycle) => {
    // Prevent opening schedule drawer if cycle is Active
    if (cycle.status === "Active") {
      return;
    }
    setDrawerState({ mode: "schedule", open: true, cycle });
  };
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, cycle: null }));


  // API mutation for creating assessment cycle
  const createCycleMutation = useMutation({
    mutationFn: createAssessmentCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
      closeDrawer();
    },
    onError: (error) => {
      console.error("Failed to create assessment cycle:", error);
    },
  });

  const handleCreate = (payload: CycleFormPayload) => {
    createCycleMutation.mutate(payload);
  };

  const cycleDrawerRef = useRef<CycleDrawerRef>(null);

  // API mutation for updating assessment cycle
  const updateCycleMutation = useMutation({
    mutationFn: ({ cycleId, payload }: { cycleId: string; payload: CycleFormPayload }) =>
      updateAssessmentCycle(cycleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
      cycleDrawerRef.current?.markAsSaved();
    },
    onError: (error) => {
      console.error("Failed to update assessment cycle:", error);
      cycleDrawerRef.current?.showError("Failed to save assessment cycle. Please try again.");
    },
  });

  const handleSave = (payload: CycleFormPayload) => {
    if (!drawerState.cycle?.id) {
      cycleDrawerRef.current?.showError("Cycle ID is missing. Cannot save.");
      return;
    }
    updateCycleMutation.mutate({ cycleId: drawerState.cycle.id, payload });
  };

  // API mutation for scheduling assessment cycle
  const scheduleCycleMutation = useMutation({
    mutationFn: (cycleId: string) => scheduleAssessmentCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
      closeDrawer();
    },
    onError: (error) => {
      console.error("Failed to schedule assessment cycle:", error);
      cycleDrawerRef.current?.showError("Failed to schedule assessment cycle. Please try again.");
    },
  });

  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);

  const handleSchedule = (_payload: CycleFormPayload) => {
    if (!drawerState.cycle?.id) {
      cycleDrawerRef.current?.showError("Cycle ID is missing. Cannot schedule.");
      return;
    }
    setShowScheduleConfirm(true);
  };

  const confirmSchedule = () => {
    if (!drawerState.cycle?.id) return;
    scheduleCycleMutation.mutate(drawerState.cycle.id);
    setShowScheduleConfirm(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (_payload: CycleFormPayload) => {
    // Edit will update the cycle - will be integrated with UPDATE API
    queryClient.invalidateQueries({ queryKey: ["assessmentCycles"] });
    closeDrawer();
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
            Create and schedule assessment cycles. Manage cycle lifecycle and track participation across your organization.
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
          placeholder: "Search assessment cycle name",
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
            placeholder: "All Departments",
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
          variant="hr"
        />
      )}

      <CycleDrawer
        ref={cycleDrawerRef}
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
        isLoading={
          drawerState.mode === "create" 
            ? createCycleMutation.isPending 
            : drawerState.mode === "schedule"
            ? updateCycleMutation.isPending || scheduleCycleMutation.isPending
            : false
        }
      />

      {/* Schedule Confirmation Modal */}
      <AnimatePresence>
        {showScheduleConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowScheduleConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-linear-to-r from-amber-50 to-orange-50 p-6 pb-8 relative">
                <div className="relative z-10 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200">
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Confirm Schedule Cycle
                  </h2>
                  <p className="text-gray-700 text-sm">
                    Are you sure you want to schedule this assessment cycle?
                  </p>
                  <div className="mt-4 p-3 bg-amber-100/50 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-800">
                      ⚠️ Important: Once scheduled, you won't be able to edit this cycle.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex gap-3">
                <Button
                  onClick={() => setShowScheduleConfirm(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSchedule}
                  variant="gradient"
                  size="md"
                  className="flex-1"
                  isLoading={scheduleCycleMutation.isPending}
                >
                  Yes, Schedule
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentCycles;
