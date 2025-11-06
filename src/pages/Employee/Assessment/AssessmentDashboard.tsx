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
import { useMemo, useState, memo, useRef } from "react";
import { motion } from "framer-motion";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import {
  Play,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  CheckCircle,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { colors } from "../../../utils/colors";

type Priority = "High" | "Medium" | "Low";

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
  subText,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  subText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
  >
    {/* Background gradient on hover */}
    <div
      className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5 ${
        gradient || "bg-gradient-to-br from-brand-teal to-brand-navy"
      }`}
    />

    <div className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
          </div>
          {subText && (
            <div className="mt-2 text-xs font-medium text-gray-500">
              {subText}
            </div>
          )}
        </div>
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
              gradient || "bg-gradient-to-br from-brand-teal to-brand-navy"
            }`}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        )}
      </div>
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

  const strengths = useMemo(
    () => [
      { name: "Analysis", score: 88 },
      { name: "Communication", score: 81 },
      { name: "Planning", score: 74 },
      { name: "Leadership", score: 85 },
      { name: "Creativity", score: 69 },
    ],
    []
  );

  // no target overlay for strengths

  // Animated strength rings component (pure SVG, no library)
  // Track animation state globally to prevent re-animation on parent re-renders
  const animationCompletedRef = useRef<Set<string>>(new Set());

  const StrengthRing = memo(
    ({ label, value }: { label: string; value: number }) => {
      const size = 120;
      const stroke = 10;
      const radius = (size - stroke) / 2;
      const circumference = 2 * Math.PI * radius;
      const progress = Math.max(0, Math.min(100, value)) / 100;
      const ringId = `${label}-${value}`;
      const hasAnimated = animationCompletedRef.current.has(ringId);

      return (
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
              <defs>
                <linearGradient
                  id={`grad-${label}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={brand.tealBrand}
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor={brand.navyBrand}
                    stopOpacity="1"
                  />
                </linearGradient>
              </defs>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={brand.slate200}
                strokeWidth={stroke}
                fill="none"
              />
              {/* target overlay removed */}
              {hasAnimated ? (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={`url(#grad-${label})`}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                />
              ) : (
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={`url(#grad-${label})`}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  onAnimationComplete={() => {
                    animationCompletedRef.current.add(ringId);
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  Score
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-800">{label}</div>
          {/* no target label */}
        </motion.div>
      );
    },
    (prevProps, nextProps) => {
      // Only re-render if label or value actually changes
      return (
        prevProps.label === nextProps.label &&
        prevProps.value === nextProps.value
      );
    }
  );

  StrengthRing.displayName = "StrengthRing";

  const categoryDistribution = useMemo(
    () => [
      { id: "Leadership", label: "Leadership", value: 6 },
      { id: "Communication", label: "Communication", value: 8 },
      { id: "Analytics", label: "Analytics", value: 4 },
      { id: "Cognitive", label: "Cognitive", value: 5 },
      { id: "Productivity", label: "Productivity", value: 7 },
    ],
    []
  );

  const scoreTrendAll = useMemo(
    () => [
      { x: "Jan", y: 64 },
      { x: "Feb", y: 67 },
      { x: "Mar", y: 70 },
      { x: "Apr", y: 71 },
      { x: "May", y: 74 },
      { x: "Jun", y: 72 },
      { x: "Jul", y: 72 },
      { x: "Aug", y: 78 },
      { x: "Sep", y: 75 },
      { x: "Oct", y: 83 },
      { x: "Nov", y: 86 },
      { x: "Dec", y: 88 },
    ],
    []
  );

  type Range = "3M" | "6M" | "1Y";
  const [range, setRange] = useState<Range>("6M");

  const scoreTrend = useMemo(() => {
    const sliceByRange = (data: { x: string; y: number }[]) => {
      if (range === "1Y") return data.slice(-12);
      if (range === "6M") return data.slice(-6);
      if (range === "3M") return data.slice(-3);
      return data;
    };
    return [
      {
        id: "Score",
        color: brand.tealBrand,
        data: sliceByRange(scoreTrendAll),
      },
    ];
  }, [range, scoreTrendAll]);

  // Summary values
  const totalCompleted = completed.length;
  const totalPending = pending.length;
  const averageScore = Math.round(
    completed.reduce((s, c) => s + c.score, 0) / Math.max(1, completed.length)
  );
  const lastCompleted = completed[completed.length - 1]?.date ?? "—";

  // Category filtering removed: use strengths as-is
  // Memoize to prevent new array reference on each render
  const filteredStrengths = useMemo(() => strengths, [strengths]);

  // Memoize the strength rings list to prevent re-renders
  const strengthRingsList = useMemo(
    () =>
      filteredStrengths.map((s) => (
        <StrengthRing
          key={`${s.name}-${s.score}`}
          label={s.name}
          value={s.score}
        />
      )),
    [filteredStrengths]
  );

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
    <div className="mb-6">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Assessments Completed"
          value={totalCompleted}
          subText="All time"
          icon={CheckCircle}
          gradient="bg-gradient-to-b from-brand-teal to-brand-navy"
        />
        <SummaryCard
          label="Pending Assessments"
          value={totalPending}
          subText="Awaiting action"
          icon={FileText}
          gradient="bg-gradient-to-b from-amber-500 to-orange-600"
        />
        <SummaryCard
          label="Average Score"
          value={`${averageScore}`}
          subText="Across completed"
          icon={TrendingUp}
          gradient="bg-gradient-to-b from-purple-500 to-indigo-600"
        />
        <SummaryCard
          label="Last Completed"
          value={lastCompleted}
          subText="Most recent test"
          icon={Calendar}
          gradient="bg-gradient-to-b from-sky-500 to-blue-600"
        />
      </div>

      {/* Visual Analytics */}
      <div className="relative z-10 grid gap-6 xl:grid-cols-3">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md xl:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Score Progress
              </h2>
              <p className="text-sm text-gray-500">Performance over time</p>
            </div>
            <div className="flex items-center gap-2">
              {(["3M", "6M", "1Y"] as Range[]).map((r) => (
                <motion.button
                  key={r}
                  onClick={() => setRange(r)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    range === r
                      ? "bg-gradient-to-r from-brand-teal to-brand-navy text-white border-transparent shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-brand-teal/10 hover:to-brand-navy/10 hover:border-brand-teal/30"
                  }`}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveLine
              data={scoreTrend}
              margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: 0,
                max: 100,
                stacked: false,
                reverse: false,
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{ tickSize: 0, tickPadding: 10 }}
              axisLeft={{ tickSize: 0, tickPadding: 10 }}
              colors={[brand.tealBrand]}
              lineWidth={3}
              pointSize={8}
              pointBorderWidth={2}
              pointColor={{ theme: "background" }}
              pointBorderColor={{ from: "serieColor" }}
              enableGridX={false}
              enableArea
              areaOpacity={0.15}
              theme={{
                text: { fontSize: 12, fill: brand.slate700 },
                axis: { ticks: { text: { fill: brand.slate700 } } },
                grid: { line: { stroke: brand.slate200 } },
              }}
              useMesh
            />
          </div>
        </motion.div>

        {/* Category Distribution - Pie Chart with Priority Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Category Distribution
              </h2>
              <p className="text-sm text-gray-500">Tests taken by category</p>
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
              colors={(d: { label: string }) => {
                // Lighter priority colors - base colors for gradients (unique for each)
                const gradients: Record<string, string> = {
                  Leadership: "#EF4444", // Red
                  Communication: "#F59E0B", // Amber
                  Analytics: "#22C55E", // Green
                  Cognitive: "#F97316", // Orange (distinct from amber)
                  Productivity: "#EC4899", // Rose/Pink (distinct from red)
                };
                return gradients[d.label] || "#94A3B8";
              }}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#fff"
              arcLabelsRadiusOffset={0.55}
              defs={[
                {
                  id: "gradientRed",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#FCA5A5" },
                    { offset: 100, color: "#DC2626" },
                  ],
                },
                {
                  id: "gradientAmber",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#FDE047" },
                    { offset: 100, color: "#F59E0B" },
                  ],
                },
                {
                  id: "gradientGreen",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#86EFAC" },
                    { offset: 100, color: "#16A34A" },
                  ],
                },
                {
                  id: "gradientOrange",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#FDBA74" },
                    { offset: 100, color: "#F97316" },
                  ],
                },
                {
                  id: "gradientRose",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#FBCFE8" },
                    { offset: 100, color: "#EC4899" },
                  ],
                },
              ]}
              fill={[
                { match: { id: "Leadership" }, id: "gradientRed" },
                { match: { id: "Communication" }, id: "gradientAmber" },
                { match: { id: "Analytics" }, id: "gradientGreen" },
                { match: { id: "Cognitive" }, id: "gradientOrange" },
                { match: { id: "Productivity" }, id: "gradientRose" },
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

      {/* Strengths (Animated Rings only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Strengths Analysis
            </h2>
            <p className="text-sm text-gray-500">
              Animated rings — hover for emphasis.
            </p>
          </div>
          <div />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {strengthRingsList}
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
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm",
                High: isActive
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:shadow-sm hover:text-red-700",
                Medium: isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-md font-semibold"
                  : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 hover:shadow-sm hover:text-amber-700",
                Low: isActive
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-md font-semibold"
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
                      className="cursor-pointer relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-teal to-brand-navy px-3 py-2 text-sm font-medium text-white hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg overflow-hidden"
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
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-teal/30 bg-white px-3 text-sm text-gray-700 shadow-sm hover:bg-gradient-to-r hover:from-brand-teal/10 hover:to-brand-navy/10 focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all"
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
                          ? "bg-gradient-to-r from-brand-teal/15 to-brand-navy/15 text-brand-navy font-medium"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5"
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
                    className="hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5 transition-all cursor-pointer group"
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
                        className="cursor-pointer group relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-brand-teal/30 bg-gradient-to-r from-brand-teal/10 to-brand-navy/10 px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-md transition-all hover:border-brand-teal/50 hover:from-brand-teal/15 hover:to-brand-navy/15 hover:shadow-lg"
                      >
                        {/* Shine effect on hover */}
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
