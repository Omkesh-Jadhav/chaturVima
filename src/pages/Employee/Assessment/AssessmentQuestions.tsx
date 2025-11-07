/**
 * Assessment Questions Page
 * Multi-question assessment interface with progress sidebar
 * Optimized for 80+ questions with engaging animations
 *
 * Typography Standards:
 * - Page Title: text-2xl md:text-3xl font-bold
 * - Section Headings: text-lg font-semibold
 * - Question Text: text-base font-medium
 * - Body Text: text-sm font-normal
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../../../context/AssessmentContext";
import { useUser } from "../../../context/UserContext";
import { Button, Card, CardContent } from "../../../components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Send,
  AlertCircle,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Target,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import { cn } from "../../../utils/cn";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
}) => {
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
        {/* Header */}
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
              <h2 className="text-2xl font-bold text-white">
                Ready to Submit?
              </h2>
              <p className="text-sm text-white/90 mt-1">
                Please review your answers before final submission
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Please Note
                </p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Once you submit, your answers will be locked and{" "}
                  <span className="font-medium">cannot be changed</span>. Please
                  double-check that all your responses are correct.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Questions Answered
                </span>
                <span className="text-lg font-bold text-brand-teal">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(answeredCount / totalQuestions) * 100}%`,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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

// Success Modal Component
const SuccessModal = ({
  isOpen,
  onClose,
  onViewReport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
}) => {
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: [
          "#2BC6B4",
          "#1E3A5F",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#10B981",
        ][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Confetti */}
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
        className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-brand-teal via-brand-navy to-brand-teal p-8 pb-12 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
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
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/20"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Assessment Complete! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-lg"
            >
              Thank you for your thoughtful responses
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Sparkles className="h-5 w-5 text-brand-teal" />
                <span className="text-sm font-medium">
                  Your insights are being analyzed
                </span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed">
                We've successfully received your assessment responses. Your
                organizational health profile is being generated based on your
                honest feedback.
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: Target, label: "Completed", color: "text-blue-600" },
                { icon: Star, label: "Thoughtful", color: "text-yellow-600" },
                { icon: Zap, label: "Valuable", color: "text-purple-600" },
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <badge.icon className={cn("h-6 w-6", badge.color)} />
                  <span className="text-xs font-medium text-gray-700">
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={onViewReport}
                className="flex-1 cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
              >
                <Trophy className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AssessmentQuestions = () => {
  const navigate = useNavigate();
  const {
    progress,
    questions,
    answers,
    answerQuestion,
    submitAssessment,
    isComplete,
  } = useAssessment();

  const { user } = useUser();

  // Helper function to get user-specific page storage key
  const getPageStorageKey = useCallback(() => {
    if (!user) return "chaturvima_assessment_page_anonymous";
    const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `chaturvima_assessment_page_${emailKey}`;
  }, [user]);

  // Helper function to get user-specific submission status storage key
  const getSubmissionStorageKey = useCallback(() => {
    if (!user) return "chaturvima_assessment_submitted_anonymous";
    const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `chaturvima_assessment_submitted_${emailKey}`;
  }, [user]);

  // Optimize for 80+ questions: show 5 questions per page
  const [questionsPerPage] = useState(5);
  // Load saved page from localStorage
  const loadSavedPage = useCallback(() => {
    try {
      const storageKey = getPageStorageKey();
      const savedPage = localStorage.getItem(storageKey);
      return savedPage ? parseInt(savedPage, 10) : 0;
    } catch {
      return 0;
    }
  }, [getPageStorageKey]);

  // Load saved submission status
  const loadSavedSubmissionStatus = useCallback(() => {
    try {
      const storageKey = getSubmissionStorageKey();
      const savedStatus = localStorage.getItem(storageKey);
      return savedStatus === "true";
    } catch {
      return false;
    }
  }, [getSubmissionStorageKey]);

  const [currentPage, setCurrentPage] = useState(loadSavedPage);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => {
    // Check if assessment was already submitted (from localStorage or context)
    return loadSavedSubmissionStatus() || false;
  });
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Ensure page position and submission status are restored on mount and when user changes
  useEffect(() => {
    try {
      const storageKey = getPageStorageKey();
      const savedPage = localStorage.getItem(storageKey);

      // Restore page position if saved
      if (savedPage) {
        const pageNum = parseInt(savedPage, 10);
        if (pageNum >= 0 && pageNum < totalPages && pageNum !== currentPage) {
          setCurrentPage(pageNum);
        }
      }

      // Restore submission status from localStorage or context
      const submissionKey = getSubmissionStorageKey();
      const savedSubmissionStatus = localStorage.getItem(submissionKey);
      if ((savedSubmissionStatus === "true" || isComplete) && !isSubmitted) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error restoring saved state:", error);
    }
  }, [
    getPageStorageKey,
    getSubmissionStorageKey,
    totalPages,
    currentPage,
    isSubmitted,
    isComplete,
  ]);

  // Get questions for current page
  const currentPageQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return questions.slice(start, end);
  }, [questions, currentPage, questionsPerPage]);

  const allAnswered = Object.keys(answers).length === questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    // Prevent editing after submission
    if (isSubmitted) return;

    answerQuestion(questionId, optionIndex);

    // Auto-advance to next question after answering
    const currentQuestionIndex = questions.findIndex(
      (q) => q.id === questionId
    );
    if (
      currentQuestionIndex !== -1 &&
      currentQuestionIndex < questions.length - 1
    ) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextPage = Math.floor(nextQuestionIndex / questionsPerPage);
      const nextQuestion = questions[nextQuestionIndex];

      // Check if next question is on the same page
      if (nextPage === currentPage) {
        // Scroll to next question on same page
        setTimeout(() => {
          const nextQuestionElement = questionRefs.current[nextQuestion.id];
          if (nextQuestionElement && questionsContainerRef.current) {
            const container = questionsContainerRef.current;
            const elementTop = nextQuestionElement.offsetTop;

            // Scroll to show the next question
            container.scrollTo({
              top: elementTop - 20, // 20px offset from top
              behavior: "smooth",
            });
          }
        }, 300);
      } else {
        // Move to next page if next question is on different page
        if (nextPage < totalPages) {
          setTimeout(() => {
            setCurrentPage(nextPage);
            try {
              const storageKey = getPageStorageKey();
              localStorage.setItem(storageKey, nextPage.toString());
            } catch (error) {
              console.error("Error saving page to localStorage:", error);
            }
            // Scroll to top of questions container to show first question of new page
            if (questionsContainerRef.current) {
              questionsContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }, 300);
        }
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      // Auto-save current page
      try {
        const storageKey = getPageStorageKey();
        localStorage.setItem(storageKey, newPage.toString());
      } catch (error) {
        console.error("Error saving page to localStorage:", error);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      // Auto-save current page
      try {
        const storageKey = getPageStorageKey();
        localStorage.setItem(storageKey, newPage.toString());
      } catch (error) {
        console.error("Error saving page to localStorage:", error);
      }
    }
  };

  const handleSave = () => {
    // If all questions are answered, show confirmation modal for submission
    if (allAnswered && !isSubmitted) {
      setShowConfirmationModal(true);
    } else {
      // Otherwise, just save progress to localStorage
      try {
        const storageKey = getPageStorageKey();
        localStorage.setItem(storageKey, currentPage.toString());

        // Save answers to localStorage
        const answersKey = `chaturvima_assessment_answers_${
          user?.email.toLowerCase().replace(/[^a-z0-9]/g, "_") || "anonymous"
        }`;
        localStorage.setItem(answersKey, JSON.stringify(answers));
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmationModal(false);
    submitAssessment();
    setIsSubmitted(true);
    setShowSuccessModal(true);

    // Save submission status to localStorage
    try {
      const submissionKey = getSubmissionStorageKey();
      localStorage.setItem(submissionKey, "true");

      // Clear saved page state after submission
      const storageKey = getPageStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error saving submission status:", error);
    }
  };

  const handleViewReport = () => {
    setShowSuccessModal(false);
    navigate("/assessment-report");
  };

  // Auto-scroll to top of questions container when page changes
  useEffect(() => {
    if (questionsContainerRef.current) {
      questionsContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  // Smart pagination: show ellipsis for large question sets
  const getPaginationButtons = () => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }).map((_, idx) => idx);
    }

    const buttons: (number | "ellipsis")[] = [];

    if (currentPage < 5) {
      for (let i = 0; i < 7; i++) buttons.push(i);
      buttons.push("ellipsis");
      buttons.push(totalPages - 1);
    } else if (currentPage > totalPages - 6) {
      buttons.push(0);
      buttons.push("ellipsis");
      for (let i = totalPages - 7; i < totalPages; i++) buttons.push(i);
    } else {
      buttons.push(0);
      buttons.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) buttons.push(i);
      buttons.push("ellipsis");
      buttons.push(totalPages - 1);
    }

    return buttons;
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative z-10 h-full w-full overflow-hidden px-4 py-3 lg:px-6 lg:py-8">
        <div className="h-full overflow-hidden flex flex-col">
          <div className="grid lg:grid-cols-4 gap-4 h-full min-h-0 flex-1 overflow-hidden">
            {/* Main Questions Area */}
            <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="flex-shrink-0 space-y-3 mb-4">
                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/assessment")}
                  className="cursor-pointer text-xs py-1.5 h-auto"
                  size="sm"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Assessment
                </Button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <motion.h1
                        className="text-2xl md:text-3xl font-bold text-gray-900"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Assessment Questions
                      </motion.h1>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Questions List - Scrollable */}
              <div
                ref={questionsContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-4"
              >
                <AnimatePresence mode="wait">
                  {currentPageQuestions.map((question, idx) => {
                    const questionNumber =
                      currentPage * questionsPerPage + idx + 1;
                    const selectedAnswer = answers[question.id];

                    return (
                      <motion.div
                        key={`${question.id}-${currentPage}`}
                        ref={(el) => {
                          questionRefs.current[question.id] = el;
                        }}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          delay: idx * 0.08,
                          type: "spring",
                          stiffness: 120,
                          damping: 15,
                        }}
                        layout
                        className="relative"
                      >
                        {/* Floating particles for answered questions */}
                        {selectedAnswer !== undefined && (
                          <div className="absolute -top-2 -right-2 -z-10">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-brand-teal/40"
                                animate={{
                                  x: [0, Math.cos(i * 120) * 20],
                                  y: [0, Math.sin(i * 120) * 20],
                                  opacity: [0.6, 0],
                                  scale: [1, 0],
                                }}
                                transition={{
                                  duration: 1,
                                  delay: i * 0.2,
                                  repeat: Infinity,
                                  repeatDelay: 2,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <motion.div
                          animate={
                            selectedAnswer !== undefined
                              ? {
                                  boxShadow: [
                                    "0 0 0 0px rgba(43, 198, 180, 0.4)",
                                    "0 0 0 8px rgba(43, 198, 180, 0)",
                                  ],
                                }
                              : {}
                          }
                          transition={{ duration: 0.6 }}
                        >
                          <Card
                            variant="elevated"
                            className={cn(
                              "transition-all duration-300 relative overflow-hidden group",
                              selectedAnswer !== undefined
                                ? "border-brand-teal border-2 shadow-lg"
                                : "border-gray-200 hover:border-brand-teal/30 hover:shadow-md"
                            )}
                          >
                            <CardContent className="p-6 relative z-10">
                              {/* Question Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="mb-1.5">
                                    <span className="text-xs text-gray-500">
                                      Question {questionNumber} of{" "}
                                      {questions.length}
                                    </span>
                                  </div>
                                  <h3 className="text-base font-medium text-gray-900">
                                    {question.text}
                                  </h3>
                                  {question.description && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {question.description}
                                    </p>
                                  )}
                                </div>
                                <AnimatePresence>
                                  {selectedAnswer !== undefined && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{
                                        scale: 1,
                                        rotate: 0,
                                        y: [0, -5, 0],
                                      }}
                                      exit={{ scale: 0, rotate: 180 }}
                                      transition={{
                                        rotate: {
                                          type: "spring",
                                          stiffness: 200,
                                        },
                                        y: {
                                          duration: 2,
                                          repeat: Infinity,
                                          repeatType: "reverse",
                                        },
                                      }}
                                      className="flex-shrink-0 ml-4 relative"
                                    >
                                      <motion.div
                                        className="absolute inset-0 rounded-full bg-green-400/30 blur-md"
                                        animate={{
                                          scale: [1, 1.3, 1],
                                          opacity: [0.5, 0, 0.5],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                        }}
                                      />
                                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                                        <Check className="h-5 w-5 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Options */}
                              <div className="space-y-2 mt-4">
                                {question.options.map((option, optionIndex) => {
                                  const isSelected =
                                    selectedAnswer === optionIndex;
                                  return (
                                    <motion.button
                                      key={optionIndex}
                                      type="button"
                                      onClick={() =>
                                        handleAnswerChange(
                                          question.id,
                                          optionIndex
                                        )
                                      }
                                      disabled={isSubmitted}
                                      whileHover={
                                        isSubmitted
                                          ? {}
                                          : {
                                              scale: 1.02,
                                              x: 4,
                                              boxShadow: isSelected
                                                ? "0 4px 12px rgba(43, 198, 180, 0.2)"
                                                : "0 4px 12px rgba(0, 0, 0, 0.08)",
                                            }
                                      }
                                      whileTap={
                                        isSubmitted ? {} : { scale: 0.98 }
                                      }
                                      className={cn(
                                        "w-full text-left p-3 rounded-lg border-2 transition-all relative overflow-hidden group/option text-sm overflow-x-hidden",
                                        isSubmitted
                                          ? "cursor-not-allowed opacity-60"
                                          : "cursor-pointer",
                                        isSelected
                                          ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                                          : "border-gray-200 bg-white hover:border-brand-teal/50 hover:bg-gray-50"
                                      )}
                                    >
                                      {/* Ripple effect on click */}
                                      <motion.div
                                        className="absolute inset-0 rounded-lg bg-brand-teal/20"
                                        initial={{ scale: 0, opacity: 0.5 }}
                                        animate={
                                          isSelected
                                            ? {
                                                scale: [0, 2],
                                                opacity: [0.5, 0],
                                              }
                                            : {}
                                        }
                                        transition={{ duration: 0.6 }}
                                      />

                                      {/* Static accent line for selected */}
                                      {isSelected && (
                                        <motion.div
                                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-teal to-brand-navy"
                                          initial={{ scaleY: 0 }}
                                          animate={{ scaleY: 1 }}
                                          transition={{ duration: 0.3 }}
                                        />
                                      )}
                                      <div className="flex items-center gap-3 relative z-10">
                                        <motion.div
                                          className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative",
                                            isSelected
                                              ? "border-brand-teal bg-brand-teal"
                                              : "border-gray-300 group-hover/option:border-brand-teal/50"
                                          )}
                                          animate={
                                            isSelected
                                              ? {
                                                  scale: [1, 1.2, 1],
                                                  rotate: [0, 180, 360],
                                                }
                                              : {}
                                          }
                                          transition={{ duration: 0.5 }}
                                        >
                                          {isSelected && (
                                            <motion.div
                                              initial={{
                                                scale: 0,
                                                rotate: -180,
                                              }}
                                              animate={{ scale: 1, rotate: 0 }}
                                              className="w-2 h-2 rounded-full bg-white"
                                            />
                                          )}
                                        </motion.div>
                                        <span
                                          className={cn(
                                            "text-sm font-normal",
                                            isSelected
                                              ? "text-gray-900"
                                              : "text-gray-700"
                                          )}
                                        >
                                          {option}
                                        </span>
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0 || isSubmitted}
                  className={cn(
                    "text-xs py-1.5 h-auto",
                    isSubmitted
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  )}
                  size="sm"
                >
                  <ChevronLeft className="mr-1.5 h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPaginationButtons().map((pageIdx, idx) => {
                    if (pageIdx === "ellipsis") {
                      return (
                        <motion.span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-gray-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          ...
                        </motion.span>
                      );
                    }
                    const isCurrentPage = currentPage === pageIdx;
                    return (
                      <motion.button
                        key={pageIdx}
                        onClick={() => {
                          if (isSubmitted) return;
                          setCurrentPage(pageIdx);
                          // Auto-save current page
                          try {
                            const storageKey = getPageStorageKey();
                            localStorage.setItem(
                              storageKey,
                              pageIdx.toString()
                            );
                          } catch (error) {
                            console.error(
                              "Error saving page to localStorage:",
                              error
                            );
                          }
                        }}
                        disabled={isSubmitted}
                        whileHover={
                          isSubmitted
                            ? {}
                            : {
                                scale: 1.15,
                                y: -2,
                              }
                        }
                        whileTap={isSubmitted ? {} : { scale: 0.9 }}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-medium transition-all relative",
                          isSubmitted
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer",
                          isCurrentPage
                            ? "bg-brand-teal text-white shadow-md"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        )}
                      >
                        {isCurrentPage && (
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-brand-teal/30 blur-md"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}
                        <span className="relative z-10">{pageIdx + 1}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {currentPage === totalPages - 1 ? (
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitted}
                    className={cn(
                      "text-xs py-1.5 h-auto",
                      isSubmitted
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : allAnswered
                        ? "bg-gradient-to-r from-brand-teal to-brand-navy text-white cursor-pointer"
                        : "bg-gray-200 border border-gray-300 text-gray-700 cursor-pointer"
                    )}
                    size="sm"
                  >
                    {isSubmitted ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Submitted
                      </>
                    ) : allAnswered ? (
                      <>
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Save & Submit
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save Progress
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1 || isSubmitted}
                    className={cn(
                      "text-xs py-1.5 h-auto",
                      isSubmitted
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    )}
                    size="sm"
                  >
                    Next
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Overall Progress Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card variant="elevated" className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-brand-teal" />
                      Your Progress
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">
                            Overall Completion
                          </span>
                          <motion.span
                            className="text-3xl"
                            key={progress.percentComplete}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                          >
                            {progress.percentComplete === 0
                              ? "😴"
                              : progress.percentComplete < 20
                              ? "😕"
                              : progress.percentComplete < 40
                              ? "😐"
                              : progress.percentComplete < 60
                              ? "🙂"
                              : progress.percentComplete < 80
                              ? "😊"
                              : progress.percentComplete < 100
                              ? "🤩"
                              : "🎉"}
                          </motion.span>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${progress.percentComplete}%`,
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {progress.percentComplete === 0
                              ? "Just starting..."
                              : progress.percentComplete < 20
                              ? "Getting there..."
                              : progress.percentComplete < 40
                              ? "Making progress..."
                              : progress.percentComplete < 60
                              ? "Great job!"
                              : progress.percentComplete < 80
                              ? "Almost done!"
                              : progress.percentComplete < 100
                              ? "So close!"
                              : "Perfect!"}
                          </span>
                          <span className="text-xs font-semibold text-brand-teal">
                            {answeredCount} / {questions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Quick Navigation - Limited visible area, scrollable for all questions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card variant="elevated" className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Quick Navigation
                    </h3>
                    {/* Show approximately 20 questions visible, then scroll for more */}
                    <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-5 gap-1.5">
                        {questions.map((question, idx) => {
                          const isAnswered = answers[question.id] !== undefined;
                          const isCurrent =
                            idx >= currentPage * questionsPerPage &&
                            idx < (currentPage + 1) * questionsPerPage;

                          return (
                            <button
                              key={question.id}
                              onClick={() => {
                                if (isSubmitted) return;
                                const targetPage = Math.floor(
                                  idx / questionsPerPage
                                );
                                setCurrentPage(targetPage);
                                // Auto-save current page
                                try {
                                  const storageKey = getPageStorageKey();
                                  localStorage.setItem(
                                    storageKey,
                                    targetPage.toString()
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error saving page to localStorage:",
                                    error
                                  );
                                }
                              }}
                              disabled={isSubmitted}
                              className={cn(
                                "w-full h-10 rounded border-2 transition-all flex items-center justify-center text-xs font-medium",
                                isSubmitted
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer",
                                isAnswered
                                  ? "border-green-500 bg-green-500 text-white"
                                  : isCurrent
                                  ? "border-brand-teal text-brand-teal bg-white"
                                  : "border-gray-300 text-gray-700 bg-white"
                              )}
                              title={`Question ${
                                idx + 1
                              }: ${question.text.slice(0, 30)}...`}
                            >
                              <span className="font-semibold">{idx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Completion Status */}
                {allAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-green-900">
                          All Questions Answered!
                        </p>
                        <p className="text-xs text-green-700">
                          Ready to submit your assessment
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewReport={handleViewReport}
      />
    </div>
  );
};

export default AssessmentQuestions;
