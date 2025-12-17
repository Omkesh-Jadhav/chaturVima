/**
 * Assessment Questions Page
 * Optimized multi-question assessment interface with progress sidebar
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
  Target,
  ArrowLeft,
  Save,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import {
  ConfirmationModal,
  SuccessModal,
} from "../../../components/assessment";
import {
  savePage,
  loadPage,
  saveAnswers,
  saveSubmissionStatus,
  loadSubmissionStatus,
  clearPageStorage,
} from "../../../utils/assessmentStorage";
import {
  getPaginationButtons,
  getProgressEmoji,
  getProgressMessage,
} from "../../../utils/paginationUtils";
import { ASSESSMENT_CONFIG } from "../../../data/assessmentConstants";

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

  const [currentPage, setCurrentPage] = useState(() => loadPage(user?.email));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    () => loadSubmissionStatus(user?.email) || isComplete
  );

  const totalPages = Math.ceil(
    questions.length / ASSESSMENT_CONFIG.questionsPerPage
  );
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const currentPageQuestions = useMemo(() => {
    const start = currentPage * ASSESSMENT_CONFIG.questionsPerPage;
    const end = start + ASSESSMENT_CONFIG.questionsPerPage;
    return questions.slice(start, end);
  }, [questions, currentPage]);

  const allAnswered = Object.keys(answers).length === questions.length;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    const savedPage = loadPage(user?.email);
    if (savedPage >= 0 && savedPage < totalPages && savedPage !== currentPage) {
      setCurrentPage(savedPage);
    }
    if (loadSubmissionStatus(user?.email) || isComplete) {
      setIsSubmitted(true);
    }
  }, [user?.email, totalPages, currentPage, isComplete]);

  const scrollToQuestion = useCallback(
    (questionId: string, offset: number = ASSESSMENT_CONFIG.scrollOffset) => {
      setTimeout(() => {
        const element = questionRefs.current[questionId];
        if (element && questionsContainerRef.current) {
          questionsContainerRef.current.scrollTo({
            top: element.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }, ASSESSMENT_CONFIG.autoAdvanceDelay);
    },
    []
  );

  const handleAnswerChange = useCallback(
    (questionId: string, optionIndex: number) => {
      if (isSubmitted) return;

      answerQuestion(questionId, optionIndex);
      if (isSaved) {
        setIsSaved(false);
        setShowSavedToast(false);
      }

      const currentQuestionIndex = questions.findIndex(
        (q) => q.id === questionId
      );
      if (
        currentQuestionIndex === -1 ||
        currentQuestionIndex >= questions.length - 1
      )
        return;

      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextPage = Math.floor(
        nextQuestionIndex / ASSESSMENT_CONFIG.questionsPerPage
      );
      const nextQuestion = questions[nextQuestionIndex];

      if (nextPage === currentPage) {
        scrollToQuestion(nextQuestion.id);
      } else if (nextPage < totalPages) {
        setTimeout(() => {
          setCurrentPage(nextPage);
          savePage(nextPage, user?.email);
          questionsContainerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, ASSESSMENT_CONFIG.autoAdvanceDelay);
      }
    },
    [
      isSubmitted,
      answerQuestion,
      isSaved,
      questions,
      currentPage,
      totalPages,
      user?.email,
      scrollToQuestion,
    ]
  );

  const changePage = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      savePage(newPage, user?.email);
    },
    [user?.email]
  );

  const handleSave = useCallback(() => {
    savePage(currentPage, user?.email);
    saveAnswers(answers, user?.email);
    setIsSaved(true);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), ASSESSMENT_CONFIG.toastDuration);
  }, [currentPage, answers, user?.email]);

  const handleSubmit = useCallback(() => {
    if (allAnswered && isSaved && !isSubmitted) {
      setShowConfirmationModal(true);
    }
  }, [allAnswered, isSaved, isSubmitted]);

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirmationModal(false);
    submitAssessment();
    setIsSubmitted(true);
    setShowSuccessModal(true);
    saveSubmissionStatus(true, user?.email);
    clearPageStorage(user?.email);
  }, [submitAssessment, user?.email]);

  const handleViewReport = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/assessment-report");
  }, [navigate]);

  useEffect(() => {
    questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative z-10 h-full w-full overflow-hidden px-4 py-3 lg:px-6 lg:py-8">
        <div className="h-full overflow-hidden flex flex-col">
          <div className="grid lg:grid-cols-4 gap-4 h-full min-h-0 flex-1 overflow-hidden">
            {/* Main Questions Area */}
            <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="flex-shrink-0 space-y-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/assessment")}
                  className="cursor-pointer text-xs py-1.5 h-auto"
                  size="sm"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Assessment
                </Button>
                <motion.h1
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Assessment Questions
                </motion.h1>
              </div>

              <div
                ref={questionsContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-4"
              >
                <AnimatePresence mode="wait">
                  {currentPageQuestions.map((question, idx) => {
                    const questionNumber =
                      currentPage * ASSESSMENT_CONFIG.questionsPerPage +
                      idx +
                      1;
                    const selectedAnswer = answers[question.id];

                    return (
                      <motion.div
                        key={`${question.id}-${currentPage}`}
                        ref={(el) => {
                          questionRefs.current[question.id] = el;
                        }}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          delay: idx * 0.08,
                          type: "spring",
                          stiffness: 120,
                          damping: 15,
                        }}
                        className="relative"
                      >
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
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <span className="text-xs text-gray-500">
                                  Question {questionNumber} of{" "}
                                  {questions.length}
                                </span>
                                <h3 className="text-base font-medium text-gray-900 mt-1">
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
                                      "w-full text-left p-3 rounded-lg border-2 transition-all relative overflow-hidden group/option text-sm",
                                      isSubmitted
                                        ? "cursor-not-allowed opacity-60"
                                        : "cursor-pointer",
                                      isSelected
                                        ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                                        : "border-gray-200 bg-white hover:border-brand-teal/50 hover:bg-gray-50"
                                    )}
                                  >
                                    {isSelected && (
                                      <>
                                        <motion.div
                                          className="absolute inset-0 rounded-lg bg-brand-teal/20"
                                          initial={{ scale: 0, opacity: 0.5 }}
                                          animate={{
                                            scale: [0, 2],
                                            opacity: [0.5, 0],
                                          }}
                                          transition={{ duration: 0.6 }}
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
                                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
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
                                            initial={{ scale: 0, rotate: -180 }}
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
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <Button
                  variant="outline"
                  onClick={() => changePage(currentPage - 1)}
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
                  {getPaginationButtons(currentPage, totalPages).map(
                    (pageIdx, idx) => {
                      if (pageIdx === "ellipsis") {
                        return (
                          <motion.span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-gray-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ...
                          </motion.span>
                        );
                      }
                      const isCurrentPage = currentPage === pageIdx;
                      return (
                        <motion.button
                          key={pageIdx}
                          onClick={() => !isSubmitted && changePage(pageIdx)}
                          disabled={isSubmitted}
                          whileHover={isSubmitted ? {} : { scale: 1.15, y: -2 }}
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
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <span className="relative z-10">{pageIdx + 1}</span>
                        </motion.button>
                      );
                    }
                  )}
                </div>

                {currentPage === totalPages - 1 ? (
                  <div className="relative flex items-center gap-2">
                    {isSubmitted ? (
                      <Button
                        disabled
                        className="bg-green-500 text-white cursor-not-allowed text-xs py-1.5 h-auto"
                        size="sm"
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Submitted
                      </Button>
                    ) : !isSaved ? (
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-brand-teal to-brand-navy text-white cursor-pointer text-xs py-1.5 h-auto"
                        size="sm"
                      >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save Progress
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSubmit}
                          disabled={!allAnswered}
                          className={cn(
                            "text-xs py-1.5 h-auto",
                            allAnswered
                              ? "bg-gradient-to-r from-brand-teal to-brand-navy text-white cursor-pointer"
                              : "bg-gray-200 border border-gray-300 text-gray-700 cursor-not-allowed"
                          )}
                          size="sm"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Submit Assessment
                        </Button>
                        <AnimatePresence>
                          {showSavedToast && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold shadow-xl whitespace-nowrap z-50 flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              <span>Saved!</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2">
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-green-500"></div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => changePage(currentPage + 1)}
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
                          {getProgressEmoji(progress.percentComplete)}
                        </motion.span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.percentComplete}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {getProgressMessage(progress.percentComplete)}
                        </span>
                        <span className="text-xs font-semibold text-brand-teal">
                          {answeredCount} / {questions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="elevated" className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quick Navigation
                  </h3>
                  <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-1.5">
                      {questions.map((question, idx) => {
                        const isAnswered = answers[question.id] !== undefined;
                        const isCurrent =
                          idx >=
                            currentPage * ASSESSMENT_CONFIG.questionsPerPage &&
                          idx <
                            (currentPage + 1) *
                              ASSESSMENT_CONFIG.questionsPerPage;

                        return (
                          <button
                            key={question.id}
                            onClick={() => {
                              if (isSubmitted) return;
                              const targetPage = Math.floor(
                                idx / ASSESSMENT_CONFIG.questionsPerPage
                              );
                              changePage(targetPage);
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
                            title={`Question ${idx + 1}: ${question.text.slice(
                              0,
                              30
                            )}...`}
                          >
                            <span className="font-semibold">{idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {allAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
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

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewReport={handleViewReport}
      />
    </div>
  );
};

export default AssessmentQuestions;
