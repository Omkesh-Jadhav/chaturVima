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
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import {
  Play,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  CheckCircle,
  FileText,
  Calendar,
  XCircle,
  Lightbulb,
  ShieldAlert,
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
        id: "c1",
        title: "Problem Solving",
        category: "Cognitive",
        date: "2025-10-08",
        score: 82,
        percentile: 88,
      },
      {
        id: "c2",
        title: "Team Collaboration",
        category: "Collaboration",
        date: "2025-10-20",
        score: 76,
        percentile: 80,
      },
      {
        id: "c3",
        title: "Time Management",
        category: "Productivity",
        date: "2025-10-29",
        score: 90,
        percentile: 94,
      },
      {
        id: "c4",
        title: "Strategic Thinking",
        category: "Leadership",
        date: "2025-11-01",
        score: 84,
        percentile: 89,
      },
    ],
    []
  );

  const swotData = useMemo<SWOTQuadrant[]>(
    () => [
      {
        type: "Strengths",
        items: [
          {
            id: "s1",
            title: "Core Stability & Adaptability",
            description:
              "Ability to maintain core stability while adapting to change.",
            rating: "HIGH",
          },
          {
            id: "s2",
            title: "Goal Alignment",
            description:
              "Strong alignment with organizational goals ensures focus during transitions.",
            rating: "HIGH",
          },
          {
            id: "s3",
            title: "Collaborative Mindset",
            description:
              "Collaborative mindset fosters effective communication and teamwork.",
            rating: "MEDIUM",
          },
          {
            id: "s4",
            title: "Process Foundation",
            description:
              "Established processes and frameworks provide strong foundation for dynamic decision-making.",
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Weaknesses",
        items: [
          {
            id: "w1",
            title: "Prioritization Challenges",
            description:
              "Struggles to prioritize initiatives in dynamic environments.",
            rating: "HIGH",
          },
          {
            id: "w2",
            title: "Momentum Loss Risk",
            description:
              "Risk of losing momentum if balance shifts toward complacency or overreaction.",
            rating: "HIGH",
          },
          {
            id: "w3",
            title: "Change Resistance",
            description:
              "Resistance to change may hinder adaptability in rapidly evolving situations.",
            rating: "MEDIUM",
          },
          {
            id: "w4",
            title: "Goal Balance Tension",
            description:
              "May struggle to balance long-term goals with short-term adaptations.",
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Opportunities",
        items: [
          {
            id: "o1",
            title: "Agility Enhancement",
            description:
              "Opportunity to enhance agility and resilience during transitions.",
            rating: "HIGH",
          },
          {
            id: "o2",
            title: "Innovation Stability",
            description:
              "Ability to create innovative solutions while maintaining operational stability.",
            rating: "HIGH",
          },
          {
            id: "o3",
            title: "Model Organization",
            description:
              "Opportunity to position as a model of flexibility and stability.",
            rating: "MEDIUM",
          },
          {
            id: "o4",
            title: "Leadership Example",
            description:
              "Potential to lead by example in navigating complex transitions.",
            rating: "MEDIUM",
          },
        ],
      },
      {
        type: "Threats",
        items: [
          {
            id: "t1",
            title: "Burnout Risk",
            description:
              "Overextension may lead to burnout or resource depletion.",
            rating: "CRITICAL",
          },
          {
            id: "t2",
            title: "External Disruptions",
            description:
              "External disruptions can amplify misalignment during shifts.",
            rating: "HIGH",
          },
          {
            id: "t3",
            title: "Stakeholder Confidence",
            description:
              "Miscommunication during shifts may erode stakeholder confidence.",
            rating: "HIGH",
          },
          {
            id: "t4",
            title: "Innovation Barriers",
            description:
              "Over-reliance on existing structures may hinder innovative thinking.",
            rating: "MEDIUM",
          },
        ],
      },
    ],
    []
  );

  const categoryDistribution = useMemo<StageDatum[]>(
    () => [
      { id: "Self-Reflection", label: "Self-Reflection", value: 25 },
      { id: "Soul-Searching", label: "Soul-Searching", value: 42 },
      { id: "Steady State", label: "Steady State", value: 18 },
      { id: "Honeymoon", label: "Honeymoon", value: 15 },
    ],
    []
  );

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

  const dynamicBalanceZones = useMemo<StageDatum[]>(
    () => [
      { id: "Stability", label: "Stability", value: 28 },
      { id: "Adaptability", label: "Adaptability", value: 32 },
      { id: "Innovation", label: "Innovation", value: 22 },
      { id: "Efficiency", label: "Efficiency", value: 18 },
    ],
    []
  );

  // Summary values
  const formatReadableDate = useCallback((value: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const totalCompleted = completed.length;
  const totalPending = pending.length;
  const lastCompleted = completed[completed.length - 1]?.date ?? "—";
  const lastCompletedLabel =
    lastCompleted !== "—" ? formatReadableDate(lastCompleted) : "—";

  // Pending assessments filter
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const filteredPending = useMemo(() => {
    if (priorityFilter === "All") return pending;
    return pending.filter((item) => item.priority === priorityFilter);
  }, [pending, priorityFilter]);

  // Test history: search and sort
  const [historySearch, setHistorySearch] = useState("");
  const [historySort, setHistorySort] = useState<
    "date" | "score" | "percentile"
  >("date");
  const visibleHistory = useMemo(() => {
    const q = historySearch.toLowerCase();
    const filtered = completed.filter((r) =>
      [r.title, r.category, r.date].some((f) => f.toLowerCase().includes(q))
    );
    const sorted = [...filtered].sort((a, b) => {
      if (historySort === "date") return b.date.localeCompare(a.date);
      if (historySort === "score") return b.score - a.score;
      return b.percentile - a.percentile;
    });
    return sorted;
  }, [completed, historySearch, historySort]);

  // Custom sort menu UI state
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortLabel: Record<typeof historySort, string> = {
    date: "Sort by Date",
    score: "Sort by Score",
    percentile: "Sort by Percentile",
  } as const;

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
          label="Pending Assessments"
          value={totalPending}
          icon={FileText}
          gradient="bg-linear-to-b from-amber-500 to-orange-600"
        />
        <SummaryCard
          label="Last Completed"
          value={lastCompletedLabel}
          icon={Calendar}
          gradient="bg-linear-to-b from-sky-500 to-blue-600"
        />
      </div>

      {/* Visual Analytics */}
      <div className="relative z-10 grid gap-6 xl:grid-cols-3">
        {/* Dynamic Balance Zones - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md xl:col-span-2"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Dynamic Balance Zones
            </h2>
            <p className="text-xs text-gray-500">
              Your organizational equilibrium metrics
            </p>
          </div>
          <div className="h-72">
            <ResponsiveBar
              data={dynamicBalanceZones.map((zone) => ({
                zone: zone.label,
                value: zone.value,
              }))}
              keys={["value"]}
              indexBy="zone"
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              padding={0.5}
              valueScale={{ type: "linear", min: 0, max: 40 }}
              indexScale={{ type: "band", round: true }}
              colors={({ data }: { data: { zone: string; value: number } }) => {
                const palette: Record<string, string> = {
                  Stability: brand.navyBrand,
                  Adaptability: brand.tealBrand,
                  Innovation: brand.teal,
                  Efficiency: brand.sky,
                };
                return palette[data.zone] || brand.slate500;
              }}
              borderRadius={8}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                legend: "",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 10,
                tickValues: [0, 10, 20, 30, 40],
                format: (value: number) => `${value}%`,
              }}
              enableGridY={true}
              gridYValues={[0, 10, 20, 30, 40]}
              enableLabel={true}
              label={(d: { value: number }) => `${d.value}%`}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#fff"
              labelTextStyle={{
                fontSize: 12,
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
              theme={{
                text: {
                  fontSize: 12,
                  fill: brand.slate700,
                  fontWeight: 600,
                },
                axis: {
                  ticks: {
                    text: { fill: brand.slate700, fontSize: 11 },
                    line: { stroke: brand.slate200, strokeWidth: 1 },
                  },
                  domain: { line: { stroke: brand.slate200, strokeWidth: 1 } },
                },
                grid: {
                  line: {
                    stroke: brand.slate200,
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                    opacity: 0.6,
                  },
                },
                tooltip: {
                  container: {
                    background: "#fff",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    fontSize: "13px",
                    border: "1px solid #e5e7eb",
                  },
                },
              }}
              tooltip={({
                value,
                indexValue,
              }: {
                value: number;
                indexValue: string;
              }) => {
                const colorMap: Record<string, string> = {
                  Stability: brand.navyBrand,
                  Adaptability: brand.tealBrand,
                  Innovation: brand.teal,
                  Efficiency: brand.sky,
                };
                return (
                  <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-xl border border-gray-200 min-w-[160px]">
                    <div className="font-bold text-gray-900 mb-1">
                      {indexValue}
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: colorMap[indexValue] || brand.navyBrand }}
                    >
                      {value}%
                    </div>
                  </div>
                );
              }}
              animate={true}
              motionConfig={{
                stiffness: 90,
                damping: 15,
              }}
              isInteractive={true}
            />
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
              <p className="text-sm text-gray-500">
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
                  "Self-Reflection": "#3B82F6",
                  "Soul-Searching": "#F59E0B",
                  "Steady State": "#8B5CF6",
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
                { match: { id: "Self-Reflection" }, id: "gradSelf" },
                { match: { id: "Soul-Searching" }, id: "gradSoul" },
                { match: { id: "Steady State" }, id: "gradSteady" },
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
                    const ratingColors = {
                      HIGH: "bg-green-500 text-white",
                      MEDIUM: "bg-yellow-500 text-white",
                      CRITICAL: "bg-red-600 text-white",
                    }[item.rating];

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIdx * 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.01, y: -1 }}
                        className={`rounded-lg border ${config.border} ${config.itemBg} p-2.5 shadow-sm`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${ratingColors}`}
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
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Assessments
            </h2>
            <p className="text-sm text-gray-500">
              Upcoming tests and due dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["All", "High", "Medium", "Low"] as const).map((p) => {
              const isActive = priorityFilter === p;
              const buttonStyles = {
                All: isActive
                  ? "bg-linear-to-r from-gray-600 to-gray-700 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm",
                High: isActive
                  ? "bg-linear-to-r from-red-500 to-red-600 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:shadow-sm hover:text-red-700",
                Medium: isActive
                  ? "bg-linear-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 hover:shadow-sm hover:text-amber-700",
                Low: isActive
                  ? "bg-linear-to-r from-green-500 to-green-600 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400 hover:shadow-sm hover:text-green-700",
              };
              return (
                <motion.button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer px-4 py-2 text-xs font-medium rounded-lg border transition-all ${buttonStyles[p]}`}
                >
                  {p}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {filteredPending.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No {priorityFilter !== "All" ? priorityFilter : ""} priority
              assessments found.
            </div>
          ) : (
            filteredPending.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityStyles(
                          item.priority
                        )}`}
                      >
                        {item.priority === "High" ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : item.priority === "Medium" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}{" "}
                        {item.priority}
                      </span>
                      <span className="truncate text-sm font-semibold text-gray-900">
                        {item.title}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Category: {item.category} • Due by {item.dueDate}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="cursor-pointer relative inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-brand-teal to-brand-navy px-3 py-2 text-sm font-medium text-white hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg overflow-hidden"
                    >
                      <span
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.25), transparent 40%)",
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
            <p className="text-sm text-gray-500">
              Completed assessments and results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search..."
              className="h-9 w-40 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal/50 transition-all"
            />
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((o) => !o)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-teal/30 bg-white px-3 text-sm text-gray-700 shadow-sm hover:bg-linear-to-r hover:from-brand-teal/10 hover:to-brand-navy/10 focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all"
              >
                {sortLabel[historySort]}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    sortMenuOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {sortMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  {(
                    ["date", "score", "percentile"] as (
                      | "date"
                      | "score"
                      | "percentile"
                    )[]
                  ).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setHistorySort(key as "date" | "score" | "percentile");
                        setSortMenuOpen(false);
                      }}
                      className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
                        historySort === key
                          ? "bg-linear-to-r from-brand-teal/15 to-brand-navy/15 text-brand-navy font-medium"
                          : "text-gray-700 hover:bg-linear-to-r hover:from-brand-teal/5 hover:to-brand-navy/5"
                      }`}
                    >
                      {sortLabel[key]}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Title
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Category
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Completed On
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Score
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Percentile
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleHistory.map((row, idx) => {
                const scoreColor =
                  row.score >= 85
                    ? "border-brand-teal/50 bg-brand-teal/5 text-brand-navy"
                    : row.score >= 70
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-red-300 bg-red-50 text-red-700";
                const percentileColor =
                  row.percentile >= 85
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : row.percentile >= 70
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-gray-50 text-gray-700";

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-linear-to-r hover:from-brand-teal/5 hover:to-brand-navy/5 transition-all cursor-pointer group"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-900 group-hover:text-brand-navy transition-colors">
                      {row.title}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{row.date}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-8 rounded-md border font-bold text-sm shadow-sm ${scoreColor}`}
                      >
                        {row.score}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border font-semibold text-xs shadow-sm ${percentileColor}`}
                      >
                        {row.percentile}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          // Placeholder - no navigation for now
                        }}
                        whileHover={{ scale: 1.08, x: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer group relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-brand-teal/30 bg-linear-to-r from-brand-teal/10 to-brand-navy/10 px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-md transition-all hover:border-brand-teal/50 hover:from-brand-teal/15 hover:to-brand-navy/15 hover:shadow-lg"
                      >
                        {/* Shine effect on hover */}
                        <motion.span
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                        <span className="relative">View Report</span>
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="relative inline-block"
                        >
                          →
                        </motion.span>
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
