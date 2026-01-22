import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { CycleTable, CycleDrawer } from "@/components/assessmentCycles";
import {
  departmentHeadsDirectory,
  loadShareMatrix,
  loadCycles,
  persistCycles,
  CYCLES_STORAGE_KEY,
} from "@/data/assessmentCycles";
import type {
  AssessmentCycle,
  CycleFormPayload,
  ShareMatrix,
} from "@/types/assessmentCycles";

const DepartmentAssessmentCycles = () => {
  const { user } = useUser();
  const [cycles, setCycles] = useState<AssessmentCycle[]>(() => loadCycles());
  const [shareMatrix, setShareMatrix] = useState<ShareMatrix>(() =>
    loadShareMatrix()
  );

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

  const viewerHead =
    departmentHeadsDirectory.find(
      (head) => head.email === user?.email
    ) ?? departmentHeadsDirectory[0];

  const allowedCycleIds = useMemo(() => {
    return Object.entries(shareMatrix)
      .filter(([, mapping]) => mapping?.[viewerHead.id])
      .map(([cycleId]) => cycleId);
  }, [shareMatrix, viewerHead.id]);

  const allowedMap = useMemo(() => {
    return allowedCycleIds.reduce<Record<string, boolean>>((acc, cycleId) => {
      acc[cycleId] = true;
      return acc;
    }, {});
  }, [allowedCycleIds]);

  const visibleCycles = useMemo(() => {
    return cycles.filter((cycle) => allowedMap[cycle.id]);
  }, [cycles, allowedMap]);

  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    cycle?: AssessmentCycle | null;
  }>({ open: false, cycle: null });

  const openScheduleDrawer = (cycle: AssessmentCycle) =>
    setDrawerState({ open: true, cycle });
  const closeDrawer = () => setDrawerState({ open: false, cycle: null });

  const handleSchedule = (payload: CycleFormPayload) => {
    if (!drawerState.cycle) return;
    setCycles((prev) => {
      const updated = prev.map((cycle) =>
        cycle.id === drawerState.cycle?.id
          ? {
            ...cycle,
            startDate: payload.startDate,
            endDate: payload.endDate,
            notes: payload.notes,
            status: (cycle.status === "Active"
              ? cycle.status
              : "Upcoming") as AssessmentCycle["status"],
          }
          : cycle
      );
      persistCycles(updated);
      return updated;
    });
    closeDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Assigned Assessment Cycles
            </h1>
            <span className="rounded-full border border-gray-200 px-3 py-0.5 text-xs font-semibold tracking-wide text-gray-600">
              {viewerHead.department} Department
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Viewing assessment cycles for{" "}
            <span className="font-semibold text-gray-900">
              {viewerHead.department} Department
            </span>
            . You can only schedule cycles shared by HR.
          </p>
        </div>
      </div>

      {visibleCycles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          HR has not shared any assessment cycles with you yet. Ping HR to get
          access.
        </div>
      ) : (
        <CycleTable
          data={visibleCycles}
          variant="department-head"
          scheduleAccess={allowedMap}
          onSchedule={openScheduleDrawer}
        />
      )}

      <CycleDrawer
        open={drawerState.open}
        mode="schedule"
        cycle={drawerState.cycle}
        onClose={closeDrawer}
        onSubmit={handleSchedule}
        fixedDepartment={viewerHead.department}
      />
    </div>
  );
};

export default DepartmentAssessmentCycles;
