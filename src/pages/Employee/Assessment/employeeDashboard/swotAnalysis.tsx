import { AnimatedContainer } from "@/components/ui";
import { SectionHeader, SWOT_CONFIG } from "@/components/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const SWOT_QUADRANTS = ["Strengths", "Weaknesses", "Opportunities", "Threats"] as const;

const SWOTAnalysis = () => {
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
      <div className="grid gap-3 md:grid-cols-2 mt-4">
        {SWOT_QUADRANTS.map((type) => {
          const config = SWOT_CONFIG[type];
          const Icon = config.icon;
          return (
            <div
              key={type}
              className="rounded-xl border border-gray-100 bg-white overflow-hidden"
            >
              <div
                className={`flex items-center gap-2 px-4 py-2.5 ${config.headerBg} text-white`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {type}
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">Not Available</p>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default SWOTAnalysis;
