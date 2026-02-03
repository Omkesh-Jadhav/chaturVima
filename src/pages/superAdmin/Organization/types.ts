// Shared type definitions for Organization Setup module

export interface OrganizationInfo {
  name: string;
  company_name: string;
  type: string;
  size: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  department_name?: string;
  custom_department_code?: string;
  company?: string;
  custom_department_head?: string | null;
  department_head_name?: string | null;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  boss: string;
  reports_to?: string;
  reports_to_name?: string;
  role: "Employee" | "Department Head";
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: "success" | "error" | "warning";
}
