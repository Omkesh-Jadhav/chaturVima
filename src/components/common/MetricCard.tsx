// Unified metric card component supporting multiple variants
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<LucideProps>;
  iconColor?: string;
  gradient?: string;
  trend?: { value: string; isPositive: boolean };
  delay?: number;
  variant?: "default" | "compact";
}

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  gradient,
  trend,
  delay = 0,
  variant = "default",
}: MetricCardProps) => {
  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ y: -1, scale: 1.005 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="group rounded-2xl border border-gray-100 bg-white/95 px-3 py-3 shadow-sm ring-1 ring-transparent transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          {Icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                gradient || "bg-gradient-to-br from-brand-teal to-brand-navy"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <motion.p
                className="mt-2 text-3xl font-bold text-gray-900"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              {trend && (
                <p
                  className={`mt-1 text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.value} from last month
                </p>
              )}
            </div>
            {Icon && (
              <div className={`rounded-full p-3 ${iconColor || "bg-brand-teal"}`}>
                <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

