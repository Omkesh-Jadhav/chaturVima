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
  getPaginationButtons,
  getProgressEmoji,
  getProgressMessage,
  filterQuestionsByTypes,
  getCompletionByType,
  areAllTypesComplete,
} from "../../../utils/assessmentUtils";
import { ASSESSMENT_CONFIG, type AssessmentType } from "../../../data/assessmentDashboard";

const AssessmentQuestions = () => {
  const navigate = useNavigate();
  const { questions, answers, answerQuestion, submitAssessment, isComplete } =
    useAssessment();
  const { user } = useUser();

  // Always show all 4 assessment types (assigned by backend)
  const assignedTypes: AssessmentType[] = useMemo(
    () => [
      "Employee Self Assessment",
      "Manager Relationship Assessment",
      "Department Assessment",
      "Company Assessment",
    ],
    []
  );

  const [selectedType, setSelectedType] = useState<AssessmentType>(
    assignedTypes[0] || "Employee Self Assessment"
  );
  const [currentPage, setCurrentPage] = useState(() => loadPage(user?.email));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    () => loadSubmissionStatus(user?.email) || isComplete
  );

  // Filter questions by assessment type
  const questionsByType = useMemo(
    () => filterQuestionsByTypes(questions, assignedTypes),
    [questions, assignedTypes]
  );

  // Get questions for selected type
  const filteredQuestions = useMemo(
    () => questionsByType[selectedType] || [],
    [questionsByType, selectedType]
  );

  const totalPages = Math.ceil(
    filteredQuestions.length / ASSESSMENT_CONFIG.questionsPerPage
  );
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const currentPageQuestions = useMemo(() => {
    const start = currentPage * ASSESSMENT_CONFIG.questionsPerPage;
    const end = start + ASSESSMENT_CONFIG.questionsPerPage;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, currentPage]);

  // Track completion per assessment type
  const completionByType = useMemo(
    () => getCompletionByType(questionsByType, answers),
    [questionsByType, answers]
  );

  // Check if all assigned types are complete
  const allTypesComplete = useMemo(
    () => areAllTypesComplete(assignedTypes, completionByType),
    [assignedTypes, completionByType]
  );

  const answeredCount = filteredQuestions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

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

      const currentQuestionIndex = filteredQuestions.findIndex(
        (q) => q.id === questionId
      );
      if (
        currentQuestionIndex === -1 ||
        currentQuestionIndex >= filteredQuestions.length - 1
      )
        return;

      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextPage = Math.floor(
        nextQuestionIndex / ASSESSMENT_CONFIG.questionsPerPage
      );
      const nextQuestion = filteredQuestions[nextQuestionIndex];

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
      filteredQuestions,
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

    // Check if current tab is complete and auto-advance to next incomplete tab
    const currentCompletion = completionByType[selectedType];
    if (currentCompletion?.isComplete) {
      // Find next incomplete tab
      const currentIndex = assignedTypes.findIndex(
        (type) => type === selectedType
      );
      const nextIncompleteTab = assignedTypes
        .slice(currentIndex + 1)
        .find((type) => {
          const completion = completionByType[type];
          return completion && !completion.isComplete && completion.total > 0;
        });

      if (nextIncompleteTab) {
        setTimeout(() => {
          setSelectedType(nextIncompleteTab);
          setCurrentPage(0);
          savePage(0, user?.email);
          questionsContainerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 500); // Small delay to show the save toast
      }
    }
  }, [
    currentPage,
    answers,
    user?.email,
    selectedType,
    completionByType,
    assignedTypes,
  ]);

  const handleSubmit = useCallback(() => {
    if (allTypesComplete && isSaved && !isSubmitted) {
      setShowConfirmationModal(true);
    }
  }, [allTypesComplete, isSaved, isSubmitted]);

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
    setCurrentPage(0);
    questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedType]);

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
              <div className="flex-shrink-0 space-y-2 mb-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/assessment")}
                  className="cursor-pointer text-xs py-1 h-auto"
                  size="sm"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Assessment
                </Button>

                {/* Header */}
                <div className="space-y-2">
                  <motion.h1
                    className="text-xl md:text-2xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Q4 2024 Assessment Cycle
                  </motion.h1>

                  {/* Assessment Type Tabs */}
                  <div className="flex gap-1 overflow-x-auto custom-scrollbar-horizontal">
                    {assignedTypes.map((type) => {
                      const completion = completionByType[type];
                      const isSelected = selectedType === type;
                      const isComplete = completion?.isComplete ?? false;

                      return (
                        <button
                          key={type}
                          onClick={() => !isSubmitted && setSelectedType(type)}
                          disabled={isSubmitted}
                          className={cn(
                            "relative px-2.5 py-1.5 text-xs font-medium transition-all rounded-md whitespace-nowrap shrink-0",
                            isSubmitted
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer",
                            isComplete
                              ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                              : isSelected
                              ? "bg-brand-teal text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                          title={type}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">
                              {type}
                            </span>
                            {isComplete && (
                              <Check
                                className={cn(
                                  "h-3 w-3 shrink-0",
                                  isSelected || isComplete
                                    ? "text-white"
                                    : "text-green-600"
                                )}
                              />
                            )}
                            {completion && completion.total > 0 && (
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                                  isSelected || isComplete
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 text-gray-600"
                                )}
                              >
                                {completion.answered}/{completion.total}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                ref={questionsContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-3"
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
                          <CardContent className="p-4 relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <span className="text-xs text-gray-500">
                                  Question {questionNumber} of{" "}
                                  {filteredQuestions.length}
                                </span>
                                <h3 className="text-sm font-medium text-gray-900 mt-0.5">
                                  {question.text}
                                </h3>
                                {question.description && (
                                  <p className="text-xs text-gray-600 mt-0.5">
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

                            <div className="space-y-2 mt-3">
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
                                      "w-full text-left p-2.5 rounded-lg border-2 transition-all relative overflow-hidden group/option text-sm",
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
              <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
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
                          disabled={!allTypesComplete}
                          className={cn(
                            "text-xs py-1.5 h-auto",
                            allTypesComplete
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
              <div className="sticky top-4 space-y-3">
                <Card variant="elevated" className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-teal" />
                    Your Progress
                  </h3>
                  <div className="space-y-2.5">
                    {/* Current Type Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          {selectedType}
                        </span>
                        <motion.span
                          className="text-3xl"
                          key={`${selectedType}-${answeredCount}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          {getProgressEmoji(
                            filteredQuestions.length > 0
                              ? Math.round(
                                  (answeredCount / filteredQuestions.length) *
                                    100
                                )
                              : 0
                          )}
                        </motion.span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              filteredQuestions.length > 0
                                ? (answeredCount / filteredQuestions.length) *
                                  100
                                : 0
                            }%`,
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {getProgressMessage(
                            filteredQuestions.length > 0
                              ? Math.round(
                                  (answeredCount / filteredQuestions.length) *
                                    100
                                )
                              : 0
                          )}
                        </span>
                        <span className="text-xs font-semibold text-brand-teal">
                          {answeredCount} / {filteredQuestions.length}
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Across All Types */}
                    {assignedTypes.length > 1 && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-700">
                            Overall Completion
                          </span>
                          <span className="text-xs font-semibold text-brand-teal">
                            {
                              assignedTypes.filter(
                                (type) => completionByType[type]?.isComplete
                              ).length
                            }{" "}
                            / {assignedTypes.length} Types
                          </span>
                        </div>
                        <div className="space-y-2">
                          {assignedTypes.map((type) => {
                            const completion = completionByType[type];
                            if (!completion || completion.total === 0)
                              return null;
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-600 truncate">
                                    {type.split(" ")[0]}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-700">
                                    {completion.answered}/{completion.total}
                                  </span>
                                </div>
                                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`absolute inset-y-0 left-0 rounded-full ${
                                      completion.isComplete
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${
                                        (completion.answered /
                                          completion.total) *
                                        100
                                      }%`,
                                    }}
                                    transition={{ duration: 0.4 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card variant="elevated" className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Quick Navigation
                  </h3>
                  <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-1.5">
                      {filteredQuestions.map((question, idx) => {
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

                {allTypesComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-3 border border-green-200"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="h-5 w-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">
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
        answeredCount={Object.keys(answers).length}
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
