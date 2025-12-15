import { useMemo } from "react";
import type { StageDatum } from "@/data/assessmentDashboard";
import { getStagePieColor } from "@/utils/assessmentConfig";

interface HumanBodyStageVisualizationProps {
  data: StageDatum[];
  centerX: number;
  centerY: number;
  innerRadius: number;
}

const HumanBodyStageVisualization = ({
  data,
  centerX,
  centerY,
  innerRadius,
}: HumanBodyStageVisualizationProps) => {
  const bodySize = innerRadius * 0.7;

  // Create gradient stops from pie chart data
  const gradientStops = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    return sorted.map((item) => {
      const offset = (cumulative / total) * 100;
      cumulative += item.value;
      const color = getStagePieColor(item.label);
      return { offset, color };
    });
  }, [data]);

  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      <defs>
        <linearGradient
          id="humanAuraGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          {gradientStops.map((stop, idx) => (
            <stop
              key={idx}
              offset={`${stop.offset}%`}
              stopColor={stop.color}
              stopOpacity={0.9}
            />
          ))}
        </linearGradient>
        {/* Professional glow effect */}
        <filter id="bodyGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Realistic Human Body Silhouette */}
      <g filter="url(#bodyGlow)">
        {/* Head - vertically elongated oval */}
        <ellipse
          cx="0"
          cy={-bodySize * 0.38}
          rx={bodySize * 0.12}
          ry={bodySize * 0.15}
          fill="url(#humanAuraGradient)"
        />

        {/* Neck - short narrow rectangle */}
        <rect
          x={-bodySize * 0.04}
          y={-bodySize * 0.23}
          width={bodySize * 0.08}
          height={bodySize * 0.08}
          rx={bodySize * 0.02}
          fill="url(#humanAuraGradient)"
        />

        {/* Torso - larger vertically elongated oval */}
        <ellipse
          cx="0"
          cy={bodySize * 0.1}
          rx={bodySize * 0.18}
          ry={bodySize * 0.28}
          fill="url(#humanAuraGradient)"
        />

        {/* Left Arm - narrow angled oval */}
        <ellipse
          cx={-bodySize * 0.24}
          cy={bodySize * 0.05}
          rx={bodySize * 0.08}
          ry={bodySize * 0.22}
          fill="url(#humanAuraGradient)"
          transform={`rotate(-25 ${-bodySize * 0.24} ${bodySize * 0.05})`}
        />

        {/* Right Arm - narrow angled oval */}
        <ellipse
          cx={bodySize * 0.24}
          cy={bodySize * 0.05}
          rx={bodySize * 0.08}
          ry={bodySize * 0.22}
          fill="url(#humanAuraGradient)"
          transform={`rotate(25 ${bodySize * 0.24} ${bodySize * 0.05})`}
        />

        {/* Left Leg - teardrop shape */}
        <ellipse
          cx={-bodySize * 0.1}
          cy={bodySize * 0.52}
          rx={bodySize * 0.1}
          ry={bodySize * 0.28}
          fill="url(#humanAuraGradient)"
        />

        {/* Right Leg - teardrop shape */}
        <ellipse
          cx={bodySize * 0.1}
          cy={bodySize * 0.52}
          rx={bodySize * 0.1}
          ry={bodySize * 0.28}
          fill="url(#humanAuraGradient)"
        />
      </g>
    </g>
  );
};

export default HumanBodyStageVisualization;
