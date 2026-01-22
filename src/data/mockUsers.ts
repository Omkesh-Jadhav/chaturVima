/**
 * Mock User Data
 * 
 * Sample users for different roles and departments.
 * Used for authentication and user context.
 */
import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  {
    user: 'priya.sharma@example.com',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role_profile: ['Employee'],
    api_key: 'mock_key_1',
    api_secret: 'mock_secret_1',
    authorization_header: 'mock_auth_1',
  },
  {
    user: 'anita.desai@example.com',
    full_name: 'Anita Desai',
    email: 'anita.desai@example.com',
    role_profile: ['hr-admin'],
    api_key: 'mock_key_3',
    api_secret: 'mock_secret_3',
    authorization_header: 'mock_auth_3',
  },
  {
    user: 'vikram.singh@example.com',
    full_name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    role_profile: ['department-head'],
    api_key: 'mock_key_4',
    api_secret: 'mock_secret_4',
    authorization_header: 'mock_auth_4',
  },
  {
    user: 'meera.reddy@example.com',
    full_name: 'Meera Reddy',
    email: 'meera.reddy@example.com',
    role_profile: ['super-admin'],
    api_key: 'mock_key_5',
    api_secret: 'mock_secret_5',
    authorization_header: 'mock_auth_5',
  },
];

// Default user for login demo
export const DEFAULT_USER: User = MOCK_USERS[0];

// Get user by email (for login)
export const getUserByEmail = (email: string): User | undefined => {
  return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Get user by ID (using user email as ID)
export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.user === id);
};
