/**
 * User Context
 * Global user authentication and state management
 */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, UserContext as UserContextType } from "../types";
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

  const loginWithOTP = async (
    email: string,
    _mobile: string,
    name?: string
  ): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const existingUser = getUserByEmail(email);

    if (!existingUser) {
      throw new Error("Invalid credentials");
    }

    const normalizedName = name?.trim();
    const authenticatedUser = normalizedName
      ? { ...existingUser, name: normalizedName }
      : existingUser;

    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem("chaturvima_user", JSON.stringify(authenticatedUser));

    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("chaturvima_user");
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem("chaturvima_user", JSON.stringify(updatedUser));
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
    loginWithOTP,
    logout,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
