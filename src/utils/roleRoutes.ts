import type { UserRole } from "@/types";

const roleLandingRoutes: Record<UserRole, string> = {
  employee: "/assessment",
  manager: "/assessment-dashboard",
  "hr-admin": "/hr/assessment-cycles",
  "department-head": "/department-head/assessment-cycles",
  "super-admin": "/super-admin-dashboard",
};

export const getRoleLandingRoute = (role: UserRole | undefined) => {
  if (!role) return "/assessment";
  return roleLandingRoutes[role] ?? "/assessment";
};
