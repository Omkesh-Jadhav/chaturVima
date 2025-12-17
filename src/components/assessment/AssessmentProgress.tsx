/**
 * Assessment Progress Component
 *
 * Displays progress bar with milestone celebrations and visual indicators.
 * Shows completion percentage and celebrates milestones at 25%, 50%, 75%, and 100%.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "../../components/ui";
import { Sparkles, Award, Rocket, Trophy } from "lucide-react";

interface AssessmentProgressProps {
  current: number;
  total: number;
  percentage: number;
}

// ==================== Constants ====================
const MILESTONES = [
  { value: 25, label: "Great start!", icon: Sparkles, color: "text-blue-500" },
  { value: 50, label: "Halfway there!", icon: Award, color: "text-purple-500" },
  { value: 75, label: "Almost done!", icon: Rocket, color: "text-orange-500" },
  { value: 100, label: "Complete!", icon: Trophy, color: "text-green-500" },
] as const;

const AssessmentProgress = ({
  current,
  total,
  percentage,
}: AssessmentProgressProps) => {
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<
    (typeof MILESTONES)[number] | null
  >(null);

  useEffect(() => {
    // Check if we just hit a milestone
    const milestone = MILESTONES.find((m) => m.value === percentage);
    if (milestone && percentage > 0) {
      setCurrentMilestone(milestone);
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
  }, [percentage]);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <Progress value={current} max={total} showLabel={false} size="lg" />

        {/* Milestone indicators */}
        <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
          {MILESTONES.map((milestone) => {
            const position = milestone.value;
            const isPassed = percentage >= position;
            const Icon = milestone.icon;

            return (
              <motion.div
                key={milestone.value}
                className="relative"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                initial={{ scale: 0 }}
                animate={{ scale: isPassed ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    ${isPassed ? "bg-brand-teal shadow-lg" : "bg-gray-300"}
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isPassed ? "text-white" : "text-gray-500"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Question {current} of {total}
        </span>
        <span className="font-semibold text-brand-teal">
          {percentage}% Complete
        </span>
      </div>

      {/* Milestone Celebration */}
      {showMilestone && currentMilestone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <currentMilestone.icon
              className={`w-6 h-6 ${currentMilestone.color}`}
            />
            <span className="text-lg font-bold text-gray-900">
              {currentMilestone.label}
            </span>
            <currentMilestone.icon
              className={`w-6 h-6 ${currentMilestone.color}`}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Keep up the great work! 🎉
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentProgress;
