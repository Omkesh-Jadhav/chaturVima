/**
 * User Context
 * Global user authentication and state management
 */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, UserContext as UserContextType, UserRole } from "../types";
import { getUserByEmail } from "../data/mockUsers";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for persisted user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("chaturvima_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("chaturvima_user");
      }
    }
  }, []);

  const login = async (email: string, _password: string): Promise<void> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to find existing user by email
    let foundUser = getUserByEmail(email);

    // If user doesn't exist, create a new user dynamically
    if (!foundUser) {
      // Extract name from email (e.g., "john.doe@example.com" -> "John Doe")
      const nameFromEmail = email
        .split("@")[0]
        .split(/[._-]/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");

      // Generate avatar based on email
      const avatarSeed = email.toLowerCase().replace(/[^a-z0-9]/g, "");

      foundUser = {
        id: `user-${Date.now()}`,
        name: nameFromEmail || "User",
        email: email.toLowerCase(),
        role: "employee", // Default role
        department: "General",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
      };
    }

    setUser(foundUser);
    setIsAuthenticated(true);

    // Persist user to localStorage
    localStorage.setItem("chaturvima_user", JSON.stringify(foundUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("chaturvima_user");
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem("chaturvima_user", JSON.stringify(updatedUser));
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    switchRole,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
