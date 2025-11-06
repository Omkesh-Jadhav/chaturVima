/**
 * Mock User Data
 * Sample users for different roles and departments
 */
import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
  {
    id: 'user-2',
    name: 'Raj Patel',
    email: 'raj.patel@example.com',
    role: 'manager',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
  },
  {
    id: 'user-3',
    name: 'Anita Desai',
    email: 'anita.desai@example.com',
    role: 'hr-admin',
    department: 'Human Resources',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
  },
  {
    id: 'user-4',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    role: 'department-head',
    department: 'Executive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
  },
  {
    id: 'user-5',
    name: 'Meera Reddy',
    email: 'meera.reddy@example.com',
    role: 'super-admin',
    department: 'Administration',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
  },
];

// Default user for login demo
export const DEFAULT_USER: User = MOCK_USERS[0];

// Get user by email (for login)
export const getUserByEmail = (email: string): User | undefined => {
  return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};
