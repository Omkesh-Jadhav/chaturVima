import { useMemo, useState } from "react";
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
  getAssessmentTypeColorToken,
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
          transition="slow"
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
                  transition="normal"
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
          transition="slow"
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
          transition="slow"
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
                  transition="spring"
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
        transition="slow"
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
                transition="normal"
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
                        transition="normal"
                        delay={qIdx * 0.1 + idx * 0.05}
                        className={`rounded-lg border ${config.border} ${config.itemBg} p-2 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:-translate-y-0.5`}
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
        transition="slow"
        delay="sm"
        className={CARD_BASE_CLASSES}
      >
        <SectionHeader
          title="Emotional Intensity Heatmap"
          description="Intensity levels across stages and assessment types"
          actions={
            <div className="flex flex-wrap gap-1.5">
              {assessmentTypes.map((assessmentType) => {
                const token = getAssessmentTypeColorToken(assessmentType, 80);
                return (
                  <span
                    key={assessmentType}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 shadow-sm transition-all hover:shadow-md hover:scale-105 cursor-pointer"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${token.from}, ${token.to})`,
                        boxShadow: `0 0 4px ${token.from}60`,
                      }}
                    />
                    {assessmentType}
                  </span>
                );
              })}
            </div>
          }
        />

        <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
          {emotionalIntensityHeatmap.map((row, rowIdx) => (
            <AnimatedContainer
              key={row.stage}
              animation="fadeInLeft"
              transition="normal"
              delay={rowIdx * 0.05}
              className="group rounded-xl border border-gray-100 bg-linear-to-r from-gray-50/80 to-white p-2.5 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="grid gap-2 md:grid-cols-[140px_repeat(4,minmax(0,1fr))] items-center">
                <div className="flex items-center justify-between md:block md:text-left">
                  <span className="text-sm font-bold text-gray-900">
                    {row.stage}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400 md:hidden">
                    Types
                  </span>
                </div>
                {assessmentTypes.map((assessmentType) => {
                  const value =
                    row.values[assessmentType as keyof typeof row.values];

                  const token = getAssessmentTypeColorToken(
                    assessmentType,
                    value
                  );
                  const isHigh = value >= 50;
                  return (
                    <div
                      key={`${row.stage}-${assessmentType}`}
                      className={`relative rounded-lg border px-2.5 py-1.5 shadow-sm transition-all hover:scale-105 hover:-translate-y-0.5 ${
                        isHigh
                          ? "border-opacity-30 bg-linear-to-br from-white to-gray-50/50"
                          : "border-gray-200 bg-white"
                      }`}
                      style={{
                        borderColor: isHigh ? `${token.from}33` : undefined,
                      }}
                    >
                      {/* Percentage in top right corner */}
                      <div className="absolute top-1.5 right-2.5">
                        <span
                          className={`text-xs font-bold ${
                            isHigh ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {value}%
                        </span>
                      </div>

                      {/* Assessment Type Name */}
                      <div className="pr-12 mb-1.5">
                        <span
                          className={`text-[10px] font-bold leading-tight ${
                            isHigh ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {assessmentType}
                        </span>
                      </div>

                      {/* Progress Bar */}
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
                    </div>
                  );
                })}
              </div>
            </AnimatedContainer>
          ))}
        </div>

        {/* Logical Outcomes */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3">
            <h3 className="text-xs font-bold text-blue-900 mb-2.5">
              Logical Outcomes
            </h3>
            <ol className="space-y-1.5">
              {logicalOutcomes.map((outcome, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[11px] text-blue-800 leading-relaxed"
                >
                  <span className="shrink-0 text-blue-600 font-semibold mt-0.5">
                    {idx + 1}.
                  </span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </AnimatedContainer>

      {/* Pending Assessments */}
      <AnimatedContainer
        animation="fadeInUp"
        transition="slow"
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
                transition="normal"
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
        transition="slow"
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
