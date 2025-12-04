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

        // Count cycles this HOD has actually scheduled/created
        // A cycle is considered "scheduled by HOD" if it's in their department AND is Active/Upcoming
        // Only check real cycles (not dummy) for scheduled status
        const cyclesScheduled = cycles.filter(
          (cycle) =>
            cycle.departments.includes(head.department) &&
            (cycle.status === "Active" || cycle.status === "Upcoming")
        ).length;

        // Get scheduled cycle IDs (only from real cycles, not dummy)
        const scheduledCycleIds = cycles
          .filter(
            (cycle) =>
              cycle.departments.includes(head.department) &&
              (cycle.status === "Active" || cycle.status === "Upcoming")
          )
          .map((c) => c.id);

        // Pending cycles: cycles they have access to but haven't scheduled
        // This includes:
        // - Draft cycles (not yet scheduled/activated)
        // - Cycles with access but not in their department (not scheduled by them)
        // - Dummy cycles (which are never in their department)
        const pendingCycles = cyclesWithAccessList.filter(
          (cycle) => !scheduledCycleIds.includes(cycle.id)
        );

        const hasAccess = cyclesWithAccessList.length > 0;

        // For testing: Force some HODs to be pending to ensure we have pending records
        // HODs at index 2 and 3 (People Ops and Marketing) will be forced to pending
        // This ensures we have dummy pending data to display
        const forcePendingForTesting = index >= 2; // People Ops (index 2) and Marketing (index 3)

        // If forcing pending for testing, mark as not scheduled
        // Otherwise, check if they have real scheduled cycles
        const hasScheduled = forcePendingForTesting
          ? false // Force pending for testing
          : cyclesScheduled > 0; // Use real scheduled status

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

    // Sort: Has access but not scheduled first, then others
    return statuses.sort((a, b) => {
      if (a.hasAccess && !a.hasScheduled && !(b.hasAccess && !b.hasScheduled))
        return -1;
      if (b.hasAccess && !b.hasScheduled && !(a.hasAccess && !a.hasScheduled))
        return 1;
      return a.department.localeCompare(b.department);
    });
  }, []);

  // Filter HODs based on selected filter - Only show HODs with access
  const filteredHODs = useMemo(() => {
    const withAccess = hodStatuses.filter((h) => h.hasAccess);

    switch (selectedFilter) {
      case "Pending":
        return withAccess.filter((h) => !h.hasScheduled);
      case "Scheduled":
        return withAccess.filter((h) => h.hasScheduled);
      default:
        return withAccess; // "All" shows only HODs with access
    }
  }, [hodStatuses, selectedFilter]);

  const stats = useMemo(() => {
    // Only count HODs who have been given access
    const withAccess = hodStatuses.filter((h) => h.hasAccess);
    const totalWithAccess = withAccess.length;
    const scheduled = withAccess.filter((h) => h.hasScheduled).length;
    const pending = withAccess.filter((h) => !h.hasScheduled).length;

    return { totalWithAccess, scheduled, pending };
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
            onChange={(value) => setSelectedFilter(value as FilterType)}
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
              {stats.totalWithAccess}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              With access granted
            </div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-2.5">
            <div className="text-xs text-gray-600 mb-1">Scheduled</div>
            <div className="text-lg font-bold text-green-600">
              {stats.scheduled}
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">
              {stats.totalWithAccess > 0
                ? `${Math.round(
                    (stats.scheduled / stats.totalWithAccess) * 100
                  )}% completed`
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
        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {filteredHODs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No department heads found for selected filter
            </div>
          ) : (
            filteredHODs.map((hod) => {
              const isPending = hod.hasAccess && !hod.hasScheduled;
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
                      {/* Access Status */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          {hod.hasAccess ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-gray-600">
                                Access Granted
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                No Access
                              </span>
                            </>
                          )}
                        </div>
                        {hod.hasAccess && (
                          <div className="text-[10px] text-gray-500">
                            {hod.cyclesWithAccess} cycle
                            {hod.cyclesWithAccess !== 1 ? "s" : ""} granted
                          </div>
                        )}
                      </div>

                      {/* Scheduled Status */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          {hod.hasScheduled ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-gray-600">
                                Scheduled
                              </span>
                            </>
                          ) : hod.hasAccess ? (
                            <>
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span className="text-xs text-amber-700">
                                Pending
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">-</span>
                            </>
                          )}
                        </div>
                        {isPending && hod.pendingCycles.length > 0 && (
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-[10px] text-amber-700">
                              {hod.pendingCycles.length} cycle
                              {hod.pendingCycles.length !== 1 ? "s" : ""}{" "}
                              pending
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Remind Button for Pending */}
                      {hod.hasAccess && !hod.hasScheduled && (
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
