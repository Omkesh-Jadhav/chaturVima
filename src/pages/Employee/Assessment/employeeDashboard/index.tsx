import { useEffect, useRef, useState } from "react";
import { AnimatedBackground } from "@/components/common";
import { BACKGROUND_COLORS } from "@/components/assessmentDashboard";
import { Select } from "@/components/ui";
import { useSelectedAssessmentCycle } from "@/context/SelectedAssessmentCycleContext";
import SummaryCards from "./summaryCards";
import SubStagesBreakdown from "./subStagesBreakdown";
import SWOTAnalysis from "./swotAnalysis";
import EmotionalIntensityHeatmap from "./emotionalIntensityHeatmap";
import AssessmentTypesSubStagesHeatmap from "./assessmentTypesSubStagesHeatmap";
import TransitionLab from "./transitionLab";
import PendingAssessments from "./pendingAssessments";
import TestHistory from "./testHistory";
import type { EmotionalStageAssessment as EmotionalStageAssessmentType } from "@/data/assessmentDashboard";
import EmotionalStageAssessment from "./emotionalStageAssessment";

const EmployeeDashboard = () => {
  const [selectedStage, setSelectedStage] =
    useState<EmotionalStageAssessmentType | null>(null);
  const subStagesRef = useRef<HTMLDivElement | null>(null);
  const [pendingScrollToSubStages, setPendingScrollToSubStages] =
    useState(false);
  const {
    cycles,
    selectedCycle,
    setSelectedCycle,
    isLoadingCycles,
  } = useSelectedAssessmentCycle();

  useEffect(() => {
    if (!pendingScrollToSubStages) return;
    if (!selectedStage) return;
    subStagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setPendingScrollToSubStages(false);
  }, [pendingScrollToSubStages, selectedStage]);

  const handleCycleChange = (value: string) => {
    const cycle = cycles.find((c) => c.cycleName === value) ?? null;
    setSelectedCycle(cycle);
  };

  return (
    <div className="space-y-6 relative">
      <AnimatedBackground colors={[...BACKGROUND_COLORS]} />
      <div className="relative z-20">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Assessment Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Your assessments, insights, and progress at a glance.
            </p>
          </div>
          <div className="min-w-[200px] sm:min-w-[240px]">
            <Select
              label="Assessment Name"
              value={selectedCycle?.cycleName ?? ""}
              onChange={handleCycleChange}
              options={cycles.map((c) => ({ value: c.cycleName, label: c.cycleName }))}
              placeholder={isLoadingCycles ? "Loading..." : "Select assessment"}
              disabled={isLoadingCycles || cycles.length === 0}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <SummaryCards />

        <EmotionalStageAssessment
          onStageSelect={setSelectedStage}
          onStageClick={(stage) => setPendingScrollToSubStages(Boolean(stage))}
          selectedStage={selectedStage}
        />
        <div ref={subStagesRef} className="scroll-mt-24">
          <SubStagesBreakdown selectedStage={selectedStage} />
        </div>

        <SWOTAnalysis />
        <EmotionalIntensityHeatmap />
        <AssessmentTypesSubStagesHeatmap />
        {/* <TransitionLab /> */}
        <PendingAssessments />
        <TestHistory />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
