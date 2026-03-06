/**
 * Success Modal Component
 * 
 * Displays a celebration modal after successful assessment submission.
 * Shows confetti animation and achievement badges.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui";
// import { cn } from "@/utils/cn";
import { CONFETTI_COLORS } from "@/data/assessmentDashboard";
import { reportGenerationBySubmission } from "@/api/api-functions/reports";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useUser } from "@/context/UserContext";

interface Questionnaire {
  name: string;
  displayName: string;
  isComplete: boolean;
  submission_name?: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: (questionnaire?: string) => void;
  questionnaires?: Questionnaire[];
  cycleId?: string;
}

// const iconMap = { Target, Star, Zap };

const SuccessModal = ({ isOpen, onClose, onViewReport, questionnaires = [], cycleId }: SuccessModalProps) => {
  const { user } = useUser();
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; color: string; delay: number }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      setConfetti(
        Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          delay: Math.random() * 0.5,
        }))
      );
    }
  }, [isOpen]);

  // Handle report opening: Call POST API and use report_url from response
  const handleViewReport = async (questionnaire: Questionnaire) => {
    if (!user?.employee_id) {
      alert('Employee ID not found. Please log in again.');
      return;
    }

    if (!questionnaire.submission_name) {
      // Fallback to original behavior if no submission_name
      onViewReport(questionnaire.name);
      return;
    }

    if (!cycleId) {
      alert('Cycle ID not found. Please try again.');
      return;
    }

    try {
      // Call POST API to generate report
      console.log('Generating report for:', questionnaire.name, 'with submission ID:', questionnaire.submission_name);
      const response = await reportGenerationBySubmission(user.employee_id, cycleId, questionnaire.submission_name);
      console.log('Report generation response:', response);

      // Check if response contains report_url
      if (response && response.report_url) {
        // Construct full URL using base URL + report_url from response
        const fullReportUrl = `${API_ENDPOINTS.REPORT.REPORT_PDF}${response.report_url}`;
        console.log('Opening report URL:', fullReportUrl);
        
        // Validate and open URL in new tab
        try {
          const url = new URL(fullReportUrl);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            window.open(fullReportUrl, '_blank');
          } else {
            throw new Error('Invalid URL protocol');
          }
        } catch (urlError) {
          console.error('Invalid report URL:', fullReportUrl, urlError);
          alert('Invalid report URL received from server');
        }
      } else {
        console.error('No report_url in response:', response);
        alert('Report URL not found in server response. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, window.innerHeight + 20],
              rotate: 360,
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg max-h-[90vh] rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-200 flex items-center justify-center group"
        >
          <X className="h-4 w-4 text-white group-hover:text-white/80" />
        </button>
        <div className="bg-linear-to-r from-brand-teal via-brand-navy to-brand-teal p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-1"
            >
              Assessment Complete! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-md"
            >
              Thank you for your thoughtful responses
            </motion.p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Sparkles className="h-5 w-5 text-brand-teal" />
                <span className="text-sm font-medium">Your insights are being analyzed and Your organizational health profile is being generated based on your honest feedback.</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {questionnaires.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    {questionnaires.map((questionnaire) => (
                      <Button
                        key={questionnaire.name}
                        onClick={() => handleViewReport(questionnaire)}
                        className="w-full cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
                        disabled={!questionnaire.isComplete}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        View {questionnaire.displayName} Results
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => onViewReport()}
                    className="flex-1 cursor-pointer bg-linear-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">
                    Close
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;

