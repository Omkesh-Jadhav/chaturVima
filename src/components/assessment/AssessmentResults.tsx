/**
 * AssessmentResults Component
 * Shows results with stage distribution visualization
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "../../components/ui";
import { getAllStages, getStage } from "../../data/assessmentDashboard";
import type { AssessmentResult } from "../../types";
import { Trophy, TrendingUp, CheckCircle } from "lucide-react";

interface AssessmentResultsProps {
  result: AssessmentResult;
  onRetake: () => void;
}

const AssessmentResults = ({ result, onRetake }: AssessmentResultsProps) => {
  const navigate = useNavigate();
  const dominantStage = getStage(result.dominantStage);
  const stages = getAllStages();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Complete! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your honest responses. Here's your organizational health
          profile:
        </p>
      </motion.div>

      {/* Dominant Stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          variant="elevated"
          className="border-l-4"
          style={{ borderLeftColor: dominantStage.color.main }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">{dominantStage.icon}</span>
              Your Primary Stage: {dominantStage.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg">{dominantStage.description}</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Remember:</strong> You're not 100% in one stage. Your
                profile shows a mix across all stages, which is completely
                normal and healthy!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stages.map((stage, index) => {
              const percentage = result.stageDistribution[stage.id];
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{stage.icon}</span>
                      <span className="font-medium text-gray-900">
                        {stage.name}
                      </span>
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: stage.color.main }}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.color.main }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  View Detailed Analytics
                </p>
                <p className="text-sm text-gray-600">
                  Explore your results in the dashboard with team comparisons
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Track Your Journey</p>
                <p className="text-sm text-gray-600">
                  See how your stage distribution changes over time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Compare with Team</p>
                <p className="text-sm text-gray-600">
                  Understand alignment across Employee, Manager, Department, and
                  Company levels
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-4"
      >
        <Button
          onClick={() => navigate("/dashboard")}
          size="lg"
          variant="primary"
        >
          View Dashboard
        </Button>
        <Button onClick={onRetake} size="lg" variant="outline">
          Retake Assessment
        </Button>
      </motion.div>
    </div>
  );
};

export default AssessmentResults;
