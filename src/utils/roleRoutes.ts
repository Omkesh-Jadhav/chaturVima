import type { UserRole } from "@/types";

const roleLandingRoutes: Record<UserRole, string> = {
  "Employee": "/assessment",
  "Department Head": "/department-head",
  "HR Admin": "/hr/dashboard",
  "Superadmin": "/organization-setup",
  "HR Doctorate": "/hr/organization-health-report",
};

export const getRoleLandingRoute = (role: UserRole | undefined) => {
  if (!role) return "/assessment";
  return roleLandingRoutes[role] ?? "/assessment";
};
