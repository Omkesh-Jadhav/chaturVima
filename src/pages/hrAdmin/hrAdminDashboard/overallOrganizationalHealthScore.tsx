import { useMemo, useState, useEffect } from "react";
import { Users, Award, TrendingUp } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { Badge } from "@/components/ui";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { MOCK_SUB_STAGES, STAGE_ORDER } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import { motion } from "framer-motion";
import { sortStagesByScore } from "@/utils/assessmentUtils";

const DUMMY_DATA = {
  totalEmployees: 156,
  totalResponses: 97,
  stageTotals: {
    "Steady-State": 39.33,
    "Self-Introspection": 31.87,
    "Soul-Searching": 30.0,
    Honeymoon: 32.8,
  },
  stageWeights: {
    "Steady-State": 0.8,
    "Self-Introspection": 0.6,
    "Soul-Searching": 0.5,
    Honeymoon: 0.4,
  },
  responsesByStage: {
    "Steady-State": 24,
    "Self-Introspection": 25,
    "Soul-Searching": 23,
    Honeymoon: 25,
  },
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "Steady-State": "Excellent organizational health",
  "Self-Introspection": "Good organizational health",
  "Soul-Searching": "Moderate organizational health",
  Honeymoon: "Needs improvement",
  Critical: "Requires immediate attention",
};

const getStageFromScore = (score: number) => {
  const stageMap = [
    { threshold: 4.5, stage: "Steady-State" },
    { threshold: 3.5, stage: "Self-Introspection" },
    { threshold: 2.5, stage: "Soul-Searching" },
    { threshold: 1.5, stage: "Honeymoon" },
  ];
  const matched = stageMap.find(({ threshold }) => score >= threshold);
  const stage = matched?.stage || "Critical";
  return {
    stage,
    description: STAGE_DESCRIPTIONS[stage],
    hexColor: stage === "Critical" ? "#EF4444" : getStagePieColor(stage),
  };
};

const STAGES_ORDER = STAGE_ORDER;

