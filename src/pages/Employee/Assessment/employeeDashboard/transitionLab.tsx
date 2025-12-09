import { AnimatedContainer } from "@/components/ui";
import { EmotionalStageTransitionLab } from "@/components/assessment";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

const TransitionLab = () => {
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
        <EmotionalStageTransitionLab />
      </div>
    </AnimatedContainer>
  );
};

export default TransitionLab;
