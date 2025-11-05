/**
 * Sidebar Component
 * Collapsible navigation sidebar
 */
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import {
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  UserCog,
  Shield,
  Crown,
  LayoutDashboard,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useSidebar } from "../../context/SidebarContext";
import type { UserRole } from "../../types";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[]; // Roles that can access this item
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "super-admin-dashboard",
    label: "Dashboard",
    path: "/super-admin-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["super-admin"],
  },
  {
    id: "assessment-dashboard",
    label: "Dashboard",
    path: "/assessment-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["employee"],
  },
  {
    id: "manager-dashboard",
    label: "Dashboard",
    path: "/manager-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["manager"],
  },
  {
    id: "assessment",
    label: "Assessment",
    path: "/assessment",
    icon: <FileText className="h-5 w-5" />,
    roles: ["employee"],
  },
  {
    id: "organization-setup",
    label: "Organization Setup",
    path: "/organization-setup",
    icon: <FileText className="h-5 w-5" />,
    roles: ["super-admin"],
  },
  {
    id: "hr-dashboard",
    label: "HR Dashboard",
    path: "/hr-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["hr-admin"],
  },
  {
    id: "employee-setup",
    label: "Employee Setup",
    path: "/employee-setup",
    icon: <FileText className="h-5 w-5" />,
    roles: ["hr-admin", "super-admin"],
  },
  {
    id: "deaprtment-setup",
    label: "Department Setup",
    path: "/department-setup",
    icon: <FileText className="h-5 w-5" />,
    roles: ["department-head", "hr-admin", "super-admin"],
  },
];

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  employee: {
    label: "Employee",
    icon: <User className="h-3 w-3" />,
    color: "text-blue-600 bg-blue-50",
  },
  manager: {
    label: "Manager",
    icon: <UserCog className="h-3 w-3" />,
    color: "text-purple-600 bg-purple-50",
  },
  "hr-admin": {
    label: "HR Admin",
    icon: <Shield className="h-3 w-3" />,
    color: "text-green-600 bg-green-50",
  },
  "department-head": {
    label: "Department Head",
    icon: <UserCog className="h-3 w-3" />,
    color: "text-orange-600 bg-orange-50",
  },
  "super-admin": {
    label: "Super Admin",
    icon: <Crown className="h-3 w-3" />,
    color: "text-amber-600 bg-amber-50",
  },
};

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user, logout } = useUser();

  const currentRoleConfig = user ? ROLE_CONFIG[user.role] : null;

  // Filter navigation items based on user role
  const getVisibleNavItems = () => {
    if (!user) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(user.role));
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="expanded-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-teal to-brand-navy text-white font-bold text-xl">
                C
              </div>
              <div>
                <h2 className="font-bold text-brand-navy text-lg">
                  ChaturVima
                </h2>
                <p className="text-xs text-gray-500">Health Diagnostics</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stages-self-reflection to-stages-steady-state flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="expanded-user"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  {currentRoleConfig && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          currentRoleConfig.color
                        )}
                      >
                        {currentRoleConfig.icon}
                        <span>{currentRoleConfig.label}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-brand-teal text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    key="expanded-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
