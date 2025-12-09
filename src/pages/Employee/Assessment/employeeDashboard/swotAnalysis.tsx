import { useMemo } from "react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader, SWOT_CONFIG } from "@/components/assessmentDashboard";
import {
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_PENDING_ASSESSMENTS,
} from "@/data/assessmentDashboard";
import { calculateCompletionRate } from "@/utils/assessmentUtils";
import { generateSWOTAnalysis, type SWOTQuadrant } from "@/utils/swotUtils";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const SWOTAnalysis = () => {
  const categoryDistribution = MOCK_CATEGORY_DISTRIBUTION;
  const totalCompleted = 0;
  const totalPending = MOCK_PENDING_ASSESSMENTS.length;
  const completionRate = useMemo(
    () => calculateCompletionRate(totalCompleted, totalPending),
    [totalCompleted, totalPending]
  );

  const swotData = useMemo<SWOTQuadrant[]>(
    () =>
      generateSWOTAnalysis(categoryDistribution, completionRate, totalPending),
    [categoryDistribution, completionRate, totalPending]
  );

  return (
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
                {quadrant.items.map((item, idx) => (
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
                ))}
              </div>
            </AnimatedContainer>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default SWOTAnalysis;
