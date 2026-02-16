import { useEffect, useState } from "react";
import { AnimatedContainer } from "@/components/ui";
import { EmotionalStageTransitionLab } from "@/components/assessment";
import type { HistoricalAssessment } from "@/components/assessment/EmotionalStageTransitionLab";
import { useUser } from "@/context/UserContext";
import { getEmployeeCycleTransitionLab } from "@/api/api-functions/employee-dashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const TransitionLab = () => {
  const { user } = useUser();
  const [historicalAssessments, setHistoricalAssessments] = useState<
    HistoricalAssessment[] | undefined
  >(undefined);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        const entries = await getEmployeeCycleTransitionLab(employeeId);

        const mapped: HistoricalAssessment[] = entries.map((entry, index) => {
          const stageScores: HistoricalAssessment["stageScores"] = {
            Honeymoon: 0,
            "Self-Introspection": 0,
            "Soul-Searching": 0,
            "Steady-State": 0,
          };

          entry.stages.forEach((stage) => {
            if (stage.stage in stageScores) {
              stageScores[stage.stage as keyof typeof stageScores] =
                stage.score;
            }
          });

          const totalScore = Object.values(stageScores).reduce(
            (sum, val) => sum + (val || 0),
            0
          );

          return {
            id: entry.assessment_cycle || `cycle-${index}`,
            title: entry.assessment_cycle,
            date: entry.last_submitted_on,
            dominantStage: entry.dominant_stage,
            status: entry.status,
            stageScores,
            score: totalScore,
          };
        });

        // Sort by date (descending) so latest appears first
        mapped.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistoricalAssessments(mapped);
      } catch (error) {
        console.error(
          "Failed to fetch employee cycle transition lab data:",
          error
        );
        setHistoricalAssessments(undefined);
      }
    };

    fetchData();
  }, [user?.employee_id]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="md"
      className={CARD_BASE_CLASSES}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Transition Lab</h2>
        <p className="text-xs text-gray-500">
          Analyze your emotional stage progression across multiple assessments
        </p>
      </div>
      <div className="mt-4">
        <EmotionalStageTransitionLab
          historicalAssessments={historicalAssessments}
        />
      </div>
    </AnimatedContainer>
  );
};

export default TransitionLab;
