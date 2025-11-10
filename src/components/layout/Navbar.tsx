/**
 * Navbar Component
 * Top navigation bar with notifications and user menu
 */
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Crown,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { cn } from "../../utils/cn";
import type { UserRole } from "../../types";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: JSX.Element; color: string }
> = {
  employee: {
    label: "Employee",
    icon: <User className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-50",
  },
  "super-admin": {
    label: "Super Admin",
    icon: <Crown className="h-4 w-4" />,
    color: "text-amber-600 bg-amber-50",
  },
};

const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const currentRoleConfig = ROLE_CONFIG[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Empty for spacing */}
        <div className="flex flex-1 items-center gap-4"></div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
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
                setShowNotifications(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border-2 border-gray-200"
              />
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
                      <div className="mb-2 rounded-lg bg-gradient-to-r from-brand-teal/10 to-brand-navy/10 p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full border-2 border-white"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
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
