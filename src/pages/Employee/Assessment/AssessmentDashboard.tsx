import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsivePie } from "@nivo/pie";
import { Play, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { SearchInput, Button, AnimatedContainer } from "@/components/ui";
// Data imports
import {
  MOCK_PENDING_ASSESSMENTS,
  MOCK_COMPLETED_ASSESSMENTS,
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_EMOTIONAL_INTENSITY_HEATMAP,
  MOCK_EMOTIONAL_STAGE_ASSESSMENT,
  getSubStagesForStage,
  type StageDatum,
  type EmotionalStageAssessment,
} from "@/data/assessmentDashboard";

// Utility imports
import { formatDisplayDate } from "@/utils/dateUtils";
import {
  calculateCompletionRate,
  getPriorityStyles,
  countHighPriority,
  calculatePercentage,
  findMaxByKey,
} from "@/utils/assessmentUtils";
import { generateSWOTAnalysis, type SWOTQuadrant } from "@/utils/swotUtils";
import {
  ASSESSMENT_TYPES,
  getCategoryPalette,
  getStagePieColor,
} from "@/utils/assessmentConfig";

// Component imports
import {
  SummaryCard,
  AnimatedBackground,
  SectionHeader,
  usePriorityFilter,
  useAssessmentSearch,
  PRIORITY_ICONS,
  STATUS_STYLES,
  SWOT_CONFIG,
  ANIMATION_DELAYS,
  PIE_GRADIENTS,
  PIE_FILL,
  BACKGROUND_COLORS,
} from "@/components/assessmentDashboard";
import { pieChartTheme } from "@/components/assessmentDashboard/pieChartTheme";

// Common card styling
const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const AssessmentDashboard = () => {
  const navigate = useNavigate();

  const pending = MOCK_PENDING_ASSESSMENTS;
  const completed = MOCK_COMPLETED_ASSESSMENTS;
  const categoryDistribution = MOCK_CATEGORY_DISTRIBUTION;
  const emotionalIntensityHeatmap = MOCK_EMOTIONAL_INTENSITY_HEATMAP;
  const assessmentTypes = ASSESSMENT_TYPES;
  const emotionalStageAssessment = MOCK_EMOTIONAL_STAGE_ASSESSMENT;

  const totalCompleted = completed.length;
  const highPriorityPending = countHighPriority(pending);
  const completionRate = useMemo(
    () => calculateCompletionRate(totalCompleted, highPriorityPending),
    [totalCompleted, highPriorityPending]
  );

  const swotData = useMemo<SWOTQuadrant[]>(
    () =>
      generateSWOTAnalysis(
        categoryDistribution,
        completionRate,
        highPriorityPending
      ),
    [categoryDistribution, completionRate, highPriorityPending]
  );

  // Transform heatmap data: Assessment Types as rows (Y-axis), Emotional Stages as columns (X-axis)
  const transformedHeatmap = useMemo(() => {
    const emotionalStages = emotionalIntensityHeatmap.map((row) => row.stage);
    return assessmentTypes.map((assessmentType) => {
      return {
        assessmentType,
        values: emotionalStages.reduce((acc, stage) => {
          const row = emotionalIntensityHeatmap.find((r) => r.stage === stage);
          const value = row?.values[assessmentType as keyof typeof row.values];
          acc[stage] = value ?? 0; // Use 0 for missing values to show 0%
          return acc;
        }, {} as Record<string, number>),
      };
    });
  }, [emotionalIntensityHeatmap, assessmentTypes]);

  // Generate logical outcomes based on heatmap data
  const logicalOutcomes = useMemo(() => {
    const outcomes: string[] = [];

    const stageAverages = emotionalIntensityHeatmap.map((row) => ({
      stage: row.stage,
      avg:
        Object.values(row.values).reduce((sum, val) => sum + val, 0) /
        Object.values(row.values).length,
    }));

    const highestStage = stageAverages.reduce((max, stage) =>
      stage.avg > max.avg ? stage : max
    );
    const lowestStage = stageAverages.reduce((min, stage) =>
      stage.avg < min.avg ? stage : min
    );

    if (
      highestStage.stage === "Steady-State" &&
      lowestStage.stage === "Soul-Searching"
    ) {
      outcomes.push(
        "Leadership disillusionment contrasts with optimistic employees in a stable organization."
      );
    }

    const employeeValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Employee Self Assessment"]
    );
    const managerValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Manager Relationship Assessment"]
    );
    if (
      employeeValues.some(
        (emp, idx) => emp > 70 && managerValues[idx] < emp - 10
      )
    ) {
      outcomes.push("Employees feel unsupported as challenges persist.");
    }

    const deptValues = emotionalIntensityHeatmap.map(
      (row) => row.values["Department Assessment"]
    );
    if (
      deptValues.some((val, idx) => idx > 0 && val < deptValues[idx - 1] - 5)
    ) {
      outcomes.push("Departmental growth slows.");
    }

    if (outcomes.length === 0) {
      outcomes.push(
        "Emotional intensity varies significantly across organizational levels.",
        "Different stages show distinct patterns in assessment responses.",
        "Organizational alignment requires attention across multiple dimensions."
      );
    }

    return outcomes;
  }, [emotionalIntensityHeatmap]);

  const maxScore = findMaxByKey(emotionalStageAssessment, "score");
  const dominantStage = emotionalStageAssessment.find(
    (s) => s.status === "Dominant"
  );
  const [selectedStage, setSelectedStage] =
    useState<EmotionalStageAssessment | null>(dominantStage || null);

  const selectedSubStages = useMemo(() => {
    if (!selectedStage) return [];
    const subStages = getSubStagesForStage(selectedStage.stage);
    const totalWeight = subStages.reduce((sum, sub) => sum + sub.value, 0);
    return subStages.map((subStage) => ({
      ...subStage,
      score: (subStage.value / totalWeight) * selectedStage.score,
    }));
  }, [selectedStage]);

  const {
    priorityFilter,
    setPriorityFilter,
    filteredItems: filteredPending,
  } = usePriorityFilter(pending);
  const {
    searchQuery,
    setSearchQuery,
    filteredAssessments: visibleHistory,
  } = useAssessmentSearch(completed);

  return (
    <div className="space-y-6 relative">
      <AnimatedBackground colors={[...BACKGROUND_COLORS]} />
      <div className="relative z-10">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Assessment Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Your assessments, insights, and progress at a glance.
          </p>
        </div>
      </div>

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
        <AnimatedContainer
          animation="fadeInUp"
          transitionPreset="slow"
          className={`${CARD_BASE_CLASSES} xl:col-span-2`}
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
              const percentage = calculatePercentage(stage.score, maxScore);
              const statusStyle = stage.status
                ? STATUS_STYLES[stage.status]
                : null;

              const isSelected = selectedStage?.stage === stage.stage;

              return (
                <AnimatedContainer
                  key={stage.stage}
                  animation="fadeInUp"
                  delay={idx * ANIMATION_DELAYS.stageCard}
                  transitionPreset="normal"
                  onClick={() => setSelectedStage(stage)}
                  className={`group rounded-lg border p-3 transition-all cursor-pointer ${
                    statusStyle
                      ? `${statusStyle.bg} border-gray-200`
                      : "bg-white border-gray-200"
                  } ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-brand-teal shadow-md"
                      : "hover:shadow-sm"
                  }`}
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
                </AnimatedContainer>
              );
            })}
          </div>
        </AnimatedContainer>

        {/* Stage Distribution - Pie Chart */}
        <AnimatedContainer
          animation="fadeInUp"
          transitionPreset="slow"
          delay="xs"
          className={`${CARD_BASE_CLASSES} p-5`}
        >
          <SectionHeader
            title="Stage Distribution"
            description="Current sentiment spread across stages"
          />
          <div className="mt-4 h-72">
            <ResponsivePie
              data={categoryDistribution}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={6}
              activeOuterRadiusOffset={10}
              colors={(d: StageDatum) => getStagePieColor(d.label)}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={10}
              arcLabel={(d: StageDatum) => `${d.value}%`}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2.2]],
              }}
              arcLabelsRadiusOffset={0.55}
              defs={PIE_GRADIENTS}
              fill={PIE_FILL}
              theme={pieChartTheme}
              animate
              motionConfig="gentle"
            />
          </div>
        </AnimatedContainer>
      </div>

      {/* Sub-Stages for Selected Stage */}
      {selectedStage && selectedSubStages.length > 0 && (
        <AnimatedContainer
          animation="fadeInUp"
          transitionPreset="slow"
          delay="sm"
          className={CARD_BASE_CLASSES}
        >
          <SectionHeader
            title={`${selectedStage.stage} Sub-Stages`}
            description={
              <>
                Detailed breakdown of sub-stage performance{" "}
                <span className="font-bold text-gray-900">
                  (click any stage above to view)
                </span>
              </>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {selectedSubStages.map((subStage, idx) => {
              const maxSubScore = Math.max(
                ...selectedSubStages.map((s) => s.score)
              );
              const scorePercentage = calculatePercentage(
                subStage.score,
                maxSubScore
              );

              return (
                <AnimatedContainer
                  key={subStage.id}
                  animation="scaleIn"
                  transitionPreset="spring"
                  delay={idx * 0.08}
                  className="group relative rounded-lg border border-gray-200 bg-linear-to-br from-white to-gray-50/50 p-3.5 transition-all hover:shadow-md hover:border-gray-300 hover:scale-105 hover:-translate-y-0.5"
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
                        animate={{ width: `${scorePercentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: idx * 0.1 + 0.3,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${selectedStage.color}, ${selectedStage.color}dd)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: selectedStage.color }}
                    >
                      {subStage.score.toFixed(1)}
                    </span>
                  </div>
                </AnimatedContainer>
              );
            })}
          </div>
        </AnimatedContainer>
      )}

      {/* SWOT Analysis */}
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="sm"
        className={CARD_BASE_CLASSES}
      >
        <SectionHeader
          title="SWOT Analysis"
          description="Strategic assessment across four key dimensions"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {swotData.map((quadrant, qIdx) => {
            const config = SWOT_CONFIG[quadrant.type];
            const Icon = config.icon;

            return (
              <AnimatedContainer
                key={quadrant.type}
                animation="scaleIn"
                transitionPreset="normal"
                delay={qIdx * 0.1}
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
                <div className="p-2 space-y-2">
                  {quadrant.items.map((item, idx) => {
                    return (
                      <AnimatedContainer
                        key={item.id}
                        animation="fadeInLeft"
                        transitionPreset="normal"
                        delay={qIdx * 0.1 + idx * 0.05}
                        className={`rounded-lg border ${config.border} ${config.itemBg} p-2 shadow-sm`}
                      >
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {item.description}
                        </p>
                      </AnimatedContainer>
                    );
                  })}
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </AnimatedContainer>

      {/* Emotional Intensity Heatmap */}
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="sm"
        className={CARD_BASE_CLASSES}
      >
        <SectionHeader
          title="Emotional Intensity Heatmap"
          description="Mapping stages across organizational dimensions"
        />

        <div className="mt-4">
          {/* Heatmap Grid */}
          <div
            className="overflow-x-auto overflow-y-visible scrollbar-hide"
            style={{ paddingBottom: "4px" }}
          >
            <div className="inline-block min-w-full">
              {/* Header Row - X-Axis Stages */}
              <div
                className="grid mb-2"
                style={{
                  gridTemplateColumns: "180px repeat(4, minmax(110px, 1fr))",
                  gap: "8px",
                }}
              >
                {/* Y-Axis Label Header */}
                <div className="flex items-center justify-start pl-2">
                  {/* <div className="px-3 py-1.5 rounded-md bg-linear-to-r from-gray-100 to-gray-50 border border-gray-200">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Assessment Types
                    </span>
                  </div> */}
                </div>
                {/* X-Axis Stage Headers */}
                {emotionalIntensityHeatmap.map((row) => {
                  // Enhanced vibrant colors for headers
                  const headerColors: Record<
                    string,
                    { bg: string; border: string; dot: string }
                  > = {
                    Honeymoon: {
                      bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                      border: "#10b981",
                      dot: "linear-gradient(135deg, #10b981, #059669)",
                    },
                    "Self-Introspection": {
                      bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                      border: "#3b82f6",
                      dot: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    },
                    "Soul-Searching": {
                      bg: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                      border: "#ef4444",
                      dot: "linear-gradient(135deg, #f97316, #ea580c)",
                    },
                    "Steady-State": {
                      bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                      border: "#8b5cf6",
                      dot: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    },
                  };
                  const headerColor = headerColors[row.stage] || {
                    bg: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
                    border: "#6b7280",
                    dot: "linear-gradient(135deg, #6b7280, #4b5563)",
                  };

                  return (
                    <div
                      key={row.stage}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 shadow-sm"
                      style={{
                        borderColor: `${headerColor.border}30`,
                        background: headerColor.bg,
                      }}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full mb-1.5 shadow-md"
                        style={{
                          background: headerColor.dot,
                          boxShadow: `0 0 8px ${headerColor.border}60, 0 0 12px ${headerColor.border}30`,
                        }}
                      />
                      <span className="text-xs font-bold text-gray-900 text-center leading-tight">
                        {row.stage}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Data Rows - Y-Axis Assessment Types */}
              <div className="space-y-1.5">
                {transformedHeatmap.map((row, rowIdx) => {
                  const stages = emotionalIntensityHeatmap.map((r) => r.stage);
                  return (
                    <div
                      key={row.assessmentType}
                      className="grid items-center"
                      style={{
                        gridTemplateColumns:
                          "180px repeat(4, minmax(110px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {/* Y-Axis Label - Assessment Type */}
                      <div className="flex items-center p-2.5 rounded-lg border-2 border-gray-200/60 bg-linear-to-r from-gray-50 via-white to-gray-50 shadow-sm">
                        <span className="text-sm font-bold text-gray-800 leading-tight">
                          {row.assessmentType}
                        </span>
                      </div>

                      {/* Data Cells */}
                      {stages.map((stage, cellIdx) => {
                        const value = row.values[stage] ?? 0;
                        const palette = getCategoryPalette(stage);
                        const isZero = value === 0;

                        // Enhanced vibrant gradient colors based on stage
                        const cellGradients: Record<string, string> = {
                          Honeymoon:
                            "linear-gradient(135deg, #10b981, #059669, #047857)",
                          "Self-Introspection":
                            "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)",
                          "Soul-Searching":
                            "linear-gradient(135deg, #f97316, #ea580c, #dc2626)",
                          "Steady-State":
                            "linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)",
                        };
                        const cellGradient =
                          cellGradients[stage] ||
                          `linear-gradient(135deg, ${palette.from}, ${palette.accent})`;

                        // Enhanced shadow colors
                        const shadowColors: Record<string, string> = {
                          Honeymoon: "#10b981",
                          "Self-Introspection": "#3b82f6",
                          "Soul-Searching": "#f97316",
                          "Steady-State": "#8b5cf6",
                        };
                        const shadowColor =
                          shadowColors[stage] || palette.accent;

                        return (
                          <div
                            key={`${row.assessmentType}-${stage}`}
                            className={`relative rounded-lg transition-all hover:shadow-lg group overflow-hidden ${
                              isZero
                                ? "border border-gray-200 bg-white"
                                : "bg-gray-50"
                            }`}
                            style={
                              !isZero
                                ? {
                                    border: `1px solid ${shadowColor}30`,
                                    boxShadow: `0 2px 8px ${shadowColor}20`,
                                  }
                                : {}
                            }
                          >
                            {/* Water Fill Effect - Wavy water in box */}
                            {!isZero && (
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                                style={{
                                  background: cellGradient,
                                  height: `${value}%`,
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${value}%` }}
                                transition={{
                                  duration: 0.6,
                                  delay: rowIdx * 0.03 + cellIdx * 0.02,
                                  ease: "easeOut",
                                }}
                              >
                                {/* Wavy water surface using SVG - creates wavy top edge */}
                                <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
                                  <svg
                                    className="absolute top-0 left-0 w-full h-full"
                                    viewBox="0 0 200 20"
                                    preserveAspectRatio="none"
                                    style={{ height: "100%" }}
                                  >
                                    <defs>
                                      <linearGradient
                                        id={`waveGradient-${rowIdx}-${cellIdx}`}
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                      >
                                        <stop
                                          offset="0%"
                                          style={{
                                            stopColor: shadowColor,
                                            stopOpacity: 0.7,
                                          }}
                                        />
                                        <stop
                                          offset="100%"
                                          style={{
                                            stopColor: shadowColor,
                                            stopOpacity: 0.4,
                                          }}
                                        />
                                      </linearGradient>
                                    </defs>
                                    {/* Main wave - creates wavy top edge */}
                                    <path
                                      d="M0,10 Q25,2 50,10 T100,10 T150,10 T200,10 L200,20 L0,20 Z"
                                      fill={cellGradient}
                                      opacity="1"
                                    />
                                    {/* Secondary wave layer */}
                                    <path
                                      d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 L200,20 L0,20 Z"
                                      fill={shadowColor}
                                      opacity="0.6"
                                    />
                                    {/* Third wave layer for depth */}
                                    <path
                                      d="M0,11 Q30,3 60,11 T120,11 T180,11 L200,11 L200,20 L0,20 Z"
                                      fill={shadowColor}
                                      opacity="0.5"
                                    />
                                  </svg>
                                </div>

                                {/* Water surface highlight on waves */}
                                <div
                                  className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
                                  style={{
                                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)`,
                                    clipPath:
                                      "polygon(0 0, 100% 0, 100% 30%, 95% 40%, 90% 30%, 85% 40%, 80% 30%, 75% 40%, 70% 30%, 65% 40%, 60% 30%, 55% 40%, 50% 30%, 45% 40%, 40% 30%, 35% 40%, 30% 30%, 25% 40%, 20% 30%, 15% 40%, 10% 30%, 5% 40%, 0% 30%)",
                                  }}
                                />

                                {/* Subtle water texture/ripples */}
                                <div
                                  className="absolute inset-0 opacity-12"
                                  style={{
                                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                                      radial-gradient(circle at 60% 50%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                                      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                                    backgroundSize:
                                      "40px 40px, 50px 50px, 35px 35px",
                                  }}
                                />
                              </motion.div>
                            )}

                            {/* Content - Percentage Text */}
                            <div className="relative z-10 flex items-center justify-center min-h-[55px] px-3 py-2.5">
                              <span
                                className={`text-sm font-bold ${
                                  isZero
                                    ? "text-gray-900"
                                    : value > 50
                                    ? "text-white drop-shadow-lg"
                                    : "text-gray-900 drop-shadow-sm"
                                }`}
                                style={
                                  !isZero && value > 50
                                    ? {
                                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                      }
                                    : !isZero
                                    ? {
                                        textShadow:
                                          "0 1px 2px rgba(255,255,255,0.8)",
                                      }
                                    : {}
                                }
                              >
                                {value}%
                              </span>
                            </div>

                            {/* Border highlight on hover */}
                            {!isZero && (
                              <div
                                className="absolute inset-0 rounded-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                  borderColor: shadowColor,
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Logical Outcomes */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="rounded-xl bg-linear-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 border-2 border-blue-100/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900">
                Logical Outcomes
              </h3>
            </div>
            <ul className="space-y-2.5">
              {logicalOutcomes.map((outcome, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-white/60 border border-gray-200/40 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="shrink-0 w-5 h-5 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mt-0.5 shadow-sm">
                    <span className="text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-800 leading-relaxed flex-1">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AnimatedContainer>

      {/* Pending Assessments */}
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="md"
        className={CARD_BASE_CLASSES}
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
            {(["All", "High", "Medium", "Low"] as const).map((p) => (
              <Button
                key={p}
                onClick={() => setPriorityFilter(p)}
                variant={priorityFilter === p ? "primary" : "outline"}
                size="xs"
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              >
                {p}
              </Button>
            ))}
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
              <AnimatedContainer
                key={item.id}
                animation="fadeInLeft"
                transitionPreset="normal"
                delay={idx * ANIMATION_DELAYS.stageCard}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3.5 transition-all hover:shadow-md hover:border-gray-300 hover:scale-[1.005] hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getPriorityStyles(
                        item.priority
                      )}`}
                    >
                      {(() => {
                        const Icon = PRIORITY_ICONS[item.priority];
                        return <Icon className="h-3 w-3" />;
                      })()}
                      {item.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {item.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="relative overflow-hidden"
                    >
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
                        }}
                      />
                      <Play className="h-4 w-4 mr-1.5" />
                      Start Test
                    </Button>
                  </div>
                </div>
              </AnimatedContainer>
            ))
          )}
        </div>
      </AnimatedContainer>

      {/* Test History */}
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="lg"
        className={`${CARD_BASE_CLASSES} p-5`}
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
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by dominant stage..."
              resultCount={visibleHistory.length}
              showResultCount={!!searchQuery}
            />
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
                  Metrics
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleHistory.map((row) => {
                const palette = getCategoryPalette(row.category);
                const scoreProgress = Math.min(100, row.score);

                return (
                  <tr
                    key={row.id}
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
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">
                            Score:
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {row.score}
                          </span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${scoreProgress}%`,
                              background: `linear-gradient(90deg, ${palette.from}, ${palette.accent})`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/assessment-report");
                        }}
                        variant="gradient"
                        size="sm"
                        className="relative overflow-hidden"
                      >
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
                          }}
                        />
                        <span className="relative">View Report</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default AssessmentDashboard;
