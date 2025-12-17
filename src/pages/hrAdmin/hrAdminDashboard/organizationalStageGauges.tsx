import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";
import { ANIMATION_DELAYS } from "@/components/assessmentDashboard";
import { STAGE_ORDER } from "@/data/assessmentDashboard";
import hrDashboardData from "@/data/hrDashboardData.json";
import type { EmotionalStageAssessment } from "@/data/assessmentDashboard";
import {
  RESPONSE_LEVELS,
  HOSE_PATH,
  HOSE_RIBS,
  getGaugeColor,
  getActiveLevel,
  calculateHoseRibPosition,
} from "@/utils/gaugeUtils";
import {
  GAUGE_SHADOWS,
  CARD_SHADOWS,
  CARD_BASE_CLASSES,
} from "@/utils/gaugeStyles";

interface StageGaugeData extends EmotionalStageAssessment {
  count: number;
  scoreOnScale: number;
}

interface OrganizationalStageGaugesProps {
  onStageSelect?: (stage: StageGaugeData | null) => void;
  selectedStage?: StageGaugeData | null;
}

const OrganizationalStageGauges = ({
  onStageSelect,
  selectedStage,
}: OrganizationalStageGaugesProps) => {
  const stageDistribution = useMemo(() => {
    const stageCount: Record<string, number> = Object.fromEntries(
      STAGE_ORDER.map((stage) => [stage, 0])
    );

    hrDashboardData.employee.forEach((employee) => {
      const stage = employee.stageDetails.stage;
      if (stage in stageCount) stageCount[stage]++;
    });

    const total = Object.values(stageCount).reduce(
      (sum, count) => sum + count,
      0
    );
    const maxCount = Math.max(...Object.values(stageCount));

    const distribution: StageGaugeData[] = STAGE_ORDER.map((stage) => {
      const count = stageCount[stage];
      const scoreOnScale = maxCount > 0 ? (count / maxCount) * 5 : 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;

      return {
        stage,
        count,
        score: scoreOnScale,
        scoreOnScale,
        color: getStagePieColor(stage),
        status: percentage >= 30 ? "Dominant" : undefined,
      };
    });

    return { distribution, total };
  }, []);

  const { distribution, total } = stageDistribution;

  const averageScore = useMemo(
    () =>
      distribution.reduce((acc, stage) => acc + stage.scoreOnScale, 0) /
      distribution.length,
    [distribution]
  );

  useEffect(() => {
    if (!selectedStage && onStageSelect) {
      const dominant = distribution.find((d) => d.status === "Dominant");
      if (dominant) onStageSelect(dominant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStageClick = (stage: StageGaugeData) => {
    if (onStageSelect) {
      onStageSelect(selectedStage?.stage === stage.stage ? null : stage);
    }
  };

  const handleCardHover = (
    e: React.MouseEvent<HTMLDivElement>,
    isSelected: boolean
  ) => {
    if (!isSelected) {
      e.currentTarget.style.boxShadow = CARD_SHADOWS.hover;
    }
  };

  const handleCardLeave = (
    e: React.MouseEvent<HTMLDivElement>,
    isSelected: boolean
  ) => {
    if (!isSelected) {
      e.currentTarget.style.boxShadow = CARD_SHADOWS.default;
    }
  };

  const ProfessionalGauge = ({ value }: { value: number }) => {
    const clampedValue = Math.max(0, Math.min(5, value));
    const gaugeColor = getGaugeColor(clampedValue);
    const activeLevel = getActiveLevel(clampedValue);
    const fillHeight = (clampedValue / 5) * 100;

    return (
      <div className="w-full space-y-3">
        <div className="flex flex-col items-center justify-center space-y-3">
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
              <div className="relative mx-auto w-[200px] h-[360px]">
                <div
                  className="relative w-[180px] h-[340px] rounded-2xl bg-gradient-to-br from-[#1e293b] via-[#020617] to-[#1e293b]"
                  style={{ boxShadow: GAUGE_SHADOWS.pumpBody }}
                >
                  <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-white/8 via-transparent to-transparent" />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-l from-black/40 via-transparent to-transparent" />

                  {/* Display Screen */}
                  <div
                    className="absolute top-4 left-4 right-4 h-[100px] rounded-lg bg-black border-[3px] border-[#1e293b]"
                    style={{ boxShadow: GAUGE_SHADOWS.screen(gaugeColor) }}
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
                      <div className="flex items-baseline justify-center mb-1">
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
                            textShadow: `0 0 8px ${gaugeColor}80, 0 0 16px ${gaugeColor}50, 0 1px 2px rgba(0,0,0,0.8)`,
                            fontFamily: "'LCD', 'Courier New', monospace",
                            letterSpacing: "-0.5px",
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
                            boxShadow: `0 0 6px ${activeLevel.color}70`,
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
                    style={{ boxShadow: GAUGE_SHADOWS.gaugeArea }}
                  >
                    {RESPONSE_LEVELS.map((level, idx) => (
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

                    <motion.div
                      initial={{ height: "0%" }}
                      animate={{ height: `${fillHeight}%` }}
                      transition={{
                        delay: 0.6,
                        duration: 2.5,
                        ease: [0.43, 0.13, 0.23, 0.96],
                      }}
                      className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                      style={{
                        background: `linear-gradient(to top, ${RESPONSE_LEVELS.map(
                          (l, i) => `${l.color}ee ${i * 20}% ${(i + 1) * 20}%`
                        ).join(", ")})`,
                        boxShadow: GAUGE_SHADOWS.fuelFill(gaugeColor),
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
                          RESPONSE_LEVELS.find(
                            (l) =>
                              mark >= l.threshold[0] && mark < l.threshold[1]
                          ) || RESPONSE_LEVELS[4];
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
                                  ? `0 0 4px ${level.color}60`
                                  : "none",
                              }}
                            />
                            <span
                              className="ml-1.5 text-[10px] font-black"
                              style={{
                                color: isActive ? "#ffffff" : "#9ca3af",
                                textShadow: isActive
                                  ? `0 0 4px ${level.color}70, 0 1px 2px rgba(0,0,0,0.7)`
                                  : "0 1px 1px rgba(0,0,0,0.4)",
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
                      {RESPONSE_LEVELS.slice()
                        .reverse()
                        .map((level, idx) => {
                          const segmentCenter =
                            (RESPONSE_LEVELS.length - 1 - idx) * 20 + 10;
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
                                  textShadow: isActive
                                    ? `0 0 4px ${level.color}70, 0 1px 2px rgba(0,0,0,0.7)`
                                    : `0 1px 1px rgba(0,0,0,0.5)`,
                                  boxShadow: isActive
                                    ? `0 1px 3px rgba(0,0,0,0.3)`
                                    : `0 1px 2px rgba(0,0,0,0.2)`,
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

                {/* Gas Pump Nozzle & Hose */}
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

                    <path
                      d={HOSE_PATH}
                      fill="none"
                      stroke="#0a0e14"
                      strokeWidth="13"
                      strokeLinecap="round"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      }}
                    />
                    <path
                      d={HOSE_PATH}
                      fill="none"
                      stroke="url(#hoseGradient)"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d={HOSE_PATH}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />

                    {HOSE_RIBS.map((t) => {
                      const { x, y } = calculateHoseRibPosition(t);
                      return (
                        <circle
                          key={t}
                          cx={x}
                          cy={y}
                          r="2"
                          fill="#475569"
                          opacity="0.8"
                          style={{
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                          }}
                        />
                      );
                    })}

                    <path
                      d={HOSE_PATH}
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />

                    {/* Nozzle */}
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
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}
                      />
                      <rect
                        x="2"
                        y="2"
                        width="36"
                        height="15"
                        rx="2"
                        fill="url(#nozzleHighlight)"
                      />
                      <rect
                        x="0"
                        y="0"
                        width="8"
                        height="50"
                        rx="4"
                        fill="rgba(0,0,0,0.3)"
                      />

                      <path
                        d="M 10 50 L 10 65 Q 10 75, 20 75 Q 30 75, 30 65 L 30 50"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="5"
                        strokeLinecap="round"
                        style={{
                          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                        }}
                      />
                      <path
                        d="M 12 52 L 12 63 Q 12 73, 20 73 Q 28 73, 28 63 L 28 52"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 10 50 L 10 65 Q 10 75, 20 75 Q 30 75, 30 65 L 30 50"
                        fill="none"
                        stroke="rgba(0,0,0,0.4)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      <rect
                        x="15"
                        y="60"
                        width="8"
                        height="6"
                        rx="1"
                        fill="#64748b"
                        style={{
                          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
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

                      <path
                        d="M 0 0 Q -15 -5, -25 0 Q -35 5, -40 15"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="6"
                        strokeLinecap="round"
                        style={{
                          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                        }}
                      />
                      <path
                        d="M 0 0 Q -15 -5, -25 0 Q -35 5, -40 15"
                        fill="none"
                        stroke="url(#hoseGradient)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                      />
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
                          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                        }}
                      />
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
                className={`group relative cursor-pointer transition-all duration-300 rounded-xl border-2 overflow-hidden flex-1 flex items-center ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-brand-teal border-brand-teal/40 bg-brand-teal/5"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  isDominant
                    ? "bg-gradient-to-r from-white via-gray-50/50 to-white"
                    : "bg-white"
                }`}
                style={{
                  boxShadow: isSelected
                    ? CARD_SHADOWS.selected
                    : CARD_SHADOWS.default,
                }}
                onMouseEnter={(e) => handleCardHover(e, isSelected)}
                onMouseLeave={(e) => handleCardLeave(e, isSelected)}
              >
                <div className="p-3 w-full">
                  <div className="flex items-center gap-3">
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

                    <div
                      className="flex-1 relative h-full min-h-[36px] bg-gray-100 rounded-full overflow-hidden"
                      style={{ boxShadow: GAUGE_SHADOWS.tempStrip }}
                    >
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
                          boxShadow: GAUGE_SHADOWS.tempFill(stage.color),
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                          style={{ width: "60%", marginLeft: "20%" }}
                        />
                      </motion.div>

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
                          className="w-3.5 h-3.5 rounded-full border-3 border-white"
                          style={{
                            backgroundColor: stage.color,
                            borderWidth: "3px",
                            boxShadow: GAUGE_SHADOWS.indicator(stage.color),
                          }}
                        />
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div
                          className="text-xl font-black leading-none"
                          style={{
                            color: stage.color,
                            textShadow: `0 0 6px ${stage.color}50`,
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
                          Employees
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.03) 50%, transparent 100%)",
                    }}
                  />
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
