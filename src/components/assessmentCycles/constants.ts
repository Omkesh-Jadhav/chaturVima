// Configuration and default values for assessment cycle drawer
import type { CycleFormPayload } from "@/types/assessmentCycles";

export const DEFAULT_PAYLOAD: CycleFormPayload = {
  name: "",
  type: "Quarterly" as CycleFormPayload["type"], // Will be overridden with placeholder in create mode
  period: "Fiscal" as CycleFormPayload["period"], // Will be overridden with placeholder in create mode
  startDate: "",
  endDate: "",
  departments: [],
  assessmentType: "",
  notes: "",
};

export const FIELD_CLASSES =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all";

export const DRAWER_CONFIG = {
  create: {
    title: "Create Assessment Cycle",
    getDescription: () =>
      "Define cadence, coverage, and communication in a single flow.",
    getSubmitText: () => "Create Cycle",
  },
  schedule: {
    title: "Schedule assessment",
    getDescription: (cycleName?: string) =>
      `Drop reminders and go-live windows for ${cycleName ?? "the cycle"}.`,
    getSubmitText: (employeeCount?: number) => {
      if (employeeCount !== undefined) {
        return `Schedule for ${employeeCount} Selected Employee${
          employeeCount !== 1 ? "s" : ""
        }`;
      }
      return "Save Schedule";
    },
  },
  edit: {
    title: "Edit Assessment Cycle",
    getDescription: (cycleName?: string) =>
      `Update cycle details for ${cycleName ?? "the cycle"}.`,
    getSubmitText: () => "Save Changes",
  },
} as const;
