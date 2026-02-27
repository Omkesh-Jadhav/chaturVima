// Top navigation bar with role switching and user menu
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ChevronUp,
  Shield,
  UserCog,
  Crown,
  X,
  Check,
  GraduationCap,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { LogoutUser } from "../../api/api-functions/authentication";
import type { UserRole } from "../../types";
import { cn } from "../../utils/cn";
import { getRoleLandingRoute } from "../../utils/roleRoutes";
import { getFirstLetter } from "../../utils/commonUtils";

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  "Employee": {
    label: "Employee",
    icon: <User className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-50",
  },
  "Department Head": {
    label: "Department Head",
    icon: <UserCog className="h-4 w-4" />,
    color: "text-purple-600 bg-purple-50",
  },
  "HR Admin": {
    label: "HR Admin",
    icon: <Shield className="h-4 w-4" />,
    color: "text-green-600 bg-green-50",
  },
  "Superadmin": {
    label: "Super Admin",
    icon: <Crown className="h-4 w-4" />,
    color: "text-amber-600 bg-amber-50",
  },
  "HR Doctorate": {
    label: "HR Doctorate",
    icon: <GraduationCap className="h-4 w-4" />,
    color: "text-purple-600 bg-purple-50",
  },
};

const Navbar = () => {
  const { user, logout, switchRole } = useUser();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const currentRoleConfig = user.role_profile?.length > 0 ? ROLE_CONFIG[user.role_profile[0] as UserRole] ?? {
    label: user.role_profile[0],
    icon: <User className="h-4 w-4" />,
    color: "text-gray-700 bg-gray-100",
  } : {
    label: "User",
    icon: <User className="h-4 w-4" />,
    color: "text-gray-700 bg-gray-100",
  };

  // Get available roles from user's role_profile array (excluding current active role)
  let availableRoles = (user.role_profile || []).filter(
    (role): role is UserRole => role !== user.role_profile?.[0] && Boolean(ROLE_CONFIG[role as UserRole])
  ) as UserRole[];

  // Special case: If user has "HR Admin" role, also add "Employee" role as available option
  const currentRole = user.role_profile?.[0];
  if (currentRole === "HR Admin" && !availableRoles.includes("Employee")) {
    availableRoles = [...availableRoles, "Employee"];
  }

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleMenu(false);
    navigate(getRoleLandingRoute(newRole));
  };

  const handleLogout = async () => {
    try {
      // Call the logout API which will clear tokens and invalidate session
      const result = await LogoutUser();
      
      if (result.success) {
        // Successfully logged out from backend
        logout(); // Clear local user data
        navigate("/login");
      } else {
        // Backend logout failed, but still clear local session
        console.warn("Backend logout failed:", result.error);
        // Clear tokens and local data anyway for security
        localStorage.removeItem('apiKey');
        localStorage.removeItem('apiSecret');
        logout();
        navigate("/login");
      }
    } catch (error) {
      // Network error or other issues - still logout locally for security
      console.error("Logout error:", error);
      // Clear tokens and local data anyway for security
      localStorage.removeItem('apiKey');
      localStorage.removeItem('apiSecret');
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Empty for spacing */}
        <div className="flex flex-1 items-center gap-4"></div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium transition-all hover:border-brand-teal hover:bg-gray-50"
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-0.5",
                  currentRoleConfig.color
                )}
              >
                {currentRoleConfig.icon}
                <span className="hidden sm:inline">
                  {currentRoleConfig.label}
                </span>
              </div>
              {showRoleMenu ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {/* Role Menu Dropdown */}
            <AnimatePresence>
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="p-2">
                      <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Switch Role
                      </div>
                      <div className="space-y-1">
                        {availableRoles.map((role) => {
                          const roleCfg = ROLE_CONFIG[role];
                          if (!roleCfg) return null;
                          return (
                            <button
                              key={role}
                              onClick={() => handleRoleSwitch(role)}
                              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-center rounded-lg p-2",
                                  roleCfg.color
                                )}
                              >
                                {roleCfg.icon}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {roleCfg.label}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                          <div
                            className={cn(
                              "flex items-center justify-center rounded-lg p-1.5",
                              currentRoleConfig.color
                            )}
                          >
                            {currentRoleConfig.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-900">
                              Current: {currentRoleConfig.label}
                            </div>
                          </div>
                          <Check className="h-4 w-4 text-brand-teal" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="relative flex cursor-pointer items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <div className="text-xs font-medium text-blue-900">
                            New assessment available
                          </div>
                          <div className="mt-1 text-xs text-blue-700">
                            2 hours ago
                          </div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                          <div className="text-xs font-medium text-green-900">
                            Your report is ready
                          </div>
                          <div className="mt-1 text-xs text-green-700">
                            1 day ago
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
                setShowNotifications(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-linear-to-br from-brand-teal to-brand-navy text-sm font-semibold text-white"
                aria-hidden
              >
                {getFirstLetter(user.full_name, user.email || user.user)}
              </div>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 sm:block" />
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="p-2">
                      <div className="mb-2 rounded-lg bg-linear-to-r from-brand-teal/10 to-brand-navy/10 p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-brand-teal to-brand-navy text-base font-semibold text-white"
                            aria-hidden
                          >
                            {getFirstLetter(user.full_name, user.email || user.user)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.full_name || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email || user.user || ''}
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <div
                                className={cn(
                                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                  currentRoleConfig.color
                                )}
                              >
                                {currentRoleConfig.icon}
                                {currentRoleConfig.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setShowUserMenu(false);
                          }}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
