// Grid layout displaying department health scores and stage distributions
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { motion } from "framer-motion";
import { TrendingUp, Users, CheckCircle2 } from "lucide-react";
import type { Department } from "../../data/mockAnalytics";
import { getStagePieColor } from "@/utils/assessmentConfig";

interface DepartmentHealthGridProps {
  departments: Department[];
}

export const DepartmentHealthGrid = ({
  departments,
}: DepartmentHealthGridProps) => {
  // Sort departments by health score
  const sortedDepartments = [...departments].sort(
    (a, b) => b.avgHealthScore - a.avgHealthScore
  );

  // Get health color based on score
  const getHealthColor = (score: number): string => {
    if (score >= 75) return "bg-green-500";
    if (score >= 60) return "bg-teal-500";
    if (score >= 45) return "bg-purple-500";
    return "bg-slate-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Department Health Overview</CardTitle>
          <CardDescription>
            Health scores and completion rates by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedDepartments.map((dept, index) => {
              const healthColor = getHealthColor(dept.avgHealthScore);
              const isHighCompletion = dept.assessmentCompletionRate >= 85;

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
                  className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-md"
                >
                  {/* Department Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dept.name}
                      </h3>
                      <div className="mt-1 flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="mr-1 h-3.5 w-3.5" />
                          {dept.employeeCount} employees
                        </span>
                        <span className="flex items-center">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          {dept.assessmentCompletionRate}% completed
                        </span>
                      </div>
                    </div>

                    {/* Health Score Badge */}
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${healthColor} text-white`}
                      >
                        {dept.avgHealthScore}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Health Score</p>
                    </div>
                  </div>

                  {/* Health Score Bar */}
                  <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.avgHealthScore}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.08 }}
                      className={`h-full ${healthColor}`}
                    />
                  </div>

                  {/* Stage Distribution Mini Bar */}
                  <div className="mt-3 flex items-center space-x-1">
                    <div
                      className="flex-1 overflow-hidden rounded-full bg-gray-100"
                      style={{ height: 6 }}
                    >
                      <div className="flex h-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${dept.stageDistribution.honeymoon}%`,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: 1 + index * 0.08,
                          }}
                          style={{ backgroundColor: getStagePieColor("Honeymoon") }}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${dept.stageDistribution["self-reflection"]}%`,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: 1 + index * 0.08,
                          }}
                          style={{ backgroundColor: getStagePieColor("Self-Introspection") }}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${dept.stageDistribution["soul-searching"]}%`,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: 1 + index * 0.08,
                          }}
                          style={{ backgroundColor: getStagePieColor("Soul-Searching") }}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${dept.stageDistribution["steady-state"]}%`,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: 1 + index * 0.08,
                          }}
                          style={{ backgroundColor: getStagePieColor("Steady-State") }}
                        />
                      </div>
                    </div>
                    {isHighCompletion && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  {/* Stage Distribution Labels (on hover) */}
                  <div className="mt-2 grid grid-cols-4 gap-1 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                    <div>■ {dept.stageDistribution.honeymoon}%</div>
                    <div>▲ {dept.stageDistribution["self-reflection"]}%</div>
                    <div>● {dept.stageDistribution["soul-searching"]}%</div>
                    <div>♦ {dept.stageDistribution["steady-state"]}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
