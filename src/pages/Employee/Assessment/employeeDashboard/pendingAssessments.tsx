import { AnimatedContainer } from "@/components/ui";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const PendingAssessments = () => {
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
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-6 text-center">
        <p className="text-sm font-medium text-gray-600">Not Available</p>
        <p className="text-xs text-gray-500 mt-1">Pending assessments will appear when provided by the API.</p>
      </div>
    </AnimatedContainer>
  );
};

export default PendingAssessments;
