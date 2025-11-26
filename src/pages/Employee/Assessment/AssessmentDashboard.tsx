/**
 * Assessment Dashboard (custom build with Nivo)
 *
 * Features:
 * - Summary Cards (completed, pending, avg score, last completed)
 * - Visual Analytics: Score progress (Line), Category distribution (Pie), Strengths (Bar)
 * - Pending Assessments list with priorities and Start buttons
 * - Test History table with View Report
 *
 * Typography Standards:
 * - Page Title: text-2xl md:text-3xl font-bold
 * - Section Headings: text-lg font-semibold
 * - Subsection Headings: text-base font-medium
 * - Card Labels: text-sm font-medium
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsivePie } from "@nivo/pie";
import {
  Play,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CheckCircle,
  TrendingUp,
  XCircle,
  Lightbulb,
  ShieldAlert,
  Search,
  X,
} from "lucide-react";
import { colors } from "../../../utils/colors";

type Priority = "High" | "Medium" | "Low";
type SWOTRating = "HIGH" | "MEDIUM" | "CRITICAL";

type SWOTItem = {
  id: string;
  title: string;
  description: string;
  rating: SWOTRating;
};

type SWOTQuadrant = {
  type: "Strengths" | "Weaknesses" | "Opportunities" | "Threats";
  items: SWOTItem[];
};

type PendingAssessment = {
  id: string;
  title: string;
  category: string;
  dueDate: string; // ISO or human
  priority: Priority;
};

type CompletedAssessment = {
  id: string;
  title: string;
  category: string;
  date: string;
  score: number; // 0-100
  percentile: number; // 0-100
};

// Brand colors - using centralized color system
const brand = {
  teal: colors.brand.tealLight,
  tealDark: colors.brand.tealDark,
  tealBrand: colors.brand.teal,
  navyBrand: colors.brand.navy,
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
  sky: colors.semantic.info,
  slate700: colors.neutral.gray700,
  slate500: colors.neutral.gray500,
  slate200: colors.neutral.gray200,
  green: colors.semantic.success,
  amber: colors.semantic.warning,
  red: colors.semantic.error,
} as const;

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
}) => (
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

// Priority styling - centralized for consistency
const getPriorityStyles = (priority: Priority): string => {
  const styles: Record<Priority, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-green-50 text-green-700 border-green-200",
  };
  return styles[priority];
};

type StageDatum = { id: string; label: string; value: number };
type EmotionalIntensityRow = {
  state: string;
  values: {
    Optimism: number;
    Energy: number;
    Realism: number;
    Stability: number;
  };
};
type EmotionalStageAssessment = {
  stage: string;
  score: number;
  color: string;
  status?: "Dominant" | "Secondary" | "Transitional";
};
type SubStage = {
  id: string;
  label: string;
  value: number;
};

const formatDisplayDate = (value: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

const AssessmentDashboard = () => {
  // Mock data
  const pending: PendingAssessment[] = useMemo(
    () => [
      {
        id: "p1",
        title: "Leadership Essentials",
        category: "Leadership",
        dueDate: "2025-11-15",
        priority: "High",
      },
      {
        id: "p2",
        title: "Advanced Communication",
        category: "Communication",
        dueDate: "2025-11-20",
        priority: "Medium",
      },
      {
        id: "p3",
        title: "Data Literacy",
        category: "Analytics",
        dueDate: "2025-11-28",
        priority: "Low",
      },
    ],
    []
  );

  const completed: CompletedAssessment[] = useMemo(
    () => [
      {
        id: "HX-204",
        title: "Honeymoon Calibration Pulse",
        category: "Honeymoon",
        date: "2025-11-08",
        score: 92,
        percentile: 95,
      },
      {
        id: "SI-187",
        title: "Self-Introspection Depth Scan",
        category: "Self-Introspection",
        date: "2025-10-28",
        score: 85,
        percentile: 88,
      },
      {
        id: "SS-164",
        title: "Soul-Searching Diagnostics",
        category: "Soul-Searching",
        date: "2025-10-18",
        score: 78,
        percentile: 81,
      },
      {
        id: "ST-139",
        title: "Steady-State Resilience Audit",
        category: "Steady-State",
        date: "2025-10-05",
        score: 74,
        percentile: 76,
      },
    ],
    []
  );

  const categoryDistribution = useMemo<StageDatum[]>(
    () => [
      { id: "Honeymoon", label: "Honeymoon", value: 42 },
      { id: "Self-Introspection", label: "Self-Introspection", value: 25 },
      { id: "Soul-Searching", label: "Soul-Searching", value: 20 },
      { id: "Steady-State", label: "Steady-State", value: 13 },
    ],
    []
  );

  const totalCompleted = completed.length;
  const totalPending = pending.length;
  const totalAssessments = totalCompleted + totalPending;
  const completionRate = totalAssessments
    ? Math.round((totalCompleted / totalAssessments) * 100)
    : 0;

  const highPriorityPending = useMemo(
    () => pending.filter((item) => item.priority === "High").length,
    [pending]
  );

  const swotData = useMemo<SWOTQuadrant[]>(() => {
    const stageMap = categoryDistribution.reduce<Record<string, number>>(
      (acc, stage) => {
        acc[stage.label] = stage.value;
        return acc;
      },
      {}
    );
    const dominantStage = categoryDistribution.reduce((prev, curr) =>
      curr.value > prev.value ? curr : prev
    );

    return [
      {
        type: "Strengths",
        items: [
          {
            id: "s1",
            title: `${dominantStage.label} momentum`,
            description: `${dominantStage.value}% of assessments sit in ${dominantStage.label}, keeping optimism and onboarding energy high.`,
            rating: "HIGH",
          },
          {
            id: "s2",
            title: "Completion discipline",
            description: `${completionRate}% of scheduled assessments are already completed, showing dependable follow-through.`,
            rating: "HIGH",
          },
          {
            id: "s3",
            title: "Introspection depth",
            description: `${
              stageMap["Self-Introspection"] ?? 0
            }% coverage in the reflective stage is feeding actionable insights for coaches.`,
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Weaknesses",
        items: [
          {
            id: "w1",
            title: "High-priority backlog",
            description: `${highPriorityPending} critical assessments remain pending, creating pressure on the next sprint.`,
            rating: "HIGH",
          },
          {
            id: "w2",
            title: "Steady-State underexposed",
            description: `Only ${
              stageMap["Steady-State"] ?? 0
            }% of data reflects steady-state maturity, leaving resilience signals thin.`,
            rating: "MEDIUM",
          },
          {
            id: "w3",
            title: "Soul-Searching fatigue",
            description: `${
              stageMap["Soul-Searching"] ?? 0
            }% share without fresh movement risks stagnation in deeper transition work.`,
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Opportunities",
        items: [
          {
            id: "o1",
            title: "Introspection coaching pods",
            description: `Channel the ${
              stageMap["Self-Introspection"] ?? 0
            }% cohort into guided pods to accelerate clarity.`,
            rating: "HIGH",
          },
          {
            id: "o2",
            title: "Steady-State playbooks",
            description: `Boost the ${
              stageMap["Steady-State"] ?? 0
            }% group with routines and rituals to expand institutional calm.`,
            rating: "MEDIUM",
          },
          {
            id: "o3",
            title: "Soul-Searching diagnostics",
            description: `Use the ${
              stageMap["Soul-Searching"] ?? 0
            }% signal to design micro-interventions before energy dips.`,
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Threats",
        items: [
          {
            id: "t1",
            title: "Honeymoon burnout risk",
            description: `If the ${dominantStage.label} cohort stays at ${dominantStage.value}% without rotation, fatigue can hit fast.`,
            rating: "CRITICAL",
          },
          {
            id: "t2",
            title: "Momentum stall",
            description: `Completion rate below 100% plus outstanding critical tests can slow rollout decisions.`,
            rating: "HIGH",
          },
          {
            id: "t3",
            title: "Signal imbalance",
            description: `Limited steady-state readings make it harder to benchmark long-term balance zones.`,
            rating: "MEDIUM",
          },
        ],
      },
    ];
  }, [categoryDistribution, completionRate, highPriorityPending]);

  const emotionalIntensityHeatmap = useMemo<EmotionalIntensityRow[]>(
    () => [
      {
        state: "Honeymoon",
        values: {
          Optimism: 90,
          Energy: 85,
          Realism: 65,
          Stability: 45,
        },
      },
      {
        state: "Self-Introspection",
        values: {
          Optimism: 60,
          Energy: 70,
          Realism: 85,
          Stability: 55,
        },
      },
      {
        state: "Soul-Searching",
        values: {
          Optimism: 40,
          Energy: 50,
          Realism: 90,
          Stability: 35,
        },
      },
      {
        state: "Steady-State",
        values: {
          Optimism: 70,
          Energy: 75,
          Realism: 80,
          Stability: 95,
        },
      },
    ],
    []
  );

  const emotionalDimensions = useMemo(
    () => ["Optimism", "Energy", "Realism", "Stability"],
    []
  );

  const emotionalStageAssessment = useMemo<EmotionalStageAssessment[]>(
    () => [
      {
        stage: "Honeymoon",
        score: 153.73,
        color: "#10b981", // Green
        status: "Dominant",
      },
      {
        stage: "Self-Introspection",
        score: 122.47,
        color: "#3b82f6", // Blue
        status: "Secondary",
      },
      {
        stage: "Soul-Searching",
        score: 121.07,
        color: "#f97316", // Orange
        status: "Transitional",
      },
      {
        stage: "Steady-State",
        score: 118.73,
        color: "#a855f7", // Purple
      },
    ],
    []
  );

  const historyCategoryPalette = useMemo(
    () => ({
      Honeymoon: {
        from: "#d1fae5",
        to: "#a7f3d0",
        accent: "#047857",
      },
      "Self-Introspection": {
        from: "#dbeafe",
        to: "#bfdbfe",
        accent: "#1d4ed8",
      },
      "Soul-Searching": {
        from: "#fee2e2",
        to: "#fecdd3",
        accent: "#b91c1c",
      },
      "Steady-State": {
        from: "#ede9fe",
        to: "#ddd6fe",
        accent: "#6d28d9",
      },
      default: {
        from: "#f1f5f9",
        to: "#e2e8f0",
        accent: "#475569",
      },
    }),
    []
  );

  const maxScore = useMemo(
    () => Math.max(...emotionalStageAssessment.map((s) => s.score)),
    [emotionalStageAssessment]
  );

  // Get dominant stage and its sub-stages
  const dominantStage = useMemo(
    () => emotionalStageAssessment.find((s) => s.status === "Dominant"),
    [emotionalStageAssessment]
  );

  const honeymoonSubStages = useMemo<SubStage[]>(
    () => [
      { id: "excitement", label: "Excitement & Optimism", value: 26 },
      { id: "reality", label: "Initial Reality Check", value: 25 },
      { id: "confidence", label: "Sustained Confidence", value: 15 },
      { id: "over-reliance", label: "Confidence & Over-Reliance", value: 16 },
      { id: "complacency", label: "Subtle Complacency", value: 8 },
    ],
    []
  );

  // Summary values

  // Pending assessments filter
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const filteredPending = useMemo(() => {
    if (priorityFilter === "All") return pending;
    return pending.filter((item) => item.priority === priorityFilter);
  }, [pending, priorityFilter]);

  // Test history: search (by dominant stage only)
  const [historySearch, setHistorySearch] = useState("");
  const visibleHistory = useMemo(() => {
    const q = historySearch.toLowerCase().trim();
    if (!q) {
      // If no search query, return all sorted by date
      return [...completed].sort((a, b) => b.date.localeCompare(a.date));
    }
    const filtered = completed.filter((r) =>
      r.category.toLowerCase().includes(q)
    );
    // Sort by date (newest first) by default
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    return sorted;
  }, [completed, historySearch]);

  const header = (
    <div className="mb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Assessment Dashboard
      </h1>
      <p className="mt-1 text-gray-600">
        Your assessments, insights, and progress at a glance.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              width: 220 + i * 120,
              height: 220 + i * 120,
              background: `radial-gradient(circle, ${
                [brand.teal, brand.purple, brand.sky][i]
              } 0%, transparent 70%)`,
              left: `${10 + i * 30}%`,
              top: `${5 + i * 25}%`,
            }}
            animate={{ x: [0, 40, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
            transition={{
              duration: 12 + i * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{header}</div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Assessments Completed"
          value={totalCompleted}
          icon={CheckCircle}
          gradient="bg-linear-to-b from-brand-teal to-brand-navy"
        />
        <SummaryCard
          label="Critical Pending"
          value={highPriorityPending}
          icon={AlertTriangle}
          gradient="bg-linear-to-b from-amber-500 to-orange-600"
        />
        <SummaryCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
          gradient="bg-linear-to-b from-purple-500 to-indigo-600"
        />
      </div>

      {/* Visual Analytics */}
      <div className="relative z-10 grid gap-6 xl:grid-cols-3">
        {/* Employee Emotional Stage Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md xl:col-span-2"
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Emotional Stage Assessment
            </h2>
            <p className="text-xs text-gray-500">
              Current emotional state distribution
            </p>
          </div>

          {/* Stage Cards */}
          <div className="space-y-1.5">
            {emotionalStageAssessment.map((stage, idx) => {
              const percentage = (stage.score / maxScore) * 100;
              const statusStyles: Record<string, { bg: string; text: string }> =
                {
                  Dominant: { bg: "bg-green-50", text: "text-green-700" },
                  Secondary: { bg: "bg-blue-50", text: "text-blue-700" },
                  Transitional: { bg: "bg-orange-50", text: "text-orange-700" },
                };

              const statusStyle = stage.status
                ? statusStyles[stage.status]
                : null;

              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group rounded-lg border p-3 transition-all ${
                    statusStyle
                      ? `${statusStyle.bg} border-gray-200`
                      : "bg-white border-gray-200"
                  } hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {stage.stage}
                      </h3>
                      <div
                        className="text-lg font-bold leading-none mt-0.5"
                        style={{ color: stage.color }}
                      >
                        {stage.score.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {stage.status && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            statusStyle
                              ? `${statusStyle.text} ${statusStyle.bg}`
                              : ""
                          }`}
                        >
                          {stage.status}
                        </span>
                      )}
                      <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{
                            duration: 0.6,
                            delay: idx * 0.1 + 0.2,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stage Distribution - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Stage Distribution
              </h2>
              <p className="text-xs text-gray-500">
                Current sentiment spread across stages
              </p>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsivePie
              data={categoryDistribution}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={6}
              activeOuterRadiusOffset={10}
              colors={(d: StageDatum) => {
                const palette: Record<string, string> = {
                  "Self-Introspection": "#3B82F6",
                  "Soul-Searching": "#F59E0B",
                  "Steady-State": "#8B5CF6",
                  Honeymoon: "#10B981",
                };
                return palette[d.label] || "#CBD5F5";
              }}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={10}
              arcLabel={(d: StageDatum) => `${d.value}%`}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2.2]],
              }}
              arcLabelsRadiusOffset={0.55}
              defs={[
                {
                  id: "gradSelf",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#93C5FD" },
                    { offset: 100, color: "#2563EB" },
                  ],
                },
                {
                  id: "gradSoul",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#FCD34D" },
                    { offset: 100, color: "#EA580C" },
                  ],
                },
                {
                  id: "gradSteady",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#DDD6FE" },
                    { offset: 100, color: "#7C3AED" },
                  ],
                },
                {
                  id: "gradHoney",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#A7F3D0" },
                    { offset: 100, color: "#059669" },
                  ],
                },
              ]}
              fill={[
                { match: { id: "Self-Introspection" }, id: "gradSelf" },
                { match: { id: "Soul-Searching" }, id: "gradSoul" },
                { match: { id: "Steady-State" }, id: "gradSteady" },
                { match: { id: "Honeymoon" }, id: "gradHoney" },
              ]}
              theme={{
                text: { fontSize: 12, fill: brand.slate700, fontWeight: 600 },
                tooltip: {
                  container: {
                    background: "#fff",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                },
              }}
              animate
              motionConfig="gentle"
            />
          </div>
        </motion.div>
      </div>

      {/* Sub-Stages for Dominant Stage */}
      {dominantStage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {dominantStage.stage} Sub-Stages
            </h2>
            <p className="text-xs text-gray-500">
              Detailed breakdown of sub-stage performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {honeymoonSubStages.map((subStage, idx) => {
              const maxSubValue = Math.max(
                ...honeymoonSubStages.map((s) => s.value)
              );
              const percentage = (subStage.value / maxSubValue) * 100;
              const intensity =
                subStage.value >= 20
                  ? "high"
                  : subStage.value >= 10
                  ? "medium"
                  : "low";

              return (
                <motion.div
                  key={subStage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: idx * 0.08,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group relative rounded-lg border border-gray-200 bg-linear-to-br from-white to-gray-50/50 p-3.5 transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-gray-900 mb-1.5 leading-tight line-clamp-2">
                        {subStage.label}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-2.5">
                    <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: idx * 0.1 + 0.3,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${brand.teal}, ${brand.tealDark})`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-lg font-bold"
                      style={{ color: brand.tealBrand }}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        intensity === "high"
                          ? "bg-green-100 text-green-700"
                          : intensity === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {intensity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Emotional Intensity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Emotional Intensity Heatmap
            </h2>
            <p className="text-xs text-gray-500">
              Intensity levels across emotional dimensions and states
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {emotionalDimensions.map((dimension) => {
              const dimensionColors: Record<
                string,
                { from: string; to: string }
              > = {
                Optimism: { from: "#f97316", to: "#ea580c" }, // Orange
                Energy: { from: "#ec4899", to: "#db2777" }, // Pink/Magenta
                Realism: { from: "#3b82f6", to: "#2563eb" }, // Blue
                Stability: { from: "#10b981", to: "#059669" }, // Teal/Green
              };
              const token = dimensionColors[dimension] || {
                from: "#6b7280",
                to: "#4b5563",
              };
              return (
                <motion.span
                  key={dimension}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 shadow-sm transition-all hover:shadow-md"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${token.from}, ${token.to})`,
                      boxShadow: `0 0 4px ${token.from}60`,
                    }}
                  />
                  {dimension}
                </motion.span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
          {emotionalIntensityHeatmap.map((row, rowIdx) => (
            <motion.div
              key={row.state}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIdx * 0.05 }}
              className="group rounded-xl border border-gray-100 bg-linear-to-r from-gray-50/80 to-white p-2.5 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="grid gap-2 md:grid-cols-[120px_repeat(4,minmax(0,1fr))] items-center">
                <div className="flex items-center justify-between md:block md:text-left">
                  <span className="text-sm font-bold text-gray-900">
                    {row.state}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400 md:hidden">
                    Mix
                  </span>
                </div>
                {emotionalDimensions.map((dimension) => {
                  const value =
                    row.values[dimension as keyof typeof row.values];

                  // Dimension-specific colors with intensity variations
                  const getDimensionToken = (dim: string, val: number) => {
                    const baseColors: Record<
                      string,
                      {
                        high: { from: string; to: string };
                        medium: { from: string; to: string };
                        low: { from: string; to: string };
                      }
                    > = {
                      Optimism: {
                        high: { from: "#f97316", to: "#ea580c" },
                        medium: { from: "#fb923c", to: "#f97316" },
                        low: { from: "#fed7aa", to: "#fdba74" },
                      },
                      Energy: {
                        high: { from: "#ec4899", to: "#db2777" },
                        medium: { from: "#f472b6", to: "#ec4899" },
                        low: { from: "#fbcfe8", to: "#f9a8d4" },
                      },
                      Realism: {
                        high: { from: "#3b82f6", to: "#2563eb" },
                        medium: { from: "#60a5fa", to: "#3b82f6" },
                        low: { from: "#bfdbfe", to: "#93c5fd" },
                      },
                      Stability: {
                        high: { from: "#10b981", to: "#059669" },
                        medium: { from: "#34d399", to: "#10b981" },
                        low: { from: "#a7f3d0", to: "#6ee7b7" },
                      },
                    };

                    if (val >= 80)
                      return (
                        baseColors[dim]?.high || {
                          from: "#6b7280",
                          to: "#4b5563",
                        }
                      );
                    if (val >= 50)
                      return (
                        baseColors[dim]?.medium || {
                          from: "#6b7280",
                          to: "#4b5563",
                        }
                      );
                    return (
                      baseColors[dim]?.low || { from: "#6b7280", to: "#4b5563" }
                    );
                  };

                  const token = getDimensionToken(dimension, value);
                  const isHigh = value >= 50;
                  return (
                    <motion.div
                      key={`${row.state}-${dimension}`}
                      whileHover={{ scale: 1.02, y: -1 }}
                      className={`relative rounded-lg border px-2.5 py-1.5 shadow-sm transition-all ${
                        isHigh
                          ? "border-opacity-30 bg-linear-to-br from-white to-gray-50/50"
                          : "border-gray-200 bg-white"
                      }`}
                      style={{
                        borderColor: isHigh ? `${token.from}33` : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            isHigh ? "text-gray-700" : "text-gray-500"
                          }`}
                        >
                          {dimension}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isHigh ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {value}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, value)}%` }}
                          transition={{
                            duration: 0.8,
                            delay: rowIdx * 0.1 + 0.2,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full shadow-sm"
                          style={{
                            background: `linear-gradient(90deg, ${token.from}, ${token.to})`,
                            boxShadow: `0 0 8px ${token.from}40`,
                          }}
                        />
                      </div>
                      {isHigh && (
                        <div
                          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full opacity-60"
                          style={{
                            background: `radial-gradient(circle, ${token.from}, ${token.to})`,
                            boxShadow: `0 0 6px ${token.from}`,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SWOT Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SWOT Analysis</h2>
          <p className="text-xs text-gray-500">
            Strategic assessment across four key dimensions
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {swotData.map((quadrant, qIdx) => {
            const config = {
              Strengths: {
                icon: CheckCircle,
                headerBg: "bg-linear-to-br from-green-500 to-emerald-600",
                itemBg: "bg-green-50/60",
                border: "border-green-200",
                text: "text-green-700",
              },
              Weaknesses: {
                icon: XCircle,
                headerBg: "bg-linear-to-br from-red-500 to-rose-600",
                itemBg: "bg-red-50/60",
                border: "border-red-200",
                text: "text-red-700",
              },
              Opportunities: {
                icon: Lightbulb,
                headerBg: "bg-linear-to-br from-blue-500 to-cyan-600",
                itemBg: "bg-blue-50/60",
                border: "border-blue-200",
                text: "text-blue-700",
              },
              Threats: {
                icon: ShieldAlert,
                headerBg: "bg-linear-to-br from-amber-500 to-orange-600",
                itemBg: "bg-amber-50/60",
                border: "border-amber-200",
                text: "text-amber-700",
              },
            }[quadrant.type];

            const Icon = config.icon;
            const ratingColors = {
              HIGH: "bg-green-500 text-white",
              MEDIUM: "bg-yellow-500 text-white",
              CRITICAL: "bg-red-600 text-white",
            } as const;

            return (
              <motion.div
                key={quadrant.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: qIdx * 0.1 }}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden"
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 ${config.headerBg} text-white`}
                >
                  <Icon className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    {quadrant.type}
                  </h3>
                </div>
                <div className="p-3 space-y-2">
                  {quadrant.items.map((item, idx) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIdx * 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.01, y: -1 }}
                        className={`rounded-lg border ${config.border} ${config.itemBg} p-2.5 shadow-sm`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              ratingColors[item.rating]
                            }`}
                          >
                            {item.rating}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Pending Assessments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Assessments
            </h2>
            <p className="text-xs text-gray-500">
              Upcoming tests and due dates
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(["All", "High", "Medium", "Low"] as const).map((p) => {
              const isActive = priorityFilter === p;
              const buttonColors = {
                All: isActive
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                High: isActive
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100",
                Medium: isActive
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
                Low: isActive
                  ? "bg-green-500 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100",
              };
              return (
                <motion.button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${buttonColors[p]}`}
                >
                  {p}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {filteredPending.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No {priorityFilter !== "All" ? priorityFilter : ""} priority
              assessments found.
            </div>
          ) : (
            filteredPending.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.005, y: -1 }}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3.5 transition-all hover:shadow-md hover:border-gray-300"
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getPriorityStyles(
                        item.priority
                      )}`}
                    >
                      {item.priority === "High" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : item.priority === "Medium" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {item.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {item.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="cursor-pointer relative inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-brand-teal to-brand-navy px-4 py-2 text-xs font-semibold text-white hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-md transition-all overflow-hidden"
                    >
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
                        }}
                      />
                      <Play className="h-4 w-4" /> Start Test
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Test History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Test History
            </h2>
            <p className="text-xs text-gray-500">
              Completed assessments and results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group w-full sm:w-auto"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-brand-teal z-10" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by dominant stage..."
                  className="h-10 w-full sm:w-72 md:w-80 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all shadow-sm hover:shadow-md hover:border-gray-300"
                />
                {historySearch && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setHistorySearch("")}
                    className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
              {historySearch && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-1.5 px-2 py-0.5 rounded-md bg-brand-teal/10 text-[10px] font-semibold text-brand-teal backdrop-blur-sm"
                >
                  {visibleHistory.length} result
                  {visibleHistory.length !== 1 ? "s" : ""} found
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-linear-to-r from-brand-teal/5 via-white to-brand-navy/5">
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Assessment
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Dominant Stage
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Completed
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Performance
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleHistory.map((row, idx) => {
                const palette =
                  historyCategoryPalette[
                    row.category as keyof typeof historyCategoryPalette
                  ] ?? historyCategoryPalette.default;
                const scoreProgress = Math.min(100, row.score);
                const percentileProgress = Math.min(100, row.percentile);

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group transition-colors cursor-pointer bg-white hover:bg-brand-teal/5"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {row.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          borderColor: `${palette.accent}33`,
                          color: palette.accent,
                          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {formatDisplayDate(row.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
                          <span>{row.score}</span>
                          <span className="text-xs font-medium text-gray-500">
                            Score
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>{row.percentile}%</span>
                          <span className="text-xs font-medium text-gray-500">
                            Percentile
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(
                                scoreProgress,
                                percentileProgress
                              )}%`,
                              background: `linear-gradient(90deg, ${palette.from}, ${palette.accent})`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="group cursor-pointer relative inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-brand-teal to-brand-navy px-4 py-2 text-xs font-semibold text-white hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-md transition-all overflow-hidden"
                      >
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
                          }}
                        />
                        <span className="relative">View Report</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AssessmentDashboard;
