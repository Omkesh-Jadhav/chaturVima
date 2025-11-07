/**
 * Settings Page
 * Main settings page with various options
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../../components/ui";

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
    icon: <User className="h-5 w-5" />,
    path: "/settings/edit-profile",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "security",
    title: "Security",
    description: "Manage security settings and OTP preferences",
    icon: <Shield className="h-5 w-5" />,
    path: "/settings/security",
    color: "from-red-500 to-red-600",
  },
];

const Settings = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-brand-teal" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Settings
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings Options Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid gap-3 md:grid-cols-2 max-w-2xl"
      >
        {SETTINGS_OPTIONS.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={option.path}>
              <Card
                variant="elevated"
                className="group h-full cursor-pointer transition-all duration-300 hover:shadow-xl border-l-4 border-l-transparent hover:border-l-brand-teal bg-white hover:bg-gray-50/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${option.color} text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shrink-0`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-teal transition-colors">
                          {option.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-teal group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Settings;
