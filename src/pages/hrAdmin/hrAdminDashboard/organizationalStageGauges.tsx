import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { ANIMATION_DELAYS } from "@/components/assessmentDashboard";
import { STAGE_ORDER } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import type { EmotionalStageAssessment } from "@/data/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const STAGES = STAGE_ORDER;

interface StageGaugeData extends EmotionalStageAssessment {
  count: number;
  scoreOnScale: number; // 0-5 scale
}

interface OrganizationalStageGaugesProps {
  onStageSelect?: (stage: StageGaugeData | null) => void;
  selectedStage?: StageGaugeData | null;
}

const OrganizationalStageGauges = ({
  onStageSelect,
  selectedStage,
}: OrganizationalStageGaugesProps) => {
  // Calculate stage distribution from HR dashboard data
  const stageDistribution = useMemo(() => {
    const stageCount: Record<string, number> = Object.fromEntries(
      STAGES.map((stage) => [stage, 0])
    );

    // Count employees per stage
    hrDashboardData.employee.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in stageCount) {
        stageCount[stage]++;
      }
    });

    const total = Object.values(stageCount).reduce(
      (sum, count) => sum + count,
      0
    );
    const maxCount = Math.max(...Object.values(stageCount));

    // Convert counts to 0-5 scale
    const distribution: StageGaugeData[] = STAGES.map((stage) => {
      const count = stageCount[stage];
      // Normalize count to 0-5 scale
      const scoreOnScale = maxCount > 0 ? (count / maxCount) * 5 : 0;

      // Determine status based on count percentage
      const percentage = total > 0 ? (count / total) * 100 : 0;
      let status: "Dominant" | "Secondary" | "Transitional" | undefined;
      if (percentage >= 30) status = "Dominant";
      else if (percentage >= 20) status = "Secondary";
      else if (percentage >= 15) status = "Transitional";

      return {
        stage,
        count,
        score: scoreOnScale,
        scoreOnScale,
        color: getStagePieColor(stage),
        status,
      };
    });

    return { distribution, total };
  }, []);

  const { distribution, total } = stageDistribution;

  // Calculate average of all stages (0-5 scale)
  const averageScore = useMemo(() => {
    const sum = distribution.reduce(
      (acc, stage) => acc + stage.scoreOnScale,
      0
    );
    return sum / distribution.length;
  }, [distribution]);

  useEffect(() => {
    if (!selectedStage && onStageSelect) {
      const dominant = distribution.find((d) => d.status === "Dominant");
      if (dominant) onStageSelect(dominant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStageClick = (stage: StageGaugeData) => {
    if (onStageSelect) {
      const newSelection = selectedStage?.stage === stage.stage ? null : stage;
      onStageSelect(newSelection);
    }
  };

  // Professional Design: pH Scale Style Response Levels + Average Score
  const ProfessionalGauge = ({ value }: { value: number }) => {
    // Clamp value to valid range (0-5)
    const clampedValue = Math.max(0, Math.min(5, value));

    // Determine color based on average score
    let gaugeColor = "#10b981";
    if (clampedValue < 2) {
      gaugeColor = "#ef4444";
    } else if (clampedValue < 3) {
      gaugeColor = "#f59e0b";
    } else if (clampedValue < 4) {
      gaugeColor = "#3b82f6";
    }

    const responseLevels = [
      {
        label: "Strongly Disagree",
        threshold: [0, 1],
        color: "#ef4444",
      },
      { label: "Disagree", threshold: [1, 2], color: "#f97316" },
      { label: "Neutral", threshold: [2, 3], color: "#f59e0b" },
      { label: "Agree", threshold: [3, 4], color: "#3b82f6" },
      {
        label: "Strongly Agree",
        threshold: [4, 5],
        color: "#10b981",
      },
    ];

    // Find active response level
    const activeLevel =
      responseLevels.find(
        (level) =>
          clampedValue >= level.threshold[0] &&
          (clampedValue < level.threshold[1] ||
            (clampedValue === 5 && level.threshold[1] === 5))
      ) || responseLevels[responseLevels.length - 1];

    return (
      <div className="w-full space-y-3">
        {/* Fuel Tank with Response Levels Integrated */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* 3D Realistic Gas Pump */}
          <div
            className="relative w-full max-w-[280px] mx-auto overflow-visible"
            style={{ perspective: "1200px" }}
          >
            <motion.div
              initial={{ rotateY: -5, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Gas Pump Body */}
              <div className="relative mx-auto w-[200px] h-[360px]">
                <div
                  className="relative w-[180px] h-[340px] rounded-2xl bg-gradient-to-br from-[#1e293b] via-[#020617] to-[#1e293b]"
                  style={{
                    boxShadow:
                      "inset 0 0 40px rgba(0,0,0,0.8), inset -10px 0 25px rgba(0,0,0,0.5), inset 10px 0 25px rgba(255,255,255,0.03), 0 35px 70px rgba(0,0,0,0.7), 0 0 0 3px #374151, 0 0 0 6px #1f2937",
                  }}
                >
                  {/* 3D Highlights */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-white/8 via-transparent to-transparent" />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-l from-black/40 via-transparent to-transparent" />

                  {/* Display Screen */}
                  <div
                    className="absolute top-4 left-4 right-4 h-[100px] rounded-lg bg-black border-[3px] border-[#1e293b]"
                    style={{
                      boxShadow: `inset 0 0 30px rgba(0,0,0,0.9), inset 0 4px 12px rgba(0,0,0,0.7), 0 0 20px ${gaugeColor}20, 0 4px 8px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.05] rounded-lg pointer-events-none"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "6px 6px",
                      }}
                    />
                    <div className="relative z-10 p-3 h-full flex flex-col justify-center items-center">
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.8,
                            duration: 0.6,
                            type: "spring",
                          }}
                          className="text-3xl font-black leading-none"
                          style={{
                            color: gaugeColor,
                            textShadow: `0 0 12px ${gaugeColor}90, 0 0 24px ${gaugeColor}70, 0 2px 4px rgba(0,0,0,0.9)`,
                            fontFamily: "'LCD', 'Courier New', monospace",
                            letterSpacing: "2px",
                          }}
                        >
                          {clampedValue.toFixed(2)}
                        </motion.div>
                        <div className="text-sm text-gray-400 font-bold">
                          / 5.0
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: activeLevel.color,
                            boxShadow: `0 0 8px ${activeLevel.color}80`,
                          }}
                        />
                        <div
                          className="text-[9px] font-bold uppercase tracking-wide"
                          style={{
                            color: activeLevel.color,
                            textShadow: `0 0 6px ${activeLevel.color}60`,
                          }}
                        >
                          {activeLevel.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fuel Gauge Area */}
                  <div
                    className="absolute top-28 left-6 right-6 bottom-6 rounded-lg overflow-visible bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#0f172a] border-2 border-[#1e293b]"
                    style={{
                      boxShadow:
                        "inset 0 0 20px rgba(0,0,0,0.8), inset 0 2px 6px rgba(0,0,0,0.6)",
                    }}
                  >
                    {/* Response Segments Background */}
                    {responseLevels.map((level, idx) => (
                      <div
                        key={idx}
                        className="absolute left-0 right-0"
                        style={{
                          bottom: `${idx * 20}%`,
                          height: "20%",
                          backgroundColor: level.color,
                          opacity:
                            clampedValue >= level.threshold[1]
                              ? 0.25
                              : clampedValue >= level.threshold[0]
                              ? 0.2
                              : 0.1,
                          borderTop:
                            idx > 0
                              ? "2px solid rgba(255,255,255,0.2)"
                              : "none",
                        }}
                      />
                    ))}

                    {/* Fuel Fill */}
                    <motion.div
                      initial={{ height: "0%" }}
                      animate={{ height: `${(clampedValue / 5) * 100}%` }}
                      transition={{
                        delay: 0.6,
                        duration: 2.5,
                        ease: [0.43, 0.13, 0.23, 0.96],
                      }}
                      className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                      style={{
                        background: `linear-gradient(to top, ${responseLevels
                          .map(
                            (l, i) => `${l.color}ee ${i * 20}% ${(i + 1) * 20}%`
                          )
                          .join(", ")})`,
                        boxShadow: `inset 0 -25px 40px rgba(0,0,0,0.5), inset 0 15px 30px rgba(255,255,255,0.15), 0 0 40px ${gaugeColor}60`,
                      }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0], scaleX: [1, 1.03, 1] }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-0 left-0 right-0 h-14 rounded-t-full"
                        style={{
                          background: `linear-gradient(to bottom, ${gaugeColor}dd, ${gaugeColor}bb, ${gaugeColor}99, transparent)`,
                          filter: "blur(3px)",
                        }}
                      />
                    </motion.div>

                    {/* Scale Markings */}
                    <div className="absolute inset-0 flex flex-col justify-between py-3 pl-2 pointer-events-none">
                      {[5, 4, 3, 2, 1, 0].map((mark) => {
                        const level =
                          responseLevels.find(
                            (l) =>
                              mark >= l.threshold[0] && mark < l.threshold[1]
                          ) || responseLevels[4];
                        const isActive = clampedValue >= mark;
                        return (
                          <div key={mark} className="flex items-center">
                            <div
                              className="w-3 h-0.5 rounded-full"
                              style={{
                                backgroundColor: isActive
                                  ? level.color
                                  : "#6b7280",
                                boxShadow: isActive
                                  ? `0 0 6px ${level.color}60`
                                  : "none",
                              }}
                            />
                            <span
                              className="ml-1.5 text-[10px] font-black"
                              style={{
                                color: isActive ? "#ffffff" : "#9ca3af",
                                textShadow: isActive
                                  ? `0 0 6px ${level.color}80, 0 1px 2px rgba(0,0,0,0.8)`
                                  : "0 1px 2px rgba(0,0,0,0.5)",
                              }}
                            >
                              {mark}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Response Labels */}
                    <div className="absolute inset-0 pointer-events-none py-3">
                      {responseLevels
                        .slice()
                        .reverse()
                        .map((level, idx) => {
                          const segmentCenter =
                            (responseLevels.length - 1 - idx) * 20 + 10;
                          const isActive =
                            clampedValue >= level.threshold[0] &&
                            (clampedValue < level.threshold[1] ||
                              (clampedValue === 5 && level.threshold[1] === 5));
                          return (
                            <div
                              key={idx}
                              className="absolute right-0 pr-2"
                              style={{
                                top: `${100 - segmentCenter}%`,
                                transform: "translateY(-50%)",
                                maxWidth: "calc(100% - 30px)",
                              }}
                            >
                              <div
                                className="text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                                style={{
                                  backgroundColor: isActive
                                    ? `${level.color}35`
                                    : "rgba(0,0,0,0.4)",
                                  color: "#ffffff",
                                  border: isActive
                                    ? `1.5px solid ${level.color}80`
                                    : "1px solid rgba(255,255,255,0.25)",
                                  textShadow: `0 0 8px ${level.color}90, 0 1px 2px rgba(0,0,0,0.9)`,
                                }}
                              >
                                {level.label}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Gas Pump Nozzle & Hose - Fits in Card, Lifted from Bottom */}
                <div className="absolute left-[180px] top-0 w-[75px] h-[360px] z-10">
                  <svg
                    width="75"
                    height="360"
                    viewBox="0 0 75 360"
                    className="absolute"
                  >
                    <defs>
                      <linearGradient
                        id="hoseGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>
                    </defs>

                    {/* Realistic Hose - Enhanced 3D effect */}
                    <path
                      d="M 0 280 L 0 260 Q 0 240, 10 230 Q 20 220, 20 200 Q 20 160, 24 120 Q 28 80, 35 65 Q 42 50, 50 45 Q 58 40, 60 35 Q 62 30, 62 50"
                      fill="none"
                      stroke="#0a0e14"
                      strokeWidth="13"
                      strokeLinecap="round"
                      style={{
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.9))",
                      }}
                    />
                    <path
                      d="M 0 280 L 0 260 Q 0 240, 10 230 Q 20 220, 20 200 Q 20 160, 24 120 Q 28 80, 35 65 Q 42 50, 50 45 Q 58 40, 60 35 Q 62 30, 62 50"
                      fill="none"
                      stroke="url(#hoseGradient)"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    {/* Inner hose highlight for depth */}
                    <path
                      d="M 0 280 L 0 260 Q 0 240, 10 230 Q 20 220, 20 200 Q 20 160, 24 120 Q 28 80, 35 65 Q 42 50, 50 45 Q 58 40, 60 35 Q 62 30, 62 50"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    {/* Hose Ribs */}
                    {[
                      280, 270, 260, 250, 240, 220, 200, 180, 160, 140, 120,
                      100, 80, 65, 50, 45, 40, 35, 30,
                    ].map((t) => {
                      let x, y;
                      if (t >= 260) {
                        x = 0;
                        y = t;
                      } else if (t >= 240) {
                        const progress = (260 - t) / 20;
                        x = 0 + progress * 10;
                        y = 260 - progress * 30;
                      } else if (t >= 200) {
                        const progress = (240 - t) / 40;
                        x = 10 + progress * 10;
                        y = 230 - progress * 30;
                      } else if (t >= 120) {
                        const progress = (200 - t) / 80;
                        x = 20;
                        y = 200 - progress * 80;
                      } else if (t >= 65) {
                        const progress = (120 - t) / 55;
                        x = 20 + progress * 15;
                        y = 120 - progress * 55;
                      } else if (t >= 45) {
                        const progress = (65 - t) / 20;
                        x = 35 + progress * 25;
                        y = 65 - progress * 20;
                      } else if (t >= 30) {
                        const progress = (45 - t) / 15;
                        x = 60;
                        y = 45 - progress * 15;
                      } else {
                        x = 62;
                        y = 50;
                      }
                      return (
                        <circle
                          key={t}
                          cx={x}
                          cy={y}
                          r="2"
                          fill="#475569"
                          opacity="0.8"
                          style={{
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
                          }}
                        />
                      );
                    })}
                    {/* Hose Highlight */}
                    <path
                      d="M 0 280 L 0 260 Q 0 240, 10 230 Q 20 220, 20 200 Q 20 160, 24 120 Q 28 80, 35 65 Q 42 50, 50 45 Q 58 40, 60 35 Q 62 30, 62 50"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />

                    {/* Realistic Nozzle - Enhanced 3D with better details */}
                    <g transform="translate(45, 30) scale(0.5)">
                      <defs>
                        <linearGradient
                          id="nozzleBodyGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#334155" />
                          <stop offset="50%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient
                          id="nozzleHighlight"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                          <stop
                            offset="50%"
                            stopColor="rgba(255,255,255,0.05)"
                          />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>

                      {/* Nozzle - Main Body with 3D effect */}
                      <rect
                        x="0"
                        y="0"
                        width="40"
                        height="50"
                        rx="4"
                        fill="url(#nozzleBodyGradient)"
                        stroke="#475569"
                        strokeWidth="2.5"
                        style={{
                          filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.7))",
                        }}
                      />
                      {/* Top highlight */}
                      <rect
                        x="2"
                        y="2"
                        width="36"
                        height="15"
                        rx="2"
                        fill="url(#nozzleHighlight)"
                      />
                      {/* Side shadow */}
                      <rect
                        x="0"
                        y="0"
                        width="8"
                        height="50"
                        rx="4"
                        fill="rgba(0,0,0,0.3)"
                      />

                      {/* Nozzle - Handle with 3D depth */}
                      <path
                        d="M 10 50 L 10 65 Q 10 75, 20 75 Q 30 75, 30 65 L 30 50"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="5"
                        strokeLinecap="round"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        }}
                      />
                      <path
                        d="M 12 52 L 12 63 Q 12 73, 20 73 Q 28 73, 28 63 L 28 52"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                      {/* Handle inner shadow */}
                      <path
                        d="M 10 50 L 10 65 Q 10 75, 20 75 Q 30 75, 30 65 L 30 50"
                        fill="none"
                        stroke="rgba(0,0,0,0.4)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Nozzle - Trigger with depth */}
                      <rect
                        x="15"
                        y="60"
                        width="8"
                        height="6"
                        rx="1"
                        fill="#64748b"
                        style={{
                          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                        }}
                      />
                      <rect
                        x="16"
                        y="61"
                        width="6"
                        height="4"
                        rx="0.5"
                        fill="rgba(255,255,255,0.1)"
                      />

                      {/* Nozzle - Spout with metallic look */}
                      <path
                        d="M 0 0 Q -15 -5, -25 0 Q -35 5, -40 15"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="6"
                        strokeLinecap="round"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        }}
                      />
                      <path
                        d="M 0 0 Q -15 -5, -25 0 Q -35 5, -40 15"
                        fill="none"
                        stroke="url(#hoseGradient)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                      />
                      {/* Spout highlight */}
                      <path
                        d="M 0 0 Q -12 -4, -20 0 Q -28 4, -35 12"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="-40"
                        cy="15"
                        r="5"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="2.5"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                        }}
                      />
                      {/* Spout tip highlight */}
                      <circle
                        cx="-40"
                        cy="15"
                        r="2"
                        fill="rgba(255,255,255,0.2)"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 grid gap-6 xl:grid-cols-5">
      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        className={`${CARD_BASE_CLASSES} xl:col-span-3`}
      >
        <SectionHeader
          title="Organizational Stage Distribution"
          description={
            <>
              Employee distribution across emotional stages (0-5 scale) -{" "}
              <span className="font-bold text-gray-900">
                {total} total employees
              </span>
            </>
          }
        />

        {/* Temperature Strip Visualization - Fills Full Vertical Space */}
        <div className="flex flex-col h-[calc(100%-80px)] gap-1.5">
          {distribution.map((stage, idx) => {
            const percentage = (stage.scoreOnScale / 5) * 100;
            const isSelected = selectedStage?.stage === stage.stage;
            const isDominant = stage.status === "Dominant";

            return (
              <AnimatedContainer
                key={stage.stage}
                animation="fadeInUp"
                delay={idx * ANIMATION_DELAYS.stageCard}
                transitionPreset="normal"
                onClick={() => handleStageClick(stage)}
                className={`group relative cursor-pointer transition-all rounded-xl border-2 overflow-hidden flex-1 flex items-center ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-brand-teal border-brand-teal/40 shadow-xl bg-brand-teal/5"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                } ${
                  isDominant
                    ? "bg-gradient-to-r from-white via-gray-50/50 to-white"
                    : "bg-white"
                }`}
              >
                <div className="p-3 w-full">
                  <div className="flex items-center gap-3">
                    {/* Stage Name - Better Readable */}
                    <div className="w-32 shrink-0">
                      <h3
                        className={`text-sm font-bold mb-1 ${
                          isDominant ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {stage.stage}
                      </h3>
                      {isDominant && (
                        <span className="inline-block text-[10px] font-bold uppercase text-brand-teal bg-brand-teal/15 px-2 py-0.5 rounded">
                          Dominant
                        </span>
                      )}
                    </div>

                    {/* Temperature Strip - Fills full height */}
                    <div className="flex-1 relative h-full min-h-[36px] bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      {/* Scale markers - Better Readable */}
                      <div className="absolute inset-0 flex items-center justify-between px-1.5">
                        {[0, 1, 2, 3, 4, 5].map((mark) => (
                          <div
                            key={mark}
                            className="relative z-10 flex flex-col items-center"
                          >
                            <div
                              className={`w-0.5 h-3 rounded-full transition-all ${
                                stage.scoreOnScale >= mark
                                  ? "bg-gray-700"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold mt-0.5 ${
                                stage.scoreOnScale >= mark
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {mark}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Filled temperature with gradient */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 1.2,
                          delay: idx * 0.08 + 0.3,
                          ease: [0.43, 0.13, 0.23, 0.96],
                        }}
                        className="absolute left-0 top-0 bottom-0 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${stage.color}, ${stage.color}cc)`,
                          boxShadow: `inset 0 0 20px ${stage.color}50, 0 0 25px ${stage.color}40`,
                        }}
                      >
                        {/* Shine effect */}
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                          style={{ width: "60%", marginLeft: "20%" }}
                        />
                      </motion.div>

                      {/* Value indicator dot */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08 + 1.4, type: "spring" }}
                        className="absolute top-1/2 -translate-y-1/2 z-20"
                        style={{
                          left: `${percentage}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border-3 border-white shadow-2xl"
                          style={{
                            backgroundColor: stage.color,
                            borderWidth: "3px",
                            boxShadow: `0 0 20px ${stage.color}80, 0 3px 6px rgba(0,0,0,0.25)`,
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Score and Count - Compact */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div
                          className="text-xl font-black leading-none"
                          style={{
                            color: stage.color,
                            textShadow: `0 0 10px ${stage.color}40`,
                          }}
                        >
                          {stage.scoreOnScale.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400 font-semibold mt-0.5">
                          /5.0
                        </div>
                      </div>
                      <div className="text-right border-l-2 border-gray-200 pl-4">
                        <div className="text-base font-bold text-gray-900">
                          {stage.count}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          employees
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-brand-teal/10 rounded-xl pointer-events-none" />
                )}
              </AnimatedContainer>
            );
          })}
        </div>
      </AnimatedContainer>

      <AnimatedContainer
        animation="fadeInUp"
        transitionPreset="slow"
        delay="xs"
        className={`${CARD_BASE_CLASSES} p-5 xl:col-span-2`}
      >
        <SectionHeader
          title="Average Stage Score"
          description="Calculated from all stages (0-5 scale)"
        />
        <div className="py-1">
          <ProfessionalGauge value={averageScore} />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default OrganizationalStageGauges;
