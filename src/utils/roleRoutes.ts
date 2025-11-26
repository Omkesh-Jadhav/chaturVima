import type { UserRole } from "@/types";

const roleLandingRoutes: Record<UserRole, string> = {
  employee: "/assessment-dashboard",
  manager: "/assessment-dashboard",
  "hr-admin": "/hr/assessment-cycles",
  "department-head": "/department-head/assessment-cycles",
  "super-admin": "/super-admin-dashboard",
};

export const getRoleLandingRoute = (role: UserRole | undefined) => {
  if (!role) return "/assessment-dashboard";
  return roleLandingRoutes[role] ?? "/assessment-dashboard";
};
