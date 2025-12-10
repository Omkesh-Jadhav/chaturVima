import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Building2, Mail } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SectionHeader } from "@/components/assessmentDashboard";
import {
  departmentHeadsDirectory,
  loadShareMatrix,
  loadCycles,
} from "@/data/assessmentCycles";
import type { AssessmentCycle, ShareMatrix } from "@/types/assessmentCycles";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

interface HODStatus {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar?: string;
  hasAccess: boolean;
  hasScheduled: boolean;
  cyclesScheduled: number;
  cyclesWithAccess: number;
  pendingCycles: AssessmentCycle[]; // Cycles they have access to but haven't scheduled
}

type FilterType = "All" | "Pending" | "Scheduled";

const FILTER_OPTIONS: FilterType[] = ["All", "Pending", "Scheduled"];

const DepartmentHeadStatus = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  const hodStatuses = useMemo(() => {
    const shareMatrix: ShareMatrix = loadShareMatrix();
    const cycles: AssessmentCycle[] = loadCycles();

    // Add dummy cycles for pending records
    const dummyPendingCycles: AssessmentCycle[] = [
      {
        id: "dummy-cycle-1",
        name: "Q1 2025 Performance Review",
        startDate: "2025-01-15",
        endDate: "2025-02-15",
        type: "Quarterly",
        period: "Calendar",
        status: "Upcoming",
        departments: ["IT", "Marketing"],
        assessmentTypes: ["Employee Self Assessment"],
        allowCustomUpload: false,
        participants: 0,
        owner: "HR Admin",
        linkedTeams: 0,
      },
      {
        id: "dummy-cycle-2",
        name: "Annual Engagement Survey",
        startDate: "2025-03-01",
        endDate: "2025-03-31",
        type: "Annual",
        period: "Calendar",
        status: "Upcoming",
        departments: ["Leadership", "People Ops"],
        assessmentTypes: ["Company Assessment"],
        allowCustomUpload: false,
        participants: 0,
        owner: "HR Admin",
        linkedTeams: 0,
      },
      {
        id: "dummy-cycle-3",
        name: "Mid-Year Check-in",
        startDate: "2025-06-01",
        endDate: "2025-06-30",
        type: "Quarterly",
        period: "Calendar",
        status: "Upcoming",
        departments: ["IT", "Marketing", "People Ops"],
        assessmentTypes: [
          "Employee Self Assessment",
          "Manager Relationship Assessment",
        ],
        allowCustomUpload: true,
        participants: 0,
        owner: "HR Admin",
        linkedTeams: 0,
      },
      {
        id: "dummy-cycle-4",
        name: "Q2 2025 Team Assessment",
        startDate: "2025-04-01",
        endDate: "2025-04-30",
        type: "Quarterly",
        period: "Calendar",
        status: "Draft",
        departments: ["IT", "Finance"],
        assessmentTypes: ["Department Assessment"],
        allowCustomUpload: false,
        participants: 0,
        owner: "HR Admin",
        linkedTeams: 0,
      },
    ];

    // Combine real and dummy cycles
    const allCycles = [...cycles, ...dummyPendingCycles];

    // Calculate status for each department head
    const statuses: HODStatus[] = departmentHeadsDirectory.map(
      (head, index) => {
        // Get cycle IDs this HOD has access to from share matrix
        const cycleIdsWithAccess = Object.entries(shareMatrix)
          .filter(([, mapping]) => mapping?.[head.id])
          .map(([cycleId]) => cycleId);

        // Add dummy cycles for some HODs to ensure pending records
        // Assign dummy cycles that are NOT in their department to ensure they're pending
        // Also include Draft cycles as they are always pending
        const dummyCycleIdsForHOD: string[] = [];
        if (index === 0) {
          // First HOD (IT) - gets cycles not in IT department to ensure pending
          dummyCycleIdsForHOD.push(
            "dummy-cycle-2",
            "dummy-cycle-3",
            "dummy-cycle-4"
          );
        } else if (index === 1) {
          // Second HOD (Leadership) - gets cycles not in Leadership
          dummyCycleIdsForHOD.push(
            "dummy-cycle-1",
            "dummy-cycle-3",
            "dummy-cycle-4"
          );
        } else if (index === 2) {
          // Third HOD (People Ops) - gets cycles not in People Ops
          dummyCycleIdsForHOD.push(
            "dummy-cycle-1",
            "dummy-cycle-2",
            "dummy-cycle-4"
          );
        } else if (index === 3) {
          // Fourth HOD (Marketing) - gets all dummy cycles
          dummyCycleIdsForHOD.push(
            "dummy-cycle-1",
            "dummy-cycle-2",
            "dummy-cycle-3",
            "dummy-cycle-4"
          );
        }

        const allCycleIdsWithAccess = [
          ...cycleIdsWithAccess,
          ...dummyCycleIdsForHOD,
        ];

        // Get actual cycle objects they have access to
        const cyclesWithAccessList = allCycles.filter((cycle) =>
          allCycleIdsWithAccess.includes(cycle.id)
        );

        // Find the active cycle for this HOD (only one can be active at a time)
        // Priority: Active > Upcoming > Draft
        // A cycle is considered "scheduled" if it's in their department AND is Active/Upcoming
        const scheduledCycle = cycles.find(
          (cycle) =>
            cycle.departments.includes(head.department) &&
            (cycle.status === "Active" || cycle.status === "Upcoming")
        );

        // For testing: Force some HODs to be pending (index 1, 2, 3)
        const forcePendingForTesting = index >= 1 && index <= 3;

        // If HOD has a scheduled cycle and not forced to pending, they are "Scheduled"
        // Otherwise, they are "Pending"
        const hasScheduled = forcePendingForTesting ? false : !!scheduledCycle;
        
        // Pending cycles: Only if no scheduled cycle exists
        // If scheduled cycle exists, no pending cycles
        // If no scheduled cycle, create one pending cycle for display
        const pendingCycles = hasScheduled
          ? [] // If scheduled, no pending cycles
          : [
              // Create a default pending cycle for each HOD without scheduled cycle
              {
                id: `pending-${head.id}`,
                name: `Assessment Cycle - ${head.department}`,
                startDate: new Date().toISOString().split("T")[0],
                endDate: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString().split("T")[0],
                type: "Quarterly" as const,
                period: "Calendar" as const,
                status: "Draft" as const,
                departments: [head.department],
                assessmentTypes: ["Employee Self Assessment"],
                allowCustomUpload: false,
                participants: 0,
                owner: "HR Admin",
                linkedTeams: 0,
              },
            ];

        const hasAccess = true; // All HODs have access by default (1 cycle each)
        const cyclesScheduled = hasScheduled ? 1 : 0;

        return {
          id: head.id,
          name: head.name,
          department: head.department,
          email: head.email,
          avatar: head.avatar,
          hasAccess,
          hasScheduled,
          cyclesScheduled,
          cyclesWithAccess: cyclesWithAccessList.length,
          pendingCycles,
        };
      }
    );

    // Sort: Pending first, then scheduled, then by department name
    return statuses.sort((a, b) => {
      // Pending (not scheduled) first
      if (!a.hasScheduled && b.hasScheduled) return -1;
      if (a.hasScheduled && !b.hasScheduled) return 1;
      // Then sort by department name
      return a.department.localeCompare(b.department);
    });
  }, []);

  // Filter HODs based on selected filter
  const filteredHODs = useMemo(() => {
    if (selectedFilter === "Pending") {
      return hodStatuses.filter((h) => !h.hasScheduled);
    }
    if (selectedFilter === "Scheduled") {
      return hodStatuses.filter((h) => h.hasScheduled);
    }
    // "All" shows all HODs
    return hodStatuses;
  }, [hodStatuses, selectedFilter]);

  const stats = useMemo(() => {
    // Stats always show overall numbers (not filtered)
    const total = hodStatuses.length;
    const scheduled = hodStatuses.filter((h) => h.hasScheduled).length;
    const pending = hodStatuses.filter((h) => !h.hasScheduled).length;

    return { total, scheduled, pending };
  }, [hodStatuses]);

  const handleRemind = (hod: HODStatus) => {
    // TODO: Implement remind functionality (send email/notification)
    console.log(
      `Reminding ${hod.name} (${hod.email}) to schedule assessment cycles`
    );
    // You can add toast notification or API call here
    alert(`Reminder sent to ${hod.name} at ${hod.email}`);
  };

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Department Head Status"
        description="Track which department heads have scheduled or pending assessment cycles"
        actions={
          <FilterSelect
            value={selectedFilter}
            onChange={(value) => {
              const filterValue = value as FilterType;
              if (FILTER_OPTIONS.includes(filterValue)) {
                setSelectedFilter(filterValue);
              }
            }}
            options={FILTER_OPTIONS}
            className="w-full sm:w-auto min-w-[140px]"
          />
        }
      />

      <div className="mt-3">
        {/* Summary Stats - Only for HODs with Access */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg border border-gray-200 bg-white p-2.5">
            <div className="text-xs text-gray-600 mb-1">Total HODs</div>
            <div className="text-lg font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Department heads
            </div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-2.5">
            <div className="text-xs text-gray-600 mb-1">Scheduled</div>
            <div className="text-lg font-bold text-green-600">
              {stats.scheduled}
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">
              {stats.total > 0
                ? `${Math.round((stats.scheduled / stats.total) * 100)}% completed`
                : "0% completed"}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
            <div className="text-xs text-gray-600 mb-1">Pending</div>
            <div className="text-lg font-bold text-amber-600">
              {stats.pending}
            </div>
            {stats.pending > 0 && (
              <div className="text-[10px] text-amber-700 mt-0.5">
                Action required
              </div>
            )}
          </div>
        </div>

        {/* HOD List with Scrollbar */}
        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-2" key={selectedFilter}>
          {filteredHODs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No department heads found for selected filter
            </div>
          ) : (
            filteredHODs.map((hod) => {
              const isPending = !hod.hasScheduled;
              return (
                <div
                  key={hod.id}
                  className={`rounded-lg border p-3 transition-all ${
                    isPending
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-gray-200 bg-white"
                  } hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      {hod.avatar ? (
                        <img
                          src={hod.avatar}
                          alt={hod.name}
                          className="w-10 h-10 rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-brand-teal" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {hod.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span>{hod.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Status - Either Scheduled or Pending */}
                      <div className="flex items-center gap-1.5">
                        {hod.hasScheduled ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-gray-600">
                              Scheduled
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-amber-700">
                              Pending
                            </span>
                          </>
                        )}
                      </div>

                      {/* Remind Button for Pending */}
                      {!hod.hasScheduled && (
                        <button
                          onClick={() => handleRemind(hod)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition-all flex items-center gap-1.5"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Remind
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default DepartmentHeadStatus;
