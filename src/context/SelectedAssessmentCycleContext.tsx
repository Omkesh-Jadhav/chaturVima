import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAssessmentCycles } from "@/api/api-functions/assessment-cycle";
import { useUser } from "@/context/UserContext";

const STORAGE_KEY = "chaturvima_selected_assessment_cycle";

export interface AssessmentCycleOption {
  cycleId: string;
  cycleName: string;
}

interface SelectedAssessmentCycleContextValue {
  /** List of cycles from API (cycle_name for display, id for doc name) */
  cycles: AssessmentCycleOption[];
  /** Currently selected cycle; null means "no selection" or use latest */
  selectedCycle: AssessmentCycleOption | null;
  setSelectedCycle: (cycle: AssessmentCycleOption | null) => void;
  /** Refetch cycles from API */
  refreshCycles: () => Promise<void>;
  isLoadingCycles: boolean;
}

const SelectedAssessmentCycleContext =
  createContext<SelectedAssessmentCycleContextValue | null>(null);

function readStoredCycle(): AssessmentCycleOption | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentCycleOption;
    if (parsed?.cycleId && parsed?.cycleName) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function writeStoredCycle(cycle: AssessmentCycleOption | null) {
  try {
    if (cycle) localStorage.setItem(STORAGE_KEY, JSON.stringify(cycle));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function SelectedAssessmentCycleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useUser();
  const [cycles, setCycles] = useState<AssessmentCycleOption[]>([]);
  const [selectedCycle, setSelectedCycleState] =
    useState<AssessmentCycleOption | null>(readStoredCycle);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);

  const refreshCycles = useCallback(async () => {
    setIsLoadingCycles(true);
    try {
      const list = await getAssessmentCycles();
      const employeeId = user?.employee_id?.trim();
      // Show only cycles assigned to the current user; if no employee_id (e.g. non-employee), show all
      const assignedList =
        employeeId && list.some((c) => c.employeeIds?.length)
          ? list.filter(
              (c) =>
                (c.employeeIds && c.employeeIds.includes(employeeId)) ||
                !c.employeeIds?.length
            )
          : list;
      const options: AssessmentCycleOption[] = assignedList.map((c) => ({
        cycleId: c.id,
        cycleName: c.name,
      }));
      setCycles(options);

      const stored = readStoredCycle();
      const stillValid = options.some(
        (o) => o.cycleId === stored?.cycleId && o.cycleName === stored?.cycleName
      );
      if (stored && stillValid) {
        setSelectedCycleState(stored);
      } else if (options.length > 0 && !stored) {
        const first = options[0];
        setSelectedCycleState(first);
        writeStoredCycle(first);
      } else if (!stillValid && options.length > 0) {
        const first = options[0];
        setSelectedCycleState(first);
        writeStoredCycle(first);
      } else if (options.length === 0) {
        setSelectedCycleState(null);
        writeStoredCycle(null);
      }
    } catch {
      setCycles([]);
    } finally {
      setIsLoadingCycles(false);
    }
  }, [user?.employee_id]);

  const setSelectedCycle = useCallback((cycle: AssessmentCycleOption | null) => {
    setSelectedCycleState(cycle);
    writeStoredCycle(cycle);
  }, []);

  useEffect(() => {
    refreshCycles();
  }, [refreshCycles]);

  const value = useMemo<SelectedAssessmentCycleContextValue>(
    () => ({
      cycles,
      selectedCycle,
      setSelectedCycle,
      refreshCycles,
      isLoadingCycles,
    }),
    [
      cycles,
      selectedCycle,
      setSelectedCycle,
      refreshCycles,
      isLoadingCycles,
    ]
  );

  return (
    <SelectedAssessmentCycleContext.Provider value={value}>
      {children}
    </SelectedAssessmentCycleContext.Provider>
  );
}

export function useSelectedAssessmentCycle(): SelectedAssessmentCycleContextValue {
  const ctx = useContext(SelectedAssessmentCycleContext);
  if (!ctx) {
    throw new Error(
      "useSelectedAssessmentCycle must be used within SelectedAssessmentCycleProvider"
    );
  }
  return ctx;
}

export function useSelectedAssessmentCycleOptional(): SelectedAssessmentCycleContextValue | null {
  return useContext(SelectedAssessmentCycleContext);
}
