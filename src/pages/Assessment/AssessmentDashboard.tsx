/**
 * Assessment Dashboard (custom build with Nivo)
 * Features:
 * - Summary Cards (completed, pending, avg score, last completed)
 * - Visual Analytics: Score progress (Line), Category distribution (Pie), Strengths (Bar)
 * - Pending Assessments list with priorities and Start buttons
 * - Test History table with View Report
 * - Detailed Report view with insights and PDF download
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import {
  Download,
  MoveLeft,
  Play,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

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

type ReportDetail = CompletedAssessment & {
  insights: string[];
  recommendations: string[];
  skills: Array<{ name: string; score: number }>;
};

const brand = {
  teal: "#0ea5a4",
  tealDark: "#0b8584",
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
  sky: "#38bdf8",
  slate700: "#334155",
  slate500: "#64748b",
  slate200: "#e2e8f0",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

const SummaryCard = ({
  label,
  value,
  subText,
  accent,
}: {
  label: string;
  value: string | number;
  subText?: string;
  accent?: string;
}) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: accent ?? brand.teal }}
      />
    </div>
    <div className="mt-3 text-3xl font-bold text-gray-900">{value}</div>
    {subText && <div className="mt-1 text-xs text-gray-500">{subText}</div>}
  </motion.div>
);

const priorityPill = (p: Priority) => {
  const map: Record<Priority, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-green-50 text-green-700 border-green-200",
  };
  return map[p];
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
  const StrengthRing = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => {
    const size = 120;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, value)) / 100;

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
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={brand.sky} stopOpacity="0.9" />
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
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
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
  };

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
        color: brand.teal,
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

  // Detail view state
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(
    null
  );

  // Category filtering removed: use strengths as-is
  const filteredStrengths = strengths;

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

  const openReport = (row: CompletedAssessment) => {
    const detail: ReportDetail = {
      ...row,
      insights: [
        "Consistent improvement over the last quarter",
        "Strong performance in analysis and leadership",
        "Opportunity to deepen time-blocking discipline",
      ],
      recommendations: [
        "Schedule weekly deep-work blocks",
        "Enroll in advanced presentation workshop",
        "Pair with mentor for strategic projects",
      ],
      skills: strengths,
    };
    setSelectedReport(detail);
  };

  const downloadPdf = () => {
    // Simple placeholder: trigger print dialog (could be replaced by html2pdf)
    window.print();
  };

  const header = (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Assessment Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Your assessments, insights, and progress at a glance.
      </p>
    </div>
  );

  if (selectedReport) {
    return (
      <div className="space-y-6">
        {header}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedReport(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MoveLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <button
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedReport.title}
            </h2>
            <p className="text-sm text-gray-500">
              Category: {selectedReport.category} • Completed on{" "}
              {selectedReport.date}
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <SummaryCard
                label="Score"
                value={`${selectedReport.score}`}
                subText="out of 100"
                accent={brand.teal}
              />
              <SummaryCard
                label="Percentile"
                value={`${selectedReport.percentile}%`}
                subText="compared to peers"
                accent={brand.purple}
              />
              <SummaryCard
                label="Status"
                value={
                  (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-5 w-5" /> Completed
                    </span>
                  ) as unknown as number
                }
                subText="successfully finished"
                accent={brand.green}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">
                Performance by Skill
              </h3>
              <div className="mt-3 h-72">
                <ResponsiveBar
                  data={selectedReport.skills}
                  keys={["score"]}
                  indexBy="name"
                  margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={[brand.teal]}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 10,
                    legend: "Score",
                    legendOffset: 32,
                  }}
                  axisLeft={{ tickSize: 0, tickPadding: 10 }}
                  theme={{
                    text: { fontSize: 12, fill: brand.slate700 },
                    axis: { ticks: { text: { fill: brand.slate700 } } },
                    grid: { line: { stroke: brand.slate200 } },
                  }}
                  enableGridX
                  borderRadius={4}
                  labelSkipWidth={24}
                  labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
                  maxValue={100}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">
                Key Insights
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
                {selectedReport.insights.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">
                Recommendations
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
                {selectedReport.recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          accent={brand.teal}
        />
        <SummaryCard
          label="Pending Assessments"
          value={totalPending}
          subText="Awaiting action"
          accent={brand.amber}
        />
        <SummaryCard
          label="Average Score"
          value={`${averageScore}`}
          subText="Across completed"
          accent={brand.purple}
        />
        <SummaryCard
          label="Last Completed"
          value={lastCompleted}
          subText="Most recent test"
          accent={brand.sky}
        />
      </div>

      {/* Visual Analytics */}
      <div className="relative z-10 grid gap-6 xl:grid-cols-3">
        {/* Line Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Score Progress
              </h2>
              <p className="text-sm text-gray-500">Performance over time</p>
            </div>
            <div className="flex items-center gap-2">
              {(["3M", "6M", "1Y"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                    range === r
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
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
              colors={[brand.teal]}
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
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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
              innerRadius={0.6}
              padAngle={1}
              cornerRadius={4}
              activeOuterRadiusOffset={8}
              colors={[
                brand.teal,
                brand.purple,
                brand.sky,
                brand.green,
                brand.amber,
              ]}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={12}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 3]] }}
              theme={{
                text: { fontSize: 12, fill: brand.slate700 },
              }}
            />
            {/* Category filter removed */}
          </div>
        </div>
      </div>

      {/* Strengths (Animated Rings only) */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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
          {filteredStrengths.map((s) => (
            <StrengthRing
              key={s.name}
              label={s.name}
              value={s.score}
              color={brand.teal}
            />
          ))}
        </div>
      </div>

      {/* Pending Assessments */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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
            {(["All", "High", "Medium", "Low"] as const).map((p) => (
              <button
                key={p}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {pending.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-teal-500 to-sky-400" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${priorityPill(
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
                    className="relative inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 overflow-hidden"
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
          ))}
        </div>
      </div>

      {/* Test History */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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
              className="h-9 w-40 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((o) => !o)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-teal-300/60 bg-white px-3 text-sm text-gray-700 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.15)] hover:bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className={`block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        historySort === key
                          ? "bg-teal-50 text-teal-700"
                          : "text-gray-700"
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
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="whitespace-nowrap px-3 py-2">Title</th>
                <th className="whitespace-nowrap px-3 py-2">Category</th>
                <th className="whitespace-nowrap px-3 py-2">Completed On</th>
                <th className="whitespace-nowrap px-3 py-2">Score</th>
                <th className="whitespace-nowrap px-3 py-2">Percentile</th>
                <th className="whitespace-nowrap px-3 py-2 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleHistory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-medium text-gray-900">
                    {row.title}
                  </td>
                  <td className="px-3 py-3 text-gray-700">{row.category}</td>
                  <td className="px-3 py-3 text-gray-700">{row.date}</td>
                  <td className="px-3 py-3 text-gray-700">{row.score}</td>
                  <td className="px-3 py-3 text-gray-700">{row.percentile}%</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => openReport(row)}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
