import type { UserRole } from "@/types";

const roleLandingRoutes: Record<UserRole, string> = {
  "Employee": "/assessment",
  // manager: "/assessment-dashboard",
  "HR Admin": "/hr/dashboard",
  "Department Head": "/department-head/assessment-cycles",
  "Superadmin": "/organization-setup",
  "HR Doctorate": "/hr/organization-health-report",
};

export const getRoleLandingRoute = (role: UserRole | undefined) => {
  if (!role) return "/assessment";
  return roleLandingRoutes[role] ?? "/assessment";
};
