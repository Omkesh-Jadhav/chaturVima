/**
 * User Context
 * Global user authentication and state management
 */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, UserContext as UserContextType, UserRole } from "../types";

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
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  const loginWithOTP = async (
    email: string,
    _mobile: string,
    name?: string,
    apiResponse?: any // Accept actual API response
  ): Promise<void> => {
    // Simulate API call delay for OTP verification
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Note: _mobile parameter is kept for API compatibility but not used in mock implementation
    // In production, this would be used for OTP verification

    // Create user object from actual API response or mock data
    const apiUser: User = apiResponse?.message ? {
      user: apiResponse.message.user,
      full_name: apiResponse.message.full_name,
      email: apiResponse.message.email || email,
      role_profile: apiResponse.message.role_profile, // Now an array
      api_key: apiResponse.message.api_key,
      api_secret: apiResponse.message.api_secret,
      authorization_header: apiResponse.message.authorization_header
    } : {
      // Fallback for mock/development
      user: email.toLowerCase(),
      full_name: name || email.split("@")[0].split(/[._-]/).map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(" ") || "User",
      email: email,
      role_profile: ["Employee"], // Default role as array
      api_key: `mock_token_${Date.now()}`,
      api_secret: `mock_refresh_${Date.now()}`,
      authorization_header: `mock_refresh_${Date.now()}`
    };

    setUser(apiUser);
    setIsAuthenticated(true);

    // Persist user to localStorage - only the 5 required fields
    localStorage.setItem("chaturvima_user", JSON.stringify(apiUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("chaturvima_user");
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    // Update role_profile array - replace first role or add new role
    const updatedRoles = [...user.role_profile];
    if (updatedRoles.length > 0) {
      updatedRoles[0] = newRole; // Replace primary role
    } else {
      updatedRoles.push(newRole); // Add if no roles exist
    }
    const updatedUser = { ...user, role_profile: updatedRoles };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem("chaturvima_user", JSON.stringify(updatedUser));
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
    isLoading,
    loginWithOTP,
    logout,
    switchRole,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
