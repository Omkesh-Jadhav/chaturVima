import { useEffect, useState, useMemo } from "react";
import { Target, ListTodo } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader, SWOT_CONFIG } from "@/components/assessmentDashboard";
import { useUser } from "@/context/UserContext";
import { useSelectedAssessmentCycle } from "@/context/SelectedAssessmentCycleContext";
import {
  getEmployeeWeightedAssessmentSummary,
  getSwotAnalysisBySubStage,
  type EmployeeWeightedAssessmentSummary,
  type SwotAnalysisData,
  type SwotItem,
} from "@/api/api-functions/employee-dashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const SWOT_QUADRANTS = ["Strengths", "Weaknesses", "Opportunities", "Threats"] as const;

type SwotQuadrant = (typeof SWOT_QUADRANTS)[number];

const API_FIELD_MAP: Record<SwotQuadrant, keyof SwotAnalysisData> = {
  Strengths: "strength",
  Weaknesses: "weakness",
  Opportunities: "opportunities",
  Threats: "threat",
};

/** Get description from SWOT item (API uses "desription" for threat) */
function getItemDescription(item: SwotItem): string {
  return item.description ?? item.desription ?? "";
}

/** From weighted summary, pick the sub-stage with the highest score. Falls back to dominant_sub_stage. */
function getHighScoreSubStage(summary: EmployeeWeightedAssessmentSummary | null): string | null {
  if (!summary) return null;
  const stages = summary.stages ?? [];
  let best: { sub_stage: string; score: number } | null = null;
  for (const stage of stages) {
    const subStages = stage.sub_stages ?? [];
    for (const sub of subStages) {
      const score = sub.score ?? 0;
      if (best === null || score > best.score) {
        best = { sub_stage: sub.sub_stage, score };
      }
    }
  }
  if (best?.sub_stage) return best.sub_stage;
  return summary.dominant_sub_stage?.trim() || null;
}

const SWOTAnalysis = () => {
  const { user } = useUser();
  const { selectedCycle } = useSelectedAssessmentCycle();
  const [weightedSummary, setWeightedSummary] = useState<EmployeeWeightedAssessmentSummary | null>(null);
  const [swotData, setSwotData] = useState<SwotAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const highScoreSubStage = useMemo(() => getHighScoreSubStage(weightedSummary), [weightedSummary]);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) {
      setIsLoading(false);
      setError("User not found");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setSwotData(null);
      try {
        const summary = await getEmployeeWeightedAssessmentSummary(
          employeeId,
          selectedCycle?.cycleId
        );
        setWeightedSummary(summary);
        const subStage = getHighScoreSubStage(summary);
        if (!subStage) {
          setError("No sub-stage score available for this cycle.");
          setIsLoading(false);
          return;
        }
        const swot = await getSwotAnalysisBySubStage(subStage);
        setSwotData(swot ?? null);
        if (!swot) setError("SWOT analysis not found for your dominant sub-stage.");
      } catch (err) {
        console.error("SWOT Analysis fetch error:", err);
        setError("Failed to load SWOT analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.employee_id, selectedCycle?.cycleId]);

  if (isLoading) {
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
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
          Loading SWOT analysis...
        </div>
      </AnimatedContainer>
    );
  }

  if (error) {
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
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-center text-sm text-amber-800">
          {error}
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="sm"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="SWOT Analysis"
        description={
          highScoreSubStage
            ? `Based on your dominant sub-stage: ${highScoreSubStage}`
            : "Strategic assessment across four key dimensions"
        }
      />
      {swotData?.strategic_recommendations && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900 mb-1">Strategic recommendations</p>
          <p className="whitespace-pre-wrap">{swotData.strategic_recommendations}</p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2 mt-4">
        {SWOT_QUADRANTS.map((type) => {
          const config = SWOT_CONFIG[type];
          const Icon = config.icon;
          const field = API_FIELD_MAP[type];
          const items: SwotItem[] = (swotData?.[field] as SwotItem[] | undefined) ?? [];
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
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500">Not Available</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li
                        key={item.name ?? idx}
                        className={`text-sm ${config.text} ${config.itemBg} ${config.border} border rounded-lg px-3 py-2`}
                      >
                        {getItemDescription(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {(swotData?.reccomendation?.length ?? 0) > 0 && swotData && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-indigo-500 to-violet-600 text-white">
            <Target className="h-5 w-5 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Recommendations
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            {swotData.reccomendation!.map((rec, idx) => (
              <div
                key={rec.name ?? idx}
                className="relative rounded-xl border border-gray-100 bg-linear-to-br from-gray-50 to-white p-4 pr-4 pl-5 border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
              >
                <span className="absolute left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {idx + 1}
                </span>
                {rec.recommendations_title && (
                  <p className="text-sm font-semibold text-gray-900 mb-2 pl-6">
                    {rec.recommendations_title}
                  </p>
                )}
                {rec.recommendations_description && (
                  <p className="text-sm text-gray-600 leading-relaxed pl-6">
                    {rec.recommendations_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {(swotData?.actionable_steps?.length ?? 0) > 0 && swotData && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-teal-500 to-emerald-600 text-white">
            <ListTodo className="h-4 w-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide">Actionable steps</h3>
          </div>
          <div className="p-2 sm:p-3">
            <div className="grid grid-cols-2 gap-2">
              {swotData.actionable_steps!.map((step, idx) => (
                <div
                  key={step.name ?? idx}
                  className="flex gap-2 rounded border border-gray-100 bg-gray-50/50 py-1.5 px-2"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-teal-500 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 text-xs text-gray-700 leading-snug">
                    {getItemDescription(step)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
};

export default SWOTAnalysis;
