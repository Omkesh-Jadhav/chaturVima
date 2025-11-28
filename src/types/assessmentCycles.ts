export type CycleStatus = "Active" | "Upcoming" | "Completed" | "Draft";

export interface AssessmentCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: "Quarterly" | "Annual" | "Ad hoc";
  period: "Fiscal" | "Calendar";
  status: CycleStatus;
  departments: string[];
  participants: number;
  owner: string;
  linkedTeams: number;
  notes?: string;
}

export interface DepartmentHeadAccess {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar?: string;
  activeCycles: number;
}

export type ShareMatrix = Record<string, Record<string, boolean>>;

export interface CycleFormPayload {
  name: string;
  type: AssessmentCycle["type"];
  period: AssessmentCycle["period"];
  startDate: string;
  endDate: string;
  departments: string[];
  notes?: string;
}
