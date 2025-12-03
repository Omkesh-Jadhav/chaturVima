/**
 * Department Utility Functions
 * Helper functions for department and department head operations
 */
import { departmentHeadsDirectory } from "@/data/assessmentCycles";
import type { User } from "@/types";
import type { DepartmentHeadAccess } from "@/types/assessmentCycles";

/**
 * Find the department head for a given user based on their department
 * @param user - The user object
 * @returns The department head object if found, null otherwise
 */
export const getDepartmentHeadForUser = (
  user: User | null
): DepartmentHeadAccess | null => {
  if (!user) return null;

  // First, try to find by matching department
  const headByDepartment = departmentHeadsDirectory.find(
    (head) => head.department === user.department
  );

  if (headByDepartment) return headByDepartment;

  // Fallback: try to find by email match (in case user is the department head themselves)
  const headByEmail = departmentHeadsDirectory.find(
    (head) => head.email === user.email
  );

  if (headByEmail) return headByEmail;

  // Return first department head as fallback
  return departmentHeadsDirectory[0] || null;
};

/**
 * Get department head information as a formatted string
 * @param user - The user object
 * @returns Formatted string with department head name and department, or null
 */
export const getDepartmentHeadInfo = (user: User | null): string | null => {
  const head = getDepartmentHeadForUser(user);
  if (!head) return null;
  return `${head.name} (${head.department} Department)`;
};
