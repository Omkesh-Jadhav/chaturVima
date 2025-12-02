/**
 * Summary Card Component
 * Displays a metric with label, value, and icon
 */

import { motion } from "framer-motion";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
}

export const SummaryCard = ({
  label,
  value,
  icon: Icon,
  gradient,
}: SummaryCardProps) => (
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
            gradient || "bg-linear-to-br from-brand-teal to-brand-navy"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  </motion.div>
);
