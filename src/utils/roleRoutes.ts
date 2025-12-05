import type { UserRole } from "@/types";

const roleLandingRoutes: Record<UserRole, string> = {
  employee: "/assessment",
  // manager: "/assessment-dashboard",
  "hr-admin": "/hr/dashboard",
  "department-head": "/department-head/assessment-cycles",
  "super-admin": "/organization-setup",
};

export const getRoleLandingRoute = (role: UserRole | undefined) => {
  if (!role) return "/assessment";
  return roleLandingRoutes[role] ?? "/assessment";
};
