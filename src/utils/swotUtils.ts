/**
 * SWOT Analysis Utility Functions
 * Helper functions for generating SWOT analysis data
 */

export type SWOTRating = "HIGH" | "MEDIUM" | "CRITICAL";

export type SWOTItem = {
  id: string;
  title: string;
  description: string;
  rating: SWOTRating;
};

export type SWOTQuadrant = {
  type: "Strengths" | "Weaknesses" | "Opportunities" | "Threats";
  items: SWOTItem[];
};

export type StageDatum = {
  id: string;
  label: string;
  value: number;
};

/**
 * Generate SWOT analysis based on assessment data
 * @param categoryDistribution - Distribution of stages/categories
 * @param completionRate - Completion rate percentage
 * @param highPriorityPending - Number of high priority pending assessments
 * @returns SWOT analysis quadrants
 */
export const generateSWOTAnalysis = (
  categoryDistribution: StageDatum[],
  completionRate: number,
  highPriorityPending: number
): SWOTQuadrant[] => {
  const stageMap = categoryDistribution.reduce<Record<string, number>>(
    (acc, stage) => {
      acc[stage.label] = stage.value;
      return acc;
    },
    {}
  );

  const dominantStage = categoryDistribution.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev
  );

  return [
    {
      type: "Strengths",
      items: [
        {
          id: "s1",
          title: `${dominantStage.label} momentum`,
          description: `${dominantStage.value}% of assessments sit in ${dominantStage.label}, keeping optimism and onboarding energy high.`,
          rating: "HIGH",
        },
        {
          id: "s2",
          title: "Completion discipline",
          description: `${completionRate}% of scheduled assessments are already completed, showing dependable follow-through.`,
          rating: "HIGH",
        },
        {
          id: "s3",
          title: "Introspection depth",
          description: `${
            stageMap["Self-Introspection"] ?? 0
          }% coverage in the reflective stage is feeding actionable insights for coaches.`,
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Weaknesses",
      items: [
        {
          id: "w1",
          title: "High-priority backlog",
          description: `${highPriorityPending} critical assessments remain pending, creating pressure on the next sprint.`,
          rating: "HIGH",
        },
        {
          id: "w2",
          title: "Steady-State underexposed",
          description: `Only ${
            stageMap["Steady-State"] ?? 0
          }% of data reflects steady-state maturity, leaving resilience signals thin.`,
          rating: "MEDIUM",
        },
        {
          id: "w3",
          title: "Soul-Searching fatigue",
          description: `${
            stageMap["Soul-Searching"] ?? 0
          }% share without fresh movement risks stagnation in deeper transition work.`,
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Opportunities",
      items: [
        {
          id: "o1",
          title: "Introspection coaching pods",
          description: `Channel the ${
            stageMap["Self-Introspection"] ?? 0
          }% cohort into guided pods to accelerate clarity.`,
          rating: "HIGH",
        },
        {
          id: "o2",
          title: "Steady-State playbooks",
          description: `Boost the ${
            stageMap["Steady-State"] ?? 0
          }% group with routines and rituals to expand institutional calm.`,
          rating: "MEDIUM",
        },
        {
          id: "o3",
          title: "Soul-Searching diagnostics",
          description: `Use the ${
            stageMap["Soul-Searching"] ?? 0
          }% signal to design micro-interventions before energy dips.`,
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Threats",
      items: [
        {
          id: "t1",
          title: "Honeymoon burnout risk",
          description: `If the ${dominantStage.label} cohort stays at ${dominantStage.value}% without rotation, fatigue can hit fast.`,
          rating: "CRITICAL",
        },
        {
          id: "t2",
          title: "Momentum stall",
          description: `Completion rate below 100% plus outstanding critical tests can slow rollout decisions.`,
          rating: "HIGH",
        },
        {
          id: "t3",
          title: "Signal imbalance",
          description: `Limited steady-state readings make it harder to benchmark long-term balance zones.`,
          rating: "MEDIUM",
        },
      ],
    },
  ];
};
