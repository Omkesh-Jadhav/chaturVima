import type { UserRole } from "@/types";

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  employee: "/assessment-dashboard",
  "super-admin": "/super-admin-dashboard",
};

export const getDefaultRouteForRole = (role?: UserRole): string => {
  if (!role) {
    return ROLE_HOME_ROUTE.employee;
  }

  return ROLE_HOME_ROUTE[role];
};
