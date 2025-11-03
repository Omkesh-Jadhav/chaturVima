/**
 * Assessment Questions Page
 * Multi-question assessment interface with progress sidebar
 * Optimized for 80+ questions with engaging animations
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../context/AssessmentContext";
import { useUser } from "../context/UserContext";
import { Button, Card, CardContent } from "../components/ui";
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
} from "lucide-react";
import { STAGES } from "../data/stages";
import { cn } from "../utils/cn";
import type { StageType } from "../types";

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
  const { progress, questions, answers, answerQuestion, submitAssessment } =
    useAssessment();

  const { user } = useUser();

  // Helper function to get user-specific page storage key
  const getPageStorageKey = useCallback(() => {
    if (!user) return "chaturvima_assessment_page_anonymous";
    const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `chaturvima_assessment_page_${emailKey}`;
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

  const [currentPage, setCurrentPage] = useState(loadSavedPage);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Ensure page position is restored on mount and when user changes
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
    } catch (error) {
      console.error("Error restoring saved page:", error);
    }
  }, [getPageStorageKey, totalPages, currentPage]);

  // Get questions for current page
  const currentPageQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return questions.slice(start, end);
  }, [questions, currentPage, questionsPerPage]);

  // Calculate stage progress
  const stageProgress = useMemo(() => {
    const stageCounts: Record<StageType, { total: number; answered: number }> =
      {
        honeymoon: { total: 0, answered: 0 },
        "self-reflection": { total: 0, answered: 0 },
        "soul-searching": { total: 0, answered: 0 },
        "steady-state": { total: 0, answered: 0 },
      };

    questions.forEach((q) => {
      stageCounts[q.stage].total++;
      if (answers[q.id] !== undefined) {
        stageCounts[q.stage].answered++;
      }
    });

    return Object.entries(stageCounts).map(([stage, data]) => ({
      stage: stage as StageType,
      total: data.total,
      answered: data.answered,
      percentage: Math.round((data.answered / data.total) * 100),
    }));
  }, [questions, answers]);

  const allAnswered = Object.keys(answers).length === questions.length;
  const answeredCount = Object.keys(answers).length;

  // Motivational messages based on progress
  const getMotivationalMessage = () => {
    if (progress.percentComplete < 25) return "You're just getting started!";
    if (progress.percentComplete < 50) return "Halfway there! Keep going!";
    if (progress.percentComplete < 75)
      return "Almost there! You're doing great!";
    if (progress.percentComplete < 100) return "Final stretch! Finish strong!";
    return "Perfect! Ready to submit!";
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    answerQuestion(questionId, optionIndex);
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

  const handleSubmit = () => {
    if (allAnswered) {
      submitAssessment();
      setShowSuccessModal(true);
      // Clear saved state after submission
      try {
        const storageKey = getPageStorageKey();
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  };

  const handleViewReport = () => {
    setShowSuccessModal(false);
    navigate("/assessment-report");
  };

  // Auto-scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: `radial-gradient(circle, ${
                ["#2BC6B4", "#1E3A5F", "#8B5CF6"][i]
              } 0%, transparent 70%)`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 25}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Questions Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -4 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/assessment")}
                className="cursor-pointer mb-4 group"
              >
                <motion.span
                  animate={{ x: [0, -3, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </motion.span>
                Back to Assessment
              </Button>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.h1
                    className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Assessment Questions
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getMotivationalMessage()}
                  </motion.p>
                </div>
                <motion.div
                  className="text-right relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <div className="relative">
                    <motion.div
                      className="text-2xl font-bold text-brand-teal"
                      key={progress.percentComplete}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.4 }}
                    >
                      {progress.percentComplete}%
                    </motion.div>
                    <motion.div
                      className="absolute -inset-2 bg-brand-teal/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Complete</div>
                </motion.div>
              </div>

              {/* Decorative progress indicator line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </motion.div>

            {/* Questions List */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {currentPageQuestions.map((question, idx) => {
                  const questionNumber =
                    currentPage * questionsPerPage + idx + 1;
                  const selectedAnswer = answers[question.id];
                  const stageInfo = STAGES[question.stage];

                  return (
                    <motion.div
                      key={`${question.id}-${currentPage}`}
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
                          {/* Animated border gradient for answered */}
                          {selectedAnswer !== undefined && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, ${stageInfo.color.main}15, transparent)`,
                              }}
                              animate={{
                                background: [
                                  `linear-gradient(135deg, ${stageInfo.color.main}15, transparent)`,
                                  `linear-gradient(225deg, ${stageInfo.color.main}20, transparent)`,
                                  `linear-gradient(135deg, ${stageInfo.color.main}15, transparent)`,
                                ],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                              }}
                            />
                          )}
                          <CardContent className="p-6 relative z-10">
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <motion.div
                                    style={{
                                      backgroundColor: stageInfo.color.light,
                                      color: stageInfo.color.main,
                                    }}
                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {stageInfo.name}
                                  </motion.div>
                                  <span className="text-sm text-gray-500">
                                    Question {questionNumber} of{" "}
                                    {questions.length}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {question.text}
                                </h3>
                                {question.description && (
                                  <p className="text-sm text-gray-600 mt-1">
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
                            <div className="space-y-3 mt-6">
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
                                    whileHover={{
                                      scale: 1.02,
                                      x: 4,
                                      boxShadow: isSelected
                                        ? "0 4px 12px rgba(43, 198, 180, 0.2)"
                                        : "0 4px 12px rgba(0, 0, 0, 0.08)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                      "w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden group/option",
                                      isSelected
                                        ? "border-brand-teal bg-brand-teal/10 shadow-md"
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

                                    {/* Animated background gradient for selected */}
                                    {isSelected && (
                                      <>
                                        <motion.div
                                          className="absolute inset-0 bg-gradient-to-r from-brand-teal/10 via-brand-navy/5 to-brand-teal/10"
                                          initial={{ x: "-100%" }}
                                          animate={{ x: "100%" }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                          }}
                                        />
                                        <motion.div
                                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-teal to-brand-navy"
                                          initial={{ scaleY: 0 }}
                                          animate={{ scaleY: 1 }}
                                          transition={{ duration: 0.3 }}
                                        />
                                      </>
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
                                        {/* Pulsing ring for selected */}
                                        {isSelected && (
                                          <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-brand-teal"
                                            animate={{
                                              scale: [1, 1.5, 1],
                                              opacity: [1, 0, 1],
                                            }}
                                            transition={{
                                              duration: 1.5,
                                              repeat: Infinity,
                                            }}
                                          />
                                        )}
                                        {isSelected && (
                                          <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="w-2 h-2 rounded-full bg-white"
                                          />
                                        )}
                                      </motion.div>
                                      <span
                                        className={cn(
                                          "text-sm font-medium",
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
            <div className="flex items-center justify-between pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              </motion.div>

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
                        setCurrentPage(pageIdx);
                        // Auto-save current page
                        try {
                          const storageKey = getPageStorageKey();
                          localStorage.setItem(storageKey, pageIdx.toString());
                        } catch (error) {
                          console.error(
                            "Error saving page to localStorage:",
                            error
                          );
                        }
                      }}
                      whileHover={{
                        scale: 1.15,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "w-10 h-10 rounded-lg font-medium transition-all cursor-pointer relative",
                        isCurrentPage
                          ? "bg-brand-teal text-white shadow-lg"
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
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {allAnswered && (
                    <motion.div
                      className="absolute -inset-1 bg-brand-teal/30 rounded-lg blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className={cn(
                      "cursor-pointer relative shadow-lg transition-all",
                      allAnswered
                        ? "bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
                        : "bg-gray-300 cursor-not-allowed"
                    )}
                  >
                    {allAnswered ? (
                      <>
                        <motion.span
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                        </motion.span>
                        Submit Assessment
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Answer All Questions
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05, x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="cursor-pointer"
                  >
                    Next
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </motion.span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Overall Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-teal" />
                    Your Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
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
                        <span className="text-sm font-bold text-brand-teal">
                          {answeredCount} / {questions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Stage Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-teal" />
                    Stage Completion
                  </h3>
                  <div className="space-y-4">
                    {stageProgress.map((stageData) => {
                      const stage = STAGES[stageData.stage];
                      return (
                        <div key={stageData.stage}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: stage.color.main }}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {stage.name}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-600">
                              {stageData.answered}/{stageData.total}
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ backgroundColor: stage.color.main }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${stageData.percentage}%`,
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Quick Navigation - Limited visible area, scrollable for all questions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Navigation
                  </h3>
                  {/* Show approximately 20 questions visible, then scroll for more */}
                  <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((question, idx) => {
                        const isAnswered = answers[question.id] !== undefined;
                        const isCurrent =
                          idx >= currentPage * questionsPerPage &&
                          idx < (currentPage + 1) * questionsPerPage;

                        return (
                          <motion.button
                            key={question.id}
                            onClick={() => {
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
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "w-full aspect-square rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center text-xs font-medium",
                              isAnswered
                                ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 shadow-sm"
                                : isCurrent
                                ? "bg-brand-teal/10 border-brand-teal text-brand-teal hover:bg-brand-teal/20 shadow-sm"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                            )}
                            title={`Question ${idx + 1}: ${question.text.slice(
                              0,
                              30
                            )}...`}
                          >
                            {isAnswered ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </motion.button>
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
                  className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200 shadow-lg"
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
