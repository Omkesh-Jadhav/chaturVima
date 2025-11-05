/**
 * Settings Page
 * Main settings page with various options
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  KeyRound,
  CreditCard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui";
import { useUser } from "../context/UserContext";

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const SETTINGS_OPTIONS: SettingsOption[] = [
  {
    id: "profile",
    title: "Edit Profile",
    description: "Update your personal information and profile details",
    icon: <User className="h-6 w-6" />,
    path: "/settings/edit-profile",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage your notification preferences",
    icon: <Bell className="h-6 w-6" />,
    path: "/settings/notifications",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "security",
    title: "Security",
    description: "Change password and manage security settings",
    icon: <Shield className="h-6 w-6" />,
    path: "/settings/security",
    color: "from-red-500 to-red-600",
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize theme and display preferences",
    icon: <Palette className="h-6 w-6" />,
    path: "/settings/appearance",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "language",
    title: "Language & Region",
    description: "Set your language and regional preferences",
    icon: <Globe className="h-6 w-6" />,
    path: "/settings/language",
    color: "from-green-500 to-green-600",
  },
  {
    id: "privacy",
    title: "Privacy",
    description: "Control your privacy and data settings",
    icon: <KeyRound className="h-6 w-6" />,
    path: "/settings/privacy",
    color: "from-indigo-500 to-indigo-600",
  },
];

const Settings = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* User Info Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal to-brand-navy text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className="mt-2 inline-block rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Settings Options Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {SETTINGS_OPTIONS.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
          >
            <Link to={option.path}>
              <Card
                variant="elevated"
                className="group h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.color} text-white shadow-md`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-brand-teal transition-colors">
                          {option.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-brand-teal transition-colors flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-teal" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Contact support or view our documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <button className="text-sm font-medium text-brand-teal hover:text-brand-teal/80 transition-colors">
                View Documentation
              </button>
              <button className="text-sm font-medium text-brand-teal hover:text-brand-teal/80 transition-colors">
                Contact Support
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