const OverallOrganizationalHealthScore = () => {
  const { totalEmployees, stageTotals, responsesByStage } = DUMMY_DATA;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStageScores, setAnimatedStageScores] = useState<
    Record<string, number>
  >({});

  // Convert each stage total to a 1-5 scale score
  const stageScores = useMemo(() => {
    const scores: Record<string, number> = {};
    STAGES_ORDER.forEach((stage) => {
      const total = (stageTotals as Record<string, number>)[stage] || 0;
      const score = Math.min(5, Math.max(1, (total / 40) * 5));
      scores[stage] = score;
    });
    return scores;
  }, [stageTotals]);

  // Calculate average of all 4 stage scores
  const calculatedOverallScore = useMemo(() => {
    const allScores = Object.values(stageScores);
    const average =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    return average;
  }, [stageScores]);

  // Find dominant stage (highest score)
  const dominantStage = useMemo(() => {
    return Object.entries(stageScores).reduce(
      (max, [stage, score]) => (score > max.score ? { stage, score } : max),
      { stage: "Steady-State", score: 0 }
    );
  }, [stageScores]);

  const stageInfo = useMemo(
    () => getStageFromScore(calculatedOverallScore),
    [calculatedOverallScore]
  );
  const scorePercentage = (calculatedOverallScore / 5) * 100;
  const gaugeAngle = (scorePercentage / 100) * 180 - 90;

  // Animate overall score
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev >= calculatedOverallScore) {
          clearInterval(interval);
          return calculatedOverallScore;
        }
        return prev + 0.05;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [calculatedOverallScore]);

  // Animate stage scores
  useEffect(() => {
    const intervals: ReturnType<typeof setInterval>[] = [];
    STAGES_ORDER.forEach((stage) => {
      const targetScore = stageScores[stage];
      const steps = 30;
      const increment = targetScore / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setAnimatedStageScores((prev) => ({ ...prev, [stage]: targetScore }));
          clearInterval(interval);
        } else {
          setAnimatedStageScores((prev) => ({ ...prev, [stage]: current }));
        }
      }, 50);
      intervals.push(interval);
    });
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [stageScores]);

  const subStageDistribution = useMemo(() => {
    const currentStage = dominantStage.stage;
    const subStages = MOCK_SUB_STAGES[currentStage] || [];
    const distribution: Record<string, number> = {};
    subStages.forEach((subStage) => {
      distribution[subStage.label] = 0;
    });

    hrDashboardData.employee.forEach((employee) => {
      if (employee.stageDetails.stage === currentStage) {
        employee.stageDetails.subStageDetails.forEach((subStageDetail) => {
          const subStageLabel = subStageDetail.subStage.trim();
          if (
            Object.prototype.hasOwnProperty.call(distribution, subStageLabel)
          ) {
            distribution[subStageLabel]++;
          }
        });
      }
    });

    if (Object.values(distribution).every((count) => count === 0)) {
      const totalAllStages = Object.values(stageTotals).reduce(
        (sum, s) => sum + s,
        0
      );
      subStages.forEach((subStage, index) => {
        const proportion =
          ((stageTotals[currentStage as keyof typeof stageTotals] || 0) /
            totalAllStages) *
          (0.2 + index * 0.1);
        distribution[subStage.label] = Math.round(totalEmployees * proportion);
      });
    }
    return distribution;
  }, [dominantStage.stage, totalEmployees, stageTotals]);

  const maxScore = Math.max(...Object.values(stageScores));

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className="space-y-4"
    >
      {/* Main Section - Meter & Dominant Stage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circular Meter - Shows Average Score */}
          <div className="flex justify-center items-center">
            <div className="relative w-56 h-56">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 240 240"
              >
                {/* Background Arc */}
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset="157"
                />
                {/* Colored Zones */}
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#FEE2E2"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="78.5"
                  strokeDashoffset="157"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="78.5"
                  strokeDashoffset="78.5"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#D1FAE5"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="157"
                  strokeDashoffset="0"
                />
                {/* Animated Progress Arc */}
                <motion.circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke={stageInfo.hexColor}
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset="157"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{
                    strokeDashoffset: 314 - (scorePercentage / 100) * 157,
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  style={{
                    filter: `drop-shadow(0 0 15px ${stageInfo.hexColor}60)`,
                  }}
                />
                {/* Needle */}
                <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: gaugeAngle }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  style={{ transformOrigin: "120px 120px" }}
                >
                  <line
                    x1="120"
                    y1="120"
                    x2="120"
                    y2="35"
                    stroke="#1F2937"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="120" cy="120" r="8" fill="#1F2937" />
                </motion.g>
                {/* Scale Numbers */}
                {[1, 2, 3, 4, 5].map((mark, i) => {
                  const angle = (i / 4) * 180 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const x = 120 + 115 * Math.cos(rad);
                  const y = 120 + 115 * Math.sin(rad);
                  return (
                    <text
                      key={mark}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#6B7280"
                      fontSize="16"
                      fontWeight="700"
                      transform={`rotate(${angle + 90} ${x} ${y})`}
                    >
                      {mark}
                    </text>
                  );
                })}
              </svg>
              {/* Center Display - Average Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-5xl font-black mb-1"
                  style={{ color: stageInfo.hexColor }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {animatedScore.toFixed(1)}
                </motion.div>
                <div className="text-sm text-gray-500 font-semibold">/ 5.0</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Average Score
                </div>
              </div>
            </div>
          </div>

          {/* Dominant Stage Info - Shows Stage's Own Score */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${stageInfo.hexColor}15` }}
              >
                <Award
                  className="h-5 w-5"
                  style={{ color: stageInfo.hexColor }}
                />
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dominant Stage
              </div>
            </div>
            <div
              className="text-4xl font-black mb-2"
              style={{ color: stageInfo.hexColor }}
            >
              {dominantStage.stage}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {stageInfo.description}
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Score</div>
                <div
                  className="text-2xl font-black"
                  style={{ color: stageInfo.hexColor }}
                >
                  {dominantStage.score.toFixed(1)}/5
                </div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Responses</div>
                <div className="text-2xl font-black text-gray-900">
                  {(responsesByStage as Record<string, number>)[
                    dominantStage.stage
                  ] || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Performance Strips */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">
            Stage Performance (1-5 Scale)
          </h3>
        </div>
        <div className="space-y-3">
          {sortStagesByScore<{ stage: string; score: number }>(
            STAGES_ORDER.map((stage) => ({
              stage,
              score: animatedStageScores[stage] || stageScores[stage] || 0,
            })),
            "score"
          ).map(({ stage, score }, idx) => {
            const color = getStagePieColor(stage);
            const isDominant = stage === dominantStage.stage;
            const barWidth = (score / maxScore) * 100;
            const responses =
              (responsesByStage as Record<string, number>)[stage] || 0;

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border ${
                  isDominant
                    ? "bg-orange-50 border-orange-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-bold text-gray-900">
                      {stage}
                    </span>
                    {isDominant && (
                      <Award className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-600">
                      {responses} resp
                    </div>
                    <div
                      className="text-base font-black"
                      style={{ color: color }}
                    >
                      {score.toFixed(1)}/5
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {/* Scale Markers */}
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    {[1, 2, 3, 4, 5].map((mark) => (
                      <div
                        key={mark}
                        className="w-0.5 h-3 bg-gray-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sub-Stages Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Sub-Stages Distribution
            </h3>
          </div>
          <Badge
            className="px-2 py-0.5 text-xs font-bold border"
            style={{
              backgroundColor: `${stageInfo.hexColor}15`,
              color: stageInfo.hexColor,
              borderColor: stageInfo.hexColor,
            }}
          >
            {dominantStage.stage}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {Object.entries(subStageDistribution).map(
            ([subStage, count], index) => {
              const totalInStage = Object.values(subStageDistribution).reduce(
                (sum, c) => sum + c,
                0
              );
              const barWidth =
                totalInStage > 0 ? (count / totalInStage) * 100 : 0;
              return (
                <motion.div
                  key={subStage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="text-xs font-semibold text-gray-800 mb-1 truncate">
                    {subStage}
                  </div>
                  <div className="text-xl font-black text-gray-900 mb-1">
                    {count}
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + index * 0.03 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stageInfo.hexColor }}
                    />
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default OverallOrganizationalHealthScore;
