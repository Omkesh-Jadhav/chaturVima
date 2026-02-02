// Collapsible navigation sidebar with role-based menu items
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  UserCog,
  Shield,
  Crown,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useSidebar } from "../../context/SidebarContext";
import type { UserRole } from "../../types";
import logoImage from "../../assets/chaturvima-logo.png";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[]; // Roles that can access this item
}

const NAV_ITEMS: NavItem[] = [
  // {
  //   id: "super-admin-dashboard",
  //   label: "Dashboard",
  //   path: "/super-admin-dashboard",
  //   icon: <LayoutDashboard className="h-5 w-5" />,
  //   roles: ["super-admin"],
  // },
  {
    id: "assessment-dashboard",
    label: "Dashboard",
    path: "/assessment-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["Employee"],
  },
  {
    id: "hr-admin-dashboard",
    label: "Dashboard",
    path: "/hr/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["HR Admin"],
  },
  // {
  //   id: "manager-dashboard",
  //   label: "Dashboard",
  //   path: "/manager-dashboard",
  //   icon: <LayoutDashboard className="h-5 w-5" />,
  //   roles: ["manager"],
  // },
  {
    id: "assessment",
    label: "Assessment",
    path: "/assessment",
    icon: <FileText className="h-5 w-5" />,
    roles: ["Employee"],
  },
  {
    id: "organization-setup",
    label: "Organization Setup",
    path: "/organization-setup",
    icon: <FileText className="h-5 w-5" />,
    roles: ["Superadmin", "HR Admin"],
  },
  {
    id: "hr-assessment-cycles",
    label: "Assessment Cycles",
    path: "/hr/assessment-cycles",
    icon: <CalendarDays className="h-5 w-5" />,
    roles: ["HR Admin"],
  },
  {
    id: "hr-organization-health-report",
    label: "Organization Report",
    path: "/hr/organization-health-report",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["HR Admin", "HR Doctorate"],
  },
  {
    id: "department-head-cycles",
    label: "Assessment Cycles",
    path: "/department-head/assessment-cycles",
    icon: <CalendarDays className="h-5 w-5" />,
    roles: ["Department Head"],
  },
  // {
  //   id: "employee-setup",
  //   label: "Employee Setup",
  //   path: "/employee-setup",
  //   icon: <FileText className="h-5 w-5" />,
  //   roles: ["hr-admin", "super-admin"],
  // },
  // {
  //   id: "deaprtment-setup",
  //   label: "Department Setup",
  //   path: "/department-setup",
  //   icon: <FileText className="h-5 w-5" />,
  //   roles: ["department-head", "hr-admin", "super-admin"],
  // },
];

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  "Employee": {
    label: "Employee",
    icon: <User className="h-3 w-3" />,
    color: "text-blue-600 bg-blue-50",
  },
  // manager: {
  //   label: "Manager",
  //   icon: <UserCog className="h-3 w-3" />,
  //   color: "text-purple-600 bg-purple-50",
  // },
  "HR Admin": {
    label: "HR Admin",
    icon: <Shield className="h-3 w-3" />,
    color: "text-green-600 bg-green-50",
  },
  "Department Head": {
    label: "Department Head",
    icon: <UserCog className="h-3 w-3" />,
    color: "text-orange-600 bg-orange-50",
  },
  "Superadmin": {
    label: "Super Admin",
    icon: <Crown className="h-3 w-3" />,
    color: "text-amber-600 bg-amber-50",
  },
  "HR Doctorate": {
    label: "HR Doctorate",
    icon: <GraduationCap className="h-3 w-3" />,
    color: "text-purple-600 bg-purple-50",
  },
};

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useUser();

  const currentRoleConfig = user && user.role_profile?.length > 0 ? ROLE_CONFIG[user.role_profile[0] as UserRole] : null;

  // Filter navigation items based on user role
  const getVisibleNavItems = () => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => user.role_profile?.length > 0 && item.roles.includes(user.role_profile[0] as UserRole));
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
          <motion.div
            key={isCollapsed ? "collapsed-header" : "expanded-header"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              isCollapsed
                ? "flex items-center justify-center"
                : "flex items-center"
            }
          >
            <img
              src={logoImage}
              alt="ChaturVima Logo"
              className={
                isCollapsed
                  ? "h-10 w-auto object-contain"
                  : "h-12 w-auto object-contain"
              }
            />
          </motion.div>
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
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-stages-self-reflection to-stages-steady-state flex items-center justify-center text-white font-semibold">
                {user.full_name?.charAt(0) || 'U'}
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
                    {user.full_name || 'User'}
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
              <span className="shrink-0">{item.icon}</span>
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
    </motion.aside>
  );
};

export default Sidebar;
