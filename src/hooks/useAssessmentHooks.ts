// Custom hooks for assessment filtering and searching
import { useMemo, useState } from "react";
import type { Priority, CompletedAssessment } from "@/data/assessmentDashboard";
import { filterByPriority } from "@/utils/assessmentUtils";

export const usePriorityFilter = <T extends { priority: Priority }>(items: T[]) => {
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const filteredItems = useMemo(
    () => filterByPriority(items, priorityFilter),
    [items, priorityFilter]
  );
  return { priorityFilter, setPriorityFilter, filteredItems };
};

export const useAssessmentSearch = (assessments: CompletedAssessment[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAssessments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return [...assessments].sort((a, b) => b.date.localeCompare(a.date));
    }
    const filtered = assessments.filter((assessment) =>
      assessment.category.toLowerCase().includes(query)
    );
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [assessments, searchQuery]);
  return { searchQuery, setSearchQuery, filteredAssessments };
};

