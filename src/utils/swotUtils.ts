/**
 * SWOT Analysis Utility Functions
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
 * Generate SWOT analysis
 */
export const generateSWOTAnalysis = (
  _categoryDistribution: StageDatum[],
  _completionRate: number,
  _highPriorityPending: number
): SWOTQuadrant[] => {
  return [
    {
      type: "Strengths",
      items: [
        {
          id: "s1",
          title: "High energy and enthusiasm",
          description:
            "High energy and enthusiasm drive motivation and engagement.",
          rating: "HIGH",
        },
        {
          id: "s2",
          title: "Confidence in impact",
          description:
            "Confidence in their ability to make a big impact fosters initiative and proactivity.",
          rating: "HIGH",
        },
        {
          id: "s3",
          title: "Risk-taking mindset",
          description:
            "Willingness to take risks and embrace new challenges with a positive mindset.",
          rating: "HIGH",
        },
        {
          id: "s4",
          title: "Optimistic collaboration",
          description:
            "Optimism helps to foster a collaborative and positive work environment.",
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Weaknesses",
      items: [
        {
          id: "w1",
          title: "Overconfidence risk",
          description: "Overconfidence may lead to underestimating challenges.",
          rating: "HIGH",
        },
        {
          id: "w2",
          title: "Short-term focus",
          description:
            "Focus on short-term wins might overshadow long-term planning.",
          rating: "MEDIUM",
        },
        {
          id: "w3",
          title: "Past experience reliance",
          description:
            "Tendency to rely on past experiences instead of adapting to new dynamics.",
          rating: "MEDIUM",
        },
        {
          id: "w4",
          title: "Warning sign recognition",
          description:
            "Difficulty in recognizing early warning signs of deeper challenges.",
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Opportunities",
      items: [
        {
          id: "o1",
          title: "Fresh ideas and innovation",
          description:
            "Ability to bring fresh ideas and innovative approaches to tasks.",
          rating: "HIGH",
        },
        {
          id: "o2",
          title: "Strong team relationships",
          description:
            "Building strong relationships with team members due to a positive outlook.",
          rating: "HIGH",
        },
        {
          id: "o3",
          title: "Early credibility establishment",
          description:
            "Opportunity to create lasting impressions and establish credibility early.",
          rating: "MEDIUM",
        },
        {
          id: "o4",
          title: "Cultural influence",
          description:
            "Driving cultural shifts or inspiring peers with their enthusiasm.",
          rating: "MEDIUM",
        },
      ],
    },
    {
      type: "Threats",
      items: [
        {
          id: "t1",
          title: "Burnout risk",
          description:
            "Risk of burnout if expectations are not met or challenges become overwhelming.",
          rating: "CRITICAL",
        },
        {
          id: "t2",
          title: "Adaptability concerns",
          description: "Lack of adaptability if initial strategies don't work.",
          rating: "HIGH",
        },
        {
          id: "t3",
          title: "Unrealistic expectations",
          description: "Unrealistic expectations may lead to disappointment.",
          rating: "HIGH",
        },
        {
          id: "t4",
          title: "Team isolation risk",
          description:
            "Overemphasis on self-performance may isolate them from team dynamics.",
          rating: "MEDIUM",
        },
      ],
    },
  ];
};
