import { motion } from "framer-motion";
import {
  RESPONSE_LEVELS,
  HOSE_PATH,
  HOSE_RIBS,
  getGaugeColor,
  getActiveLevel,
  calculateHoseRibPosition,
} from "@/utils/gaugeUtils";
import { GAUGE_SHADOWS } from "@/utils/gaugeStyles";

interface FuelGaugeProps {
  value: number;
}

const FuelGauge = ({ value }: FuelGaugeProps) => {
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

export default FuelGauge;

