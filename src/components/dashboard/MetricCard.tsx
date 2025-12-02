import { Card, CardContent } from "../../components/ui";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: ComponentType<LucideProps>;
  iconColor: string;
  delay?: number;
}

export const MetricCard = ({
  label,
  value,
  trend,
  icon: Icon,
  iconColor,
  delay = 0,
}: MetricCardProps) => {
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
            <div className={`rounded-full p-3 ${iconColor}`}>
              <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
