/**
 * Mock User Data
 * Sample users for different roles and departments
 */
import type { User } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "employee-1",
    name: "Priya Sharma",
    email: "employee@demo.com",
    role: "employee",
    department: "Engineering",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
  {
    id: "super-admin-1",
    name: "Meera Reddy",
    email: "superadmin@demo.com",
    role: "super-admin",
    department: "Administration",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
  },
];

export const getUserByEmail = (email: string): User | undefined => {
  return MOCK_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase()
  );
};
