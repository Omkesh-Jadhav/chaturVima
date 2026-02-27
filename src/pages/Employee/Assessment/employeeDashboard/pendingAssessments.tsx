import { useEffect, useState } from "react";
import { Play, Calendar } from "lucide-react";
import { AnimatedContainer, Button } from "@/components/ui";
import { useUser } from "@/context/UserContext";
import { formatDisplayDate } from "@/utils/dateUtils";
import { mapQuestionnaireToAssessmentType } from "@/utils/assessmentUtils";
import {
  getEmployeePendingCycles,
  type EmployeePendingCycle,
} from "@/api/api-functions/employee-dashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

interface PendingCard {
  id: string;
  cycleName: string;
  assessmentTypes: string[];
  startDate: string;
  endDate: string;
}

const PendingAssessments = () => {
  const { user } = useUser();
  const [pending, setPending] = useState<PendingCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const employeeId = user?.employee_id;
    if (!employeeId) return;

    const fetchPending = async () => {
      setIsLoading(true);
      try {
        const cycles: EmployeePendingCycle[] = await getEmployeePendingCycles(
          employeeId,
          ["Active"]
        );
        const mapped: PendingCard[] = cycles.map((cycle, index) => {
          const types =
            cycle.questionnaires?.map((q) => {
              const mappedType = mapQuestionnaireToAssessmentType(q.name);
              return mappedType ?? q.name;
            }) ?? [];
          return {
            id: `${cycle.assessment_cycle}-${index}`,
            cycleName: cycle.assessment_cycle,
            assessmentTypes: types,
            startDate: cycle.start_date,
            endDate: cycle.end_date,
          };
        });
        setPending(mapped);
      } catch (error) {
        console.error("Failed to fetch pending assessments:", error);
        setPending([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPending();
  }, [user?.employee_id]);

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      delay="md"
      className={CARD_BASE_CLASSES}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Assessments
        </h2>
        <p className="text-xs text-gray-500">Upcoming tests and due dates</p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
            Loading pending assessments...
          </div>
        ) : pending.length === 0 ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Not Available</p>
            <p className="text-xs text-gray-500 mt-1">
              Pending assessments will appear when provided by the API.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {pending.map((item, idx) => (
              <AnimatedContainer
                key={item.id}
                animation="scaleIn"
                transitionPreset="spring"
                delay={idx * 0.1}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3.5 transition-all hover:shadow-md hover:border-gray-300"
              >
                <h3 className="text-xs font-semibold text-gray-900 mb-2.5 line-clamp-2 min-h-[32px]">
                  {item.cycleName}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {item.assessmentTypes.map((type, typeIdx) => (
                    <span
                      key={typeIdx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[13px] font-medium"
                    >
                      {type.split(" ")[0]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-[13px] text-gray-500">
                    <span className="font-semibold">Due:</span>{" "}
                    {formatDisplayDate(item.endDate)}
                  </span>
                </div>
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full relative overflow-hidden text-xs py-1.5"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Start Test
                </Button>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default PendingAssessments;
