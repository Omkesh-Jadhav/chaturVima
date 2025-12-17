import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { Badge } from "../ui";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { STAGES } from "../../data/assessmentDashboard";
import type { AssessmentActivity } from "../../data/mockAnalytics";

interface RecentActivityListProps {
  activities: AssessmentActivity[];
  limit?: number;
}

export const RecentActivityList = ({
  activities,
  limit = 5,
}: RecentActivityListProps) => {
  const displayActivities = activities.slice(0, limit);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest completed assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const stage = STAGES[activity.dominantStage];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  className="flex items-start space-x-4 rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  {/* User Avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${stage.color.main}20` }}
                  >
                    <User
                      className="h-5 w-5"
                      style={{ color: stage.color.main }}
                    />
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {activity.userName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.userRole} · {activity.department}
                        </p>
                      </div>
                      <Badge
                        className="border"
                        style={{
                          borderColor: stage.color.main,
                          color: stage.color.main,
                          backgroundColor: `${stage.color.main}10`,
                        }}
                      >
                        {stage.icon} {stage.name}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTimeAgo(activity.completedAt)}
                      </span>
                      <span>
                        Completed in {Math.round(activity.completionTime)}min
                      </span>
                    </div>
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
