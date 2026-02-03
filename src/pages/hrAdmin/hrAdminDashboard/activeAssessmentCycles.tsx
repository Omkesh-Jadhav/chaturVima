import { useState, useMemo } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SectionHeader } from "@/components/assessmentDashboard";
import { loadCycles } from "@/data/assessmentCycles";
import type { CycleStatus } from "@/types/assessmentCycles";
import { formatDisplayDate } from "@/utils/dateUtils";
import { getCycleStatusColor } from "@/utils/assessmentUtils";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

type StatusFilter = "All" | CycleStatus;

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Active",
  "Completed",
  "Draft",
];

const ActiveAssessmentCycles = () => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const cycles = loadCycles();

  // Filter cycles based on selected status
  const filteredCycles = useMemo(() => {
    let filtered = cycles;

    if (selectedStatus !== "All") {
      filtered = cycles.filter((cycle) => cycle.status === selectedStatus);
    }

    return filtered.sort((a, b) => {
      // Sort by status (Active first, then Draft, then Completed) then by start date
      const statusOrder: Record<string, number> = {
        Active: 1,
        Draft: 2,
        Completed: 3,
      };
      const aOrder = statusOrder[a.status] || 5;
      const bOrder = statusOrder[b.status] || 5;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [cycles, selectedStatus]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Assessment Cycles Status"
        description="Current and upcoming assessment cycles status"
        actions={
          <FilterSelect
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as StatusFilter)}
            options={STATUS_FILTERS}
            className="w-full sm:w-auto min-w-[140px]"
          />
        }
      />

      {/* Cycles List with Scrollbar */}
      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {filteredCycles.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No cycles found for selected status
          </div>
        ) : (
          filteredCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-brand-teal shrink-0" />
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {cycle.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCycleStatusColor(
                        cycle.status,
                        true
                      )}`}
                    >
                      {cycle.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        {formatDisplayDate(cycle.startDate)} -{" "}
                        {formatDisplayDate(cycle.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>{cycle.participants} participants</span>
                      <span className="text-gray-400">•</span>
                      <span>{cycle.departments.length} departments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AnimatedContainer>
  );
};

export default ActiveAssessmentCycles;
