import { motion } from "framer-motion";
import { Check, AlertCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-teal to-brand-navy p-6 pb-8 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Check className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ready to Submit?</h2>
              <p className="text-sm text-white/90 mt-1">
                Please review your answers before final submission
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border-2 border-orange-300">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                ⚠️ Warning: Final Submission
              </p>
              <p className="text-sm text-orange-800 leading-relaxed">
                Once you submit, your answers will be locked and{" "}
                <span className="font-bold text-orange-900">cannot be changed</span>.
                Please double-check that all your responses are correct before proceeding.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Questions Answered</span>
              <span className="text-lg font-bold text-brand-teal">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              size="sm"
              className="flex-1 cursor-pointer border-gray-300 hover:bg-gray-50 text-xs"
            >
              Review Answers
            </Button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 text-white shadow-lg hover:shadow-xl px-3 py-1.5 text-xs h-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Submit Assessment
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;

