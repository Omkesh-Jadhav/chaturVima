import { useMemo, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import type { StageDatum } from "@/data/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { PIE_GRADIENTS, PIE_FILL } from "@/components/assessmentDashboard";
import { pieChartTheme } from "@/components/assessmentDashboard/pieChartTheme";
import { sortStagesByScore } from "@/utils/assessmentUtils";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

export type AuraStage = {
  stage: string;
  value: number;
  color: string;
  status?: string;
};

interface AuraProps {
  data: AuraStage[];
  /** "card" keeps the old look (own container + header). "embed" renders only the chart area. */
  variant?: "card" | "embed";
  title?: string;
  description?: string;
  valueLabel?: string;
  /** Show the share (%) line in the hover card */
  showShare?: boolean;
  className?: string;
  heightClassName?: string;
}

const Aura = ({
  data,
  variant = "card",
  title = "Stage Distribution",
  description = "Visual overview of your distribution across stages",
  valueLabel = "Final Value",
  showShare = false,
  className,
  heightClassName,
}: AuraProps) => {
  const [hoveredStage, setHoveredStage] = useState<AuraStage | null>(null);

  // Sort data by value (high to low)
  const sortedData = useMemo(
    () => sortStagesByScore<AuraStage>(data, "value"),
    [data]
  );

  // Calculate total and percentages for pie chart data
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);

  // Convert EmotionalStageAssessment to StageDatum format for ResponsivePie
  const pieData: StageDatum[] = sortedData.map((item) => ({
    id: item.stage,
    label: item.stage,
    value: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  // Calculate percentages for gradient - use same order as pieData
  const dataWithPercentages = pieData.map((pieItem) => {
    const originalItem = sortedData.find((d) => d.stage === pieItem.label);
    return {
      ...originalItem!,
      percentage: pieItem.value, // Use the rounded percentage from pie chart
    };
  });

  return (
    <>
      {variant === "card" && (
        <AnimatedContainer
          animation="fadeInUp"
          transitionPreset="slow"
          delay="xs"
          className={`${CARD_BASE_CLASSES} p-5 xl:col-span-2 ${className ?? ""}`}
        >
          <SectionHeader title={title} description={description} />
          <div className={`mt-4 relative overflow-hidden rounded-xl ${heightClassName ?? "h-72"}`}>
            <AuraChart
              pieData={pieData}
              dataWithPercentages={dataWithPercentages}
              sortedData={sortedData}
              hoveredStage={hoveredStage}
              setHoveredStage={setHoveredStage}
              total={total}
              valueLabel={valueLabel}
              showShare={showShare}
            />
          </div>
        </AnimatedContainer>
      )}

      {variant === "embed" && (
        <div className={`relative overflow-hidden rounded-xl ${heightClassName ?? "h-full"} ${className ?? ""}`}>
          <AuraChart
            pieData={pieData}
            dataWithPercentages={dataWithPercentages}
            sortedData={sortedData}
            hoveredStage={hoveredStage}
            setHoveredStage={setHoveredStage}
            total={total}
            valueLabel={valueLabel}
            showShare={showShare}
          />
        </div>
      )}
    </>
  );
};

function AuraChart({
  pieData,
  dataWithPercentages,
  sortedData,
  hoveredStage,
  setHoveredStage,
  total,
  valueLabel,
  showShare,
}: {
  pieData: StageDatum[];
  dataWithPercentages: Array<AuraStage & { percentage: number }>;
  sortedData: AuraStage[];
  hoveredStage: AuraStage | null;
  setHoveredStage: (s: AuraStage | null) => void;
  total: number;
  valueLabel: string;
  showShare: boolean;
}) {
  const hoveredPercent =
    hoveredStage && total > 0 ? (hoveredStage.value / total) * 100 : 0;

  return (
    <>
      <ResponsivePie
        data={pieData}
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
        onMouseEnter={(datum: StageDatum) => {
          const stage = sortedData.find((d) => d.stage === datum.label);
          if (stage) setHoveredStage(stage);
        }}
        onMouseLeave={() => setHoveredStage(null)}
        tooltip={() => null}
      />

      {/* Human Figure Overlay - Centered */}
      {!hoveredStage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-36 h-36 max-w-[70%] max-h-[70%]">
            <svg className="w-full h-full" viewBox="0 0 154 154">
              <defs>
                <filter id="strongGlow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Dynamic holographic gradient for human figure based on data */}
                <linearGradient
                  id="holoGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={dataWithPercentages[0]?.color}
                    stopOpacity="0.8"
                  />
                  {dataWithPercentages.map((item, index) => {
                    const cumulativePercentage = dataWithPercentages
                      .slice(0, index + 1)
                      .reduce((sum, d) => sum + d.percentage, 0);
                    return (
                      <stop
                        key={index}
                        offset={`${cumulativePercentage}%`}
                        stopColor={item.color}
                        stopOpacity="0.8"
                      />
                    );
                  })}
                </linearGradient>
              </defs>

              <g transform="translate(77, 77)" filter="url(#strongGlow)">
                <g transform="translate(-77, -77) scale(0.75)">
                  <path
                    d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3
                c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522
                c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201
                c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109
                c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24
                c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217
                c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245
                c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631
                c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522
                c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448
                c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577
                c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257
                c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674
                c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635
                c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514
                c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733
                C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733
                c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988
                c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198
                c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953
                c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577
                c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448
                c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522
                c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269
                c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727
                c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848
                c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033
                c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116
                c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522
                c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3
                c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                    fill="url(#holoGradient)"
                    stroke="url(#holoGradient)"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Hover Details */}
      {hoveredStage && (
        <div
          className="absolute left-1/2 top-1/2 w-[min(210px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-black/70 px-3 py-2.5 text-white shadow-2xl backdrop-blur-md z-10 pointer-events-none overflow-hidden"
          style={{
            borderColor: `${hoveredStage.color}55`,
            boxShadow: `0 18px 40px rgba(0,0,0,0.35), 0 0 22px ${hoveredStage.color}35`,
          }}
        >
          {/* color accent */}
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{
              background: `linear-gradient(90deg, ${hoveredStage.color}, ${hoveredStage.color}00)`,
            }}
          />
          <div
            className="absolute -right-16 -top-16 h-36 w-36 rounded-full blur-2xl opacity-60"
            style={{ backgroundColor: hoveredStage.color }}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: hoveredStage.color,
                      boxShadow: `0 0 12px ${hoveredStage.color}AA`,
                    }}
                  />
                  <h3 className="truncate text-sm font-extrabold leading-tight">
                    {hoveredStage.stage}
                  </h3>
                </div>
              </div>

              {hoveredStage.status && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                  style={{
                    backgroundColor: `${hoveredStage.color}26`,
                    border: `1px solid ${hoveredStage.color}55`,
                    color: "white",
                  }}
                >
                  {hoveredStage.status}
                </span>
              )}
            </div>

            <div className="mt-2 grid gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-white/70">
                  {valueLabel}
                </span>
                <span className="text-base font-black leading-none">
                  {Number.isFinite(hoveredStage.value)
                    ? hoveredStage.value.toLocaleString()
                    : hoveredStage.value}
                  {!showShare && (
                    <span className="ml-1.5 text-[11px] font-extrabold text-white/70">
                      ({hoveredPercent.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>

              {showShare && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-white/70">
                    Share
                  </span>
                  <span className="text-sm font-black">
                    {total > 0 ? hoveredPercent.toFixed(1) : "0.0"}
                    %
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Aura;
