import React from "react";
import { CheckCircle } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  const progressPercentage =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative px-4">
        {/* Background line */}
        <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-200 rounded-full z-0" />

        {/* Progress line */}
        <div
          className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full z-10 transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative z-20 flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-brand-teal border-brand-teal text-white shadow-md"
                    : isActive
                    ? "bg-brand-navy border-brand-navy text-white shadow-md ring-4 ring-brand-teal/20"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[100px] ${
                  isActive || isCompleted ? "text-brand-navy" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
