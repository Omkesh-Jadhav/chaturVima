import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, ShieldCheck, Sparkles } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import CycleTable from "@/components/assessmentCycles/CycleTable";
import CycleDrawer from "@/components/assessmentCycles/CycleDrawer";
import {
  assessmentCyclesSeed,
  departmentHeadsDirectory,
  loadShareMatrix,
} from "@/data/assessmentCycles";
import type {
  AssessmentCycle,
  CycleFormPayload,
  ShareMatrix,
} from "@/types/assessmentCycles";

const DepartmentAssessmentCycles = () => {
  const { user } = useUser();
  const [cycles, setCycles] = useState<AssessmentCycle[]>(assessmentCyclesSeed);
  const [shareMatrix, setShareMatrix] = useState<ShareMatrix>(() =>
    loadShareMatrix()
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "cv_hr_share_matrix_v1") {
        setShareMatrix(loadShareMatrix());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const viewerHead =
    departmentHeadsDirectory.find(
      (head) =>
        head.email === user?.email || head.department === user?.department
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
    setCycles((prev) =>
      prev.map((cycle) =>
        cycle.id === drawerState.cycle?.id
          ? {
              ...cycle,
              startDate: payload.startDate,
              endDate: payload.endDate,
              notes: payload.notes,
              status: cycle.status === "Active" ? cycle.status : "Upcoming",
            }
          : cycle
      )
    );
    closeDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-teal">
            Department Head / Scheduling Access
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Assigned Assessment Cycles
            </h1>
            <span className="rounded-full border border-gray-200 px-3 py-0.5 text-xs font-semibold tracking-wide text-gray-600">
              {viewerHead.department}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You can only schedule cycles shared by HR. Creation rights stay with
            HR, but you can fine-tune timelines for your org unit.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-sm"
        >
          <ShieldCheck className="h-4 w-4 text-brand-teal" />
          <div>
            <p className="text-xs font-semibold text-gray-900">
              HR governance on
            </p>
            <p className="text-[11px] text-gray-500">
              Last sync {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-10 w-10 rounded-2xl bg-brand-teal/10 p-2 text-brand-teal" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Scheduling ownership
              </p>
              <p className="text-xs text-gray-500">
                {allowedCycleIds.length} cycles shared by HR
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-10 w-10 rounded-2xl bg-amber-50 p-2 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Upcoming launches
              </p>
              <p className="text-xs text-gray-500">
                {
                  visibleCycles.filter((cycle) => cycle.status === "Upcoming")
                    .length
                }{" "}
                upcoming launches
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-10 w-10 rounded-2xl bg-purple-50 p-2 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Completed coverage
              </p>
              <p className="text-xs text-gray-500">
                {
                  visibleCycles.filter((cycle) => cycle.status === "Completed")
                    .length
                }{" "}
                cycles finished
              </p>
            </div>
          </div>
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
      />
    </div>
  );
};

export default DepartmentAssessmentCycles;
