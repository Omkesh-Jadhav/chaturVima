export type CycleStatus = "Active" | "Draft" | "Completed";

export interface AssessmentCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: "Quarterly" | "Annual" | "Adhoc";
  period: "Fiscal" | "Calendar";
  status: CycleStatus;
  departments: string[];
  assessmentTypes: string[];
  allowCustomUpload?: boolean;
  customQuestionnaireName?: string;
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
  assessmentType: string;
  notes?: string;
  employees?: string[]; // Employee IDs/codes for manual selection
}
