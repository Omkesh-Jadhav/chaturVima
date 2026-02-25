/**
 * Assessment Page
 * Complete assessment flow with gamification
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../../../context/AssessmentContext";
import { useUser } from "../../../context/UserContext";
import { Button, Textarea } from "../../../components/ui";
import QuestionCard from "../../../components/assessment/QuestionCard";
import AssessmentProgress from "../../../components/assessment/AssessmentProgress";
import EnergyBreak from "../../../components/assessment/EnergyBreak";
import AssessmentResults from "../../../components/assessment/AssessmentResults";
import CelebrationConfetti from "../../../components/assessment/CelebrationConfetti";
import { PlayCircle, Check, AlertCircle, X, Send } from "lucide-react";
import {
  getEmployeeAssessments,
  getQuestionsBySubmission,
  type EmployeeAssessment,
} from "../../../api/api-functions/assessment";

const Assessment = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    progress,
    currentQuestion,
    isComplete,
    result,
    startAssessment,
    answerQuestion,
    goToPreviousQuestion,
    resetAssessment,
  } = useAssessment();

  const handleAnswer = (optionIndex: number) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, optionIndex);
    }
  };

  const [showEnergyBreak, setShowEnergyBreak] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);
  const [hasExistingAnswers, setHasExistingAnswers] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isOverdue, setIsOverdue] = useState(false);
  const [overdueCycleNames, setOverdueCycleNames] = useState<string[]>([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);

  // Helper: Extract cycle ID from submission name (e.g., "2D-0310" from "SUB-ASSESSMENT-HR-EMP-00039-2D-0310-Self-0311")
  const getCycleId = (submissionName: string): string => {
    const parts = submissionName.split('-');
    if (parts.length >= 7) {
      return `${parts[5]}-${parts[6]}`; // dimension-cycleNumber
    }
    return '';
  };

  // Helper: Get latest cycle assessments
  const getLatestCycleAssessments = (assessments: EmployeeAssessment[]): EmployeeAssessment[] => {
    // Group by cycle
    const byCycle = new Map<string, EmployeeAssessment[]>();
    assessments.forEach((a) => {
      const cycleId = getCycleId(a.submission_name);
      if (cycleId) {
        if (!byCycle.has(cycleId)) byCycle.set(cycleId, []);
        byCycle.get(cycleId)!.push(a);
      }
    });

    // Find latest cycle (highest number)
    let latestCycle = '';
    let maxNum = -1;
    byCycle.forEach((_, cycleId) => {
      const num = parseInt(cycleId.split('-')[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
        latestCycle = cycleId;
      }
    });

    return latestCycle ? (byCycle.get(latestCycle) || assessments) : assessments;
  };

  // Check button state - runs once on mount
  useEffect(() => {
    const checkButtonState = async () => {
      if (!user?.employee_id && !user?.user) {
        setIsChecking(false);
        return;
      }

      try {
        const userId = user.employee_id || user.user;
        const { overall, assessments } = await getEmployeeAssessments(userId);

        setTotalQuestionsCount(overall?.total_questions ?? 0);

        if (assessments.length === 0) {
          setIsAssessmentSubmitted(false);
          setHasExistingAnswers(false);
          setIsOverdue(false);
          setOverdueCycleNames([]);
          setIsChecking(false);
          return;
        }

        // Check if any assessment is Overdue (end date passed) and collect cycle names
        const overdueList = assessments.filter((a) => a.status === "Overdue");
        const hasOverdue = overdueList.length > 0;
        setIsOverdue(hasOverdue);
        setOverdueCycleNames(
          hasOverdue
            ? [...new Set(overdueList.map((a) => a.cycle_name).filter((n): n is string => Boolean(n)))]
            : []
        );

        // Get latest cycle assessments (this is the current/active cycle)
        const latestAssessments = getLatestCycleAssessments(assessments);

        // Get the latest cycle ID
        const latestCycleId = latestAssessments.length > 0
          ? getCycleId(latestAssessments[0].submission_name)
          : '';

        // Check statuses of latest cycle
        const allStatusCompleted = latestAssessments.every(a => a.status === "Completed");
        const hasDraft = latestAssessments.some(a => a.status === "Draft");
        const hasInProgress = latestAssessments.some(a => a.status === "In Progress");

        // Verify if all questions are actually answered in latest cycle
        let allQuestionsAnswered = true;
        let hasAnyAnswers = false;

        for (const assessment of latestAssessments) {
          try {
            const { answers: answersMap, questions } = await getQuestionsBySubmission(assessment.submission_name);
            const answeredCount = Object.keys(answersMap || {}).length;
            const totalQuestions = questions?.length || 0;

            // Only mark as hasAnyAnswers if we have actual answers with ratings
            // answersMap only contains answers with valid ratings (from getQuestionsBySubmission)
            if (answeredCount > 0 && answersMap) {
              // Double-check that answersMap actually has values (not just empty object)
              const hasValidAnswers = Object.values(answersMap).some(rating => rating !== undefined && rating !== null);
              if (hasValidAnswers) {
                hasAnyAnswers = true;
              }
            }

            // Check if all questions are answered for this assessment
            if (totalQuestions > 0 && answeredCount < totalQuestions) {
              allQuestionsAnswered = false;
            }
          } catch {
            allQuestionsAnswered = false;
          }
        }

        // Check if THIS specific cycle was submitted (via final confirmation modal)
        const cycleSubmissionKey = `chaturvima_submitted_cycle_${latestCycleId}_${user?.email?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'anonymous'}`;
        const isThisCycleSubmitted = typeof window !== "undefined"
          ? localStorage.getItem(cycleSubmissionKey) === "true"
          : false;

        // Check if THIS specific cycle has been started (at least one answer chosen)
        // This flag is set from the questions page as soon as the user answers any question
        const cycleStartedKey = `chaturvima_started_cycle_${latestCycleId}_${user?.email?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'anonymous'}`;
        const isThisCycleStarted = typeof window !== "undefined"
          ? localStorage.getItem(cycleStartedKey) === "true"
          : false;

        // Determine if latest cycle is fully submitted
        const isLatestCycleFullySubmitted =
          allStatusCompleted &&
          allQuestionsAnswered &&
          !hasDraft &&
          !hasInProgress &&
          isThisCycleSubmitted;

        // Determine button state based on assessment status
        // Rule 1: Latest cycle is fully submitted → "Assessment Submitted"
        if (isLatestCycleFullySubmitted) {
          setIsAssessmentSubmitted(true);
          setHasExistingAnswers(false);
        }
        // Rule 2: Has actual answers (verified from API) OR user has started this cycle → "Continue Assessment"
        // isThisCycleStarted is a fast client-side flag set when at least 1 answer is given,
        // even if the answers are not yet saved to the server
        else if (hasAnyAnswers || isThisCycleStarted) {
          setHasExistingAnswers(true);
          setIsAssessmentSubmitted(false);
        }
        // Rule 3: Latest cycle is complete but not confirmed via modal → "Continue Assessment"
        // (All questions answered but modal not confirmed)
        else if ((allStatusCompleted || allQuestionsAnswered) && !hasDraft && !hasInProgress) {
          setIsAssessmentSubmitted(false);
          setHasExistingAnswers(true);
        }
        // Rule 4: No answers (even if status is Draft/In Progress) → "Start Assessment"
        // For new cycles, even if status is Draft/In Progress, show "Start Assessment" if no answers
        else {
          setHasExistingAnswers(false);
          setIsAssessmentSubmitted(false);
        }
      } catch {
        setIsAssessmentSubmitted(false);
        setHasExistingAnswers(false);
        setIsOverdue(false);
        setOverdueCycleNames([]);
      } finally {
        setIsChecking(false);
      }
    };

    checkButtonState();
  }, [user]);

  // Check if we should show energy break
  useEffect(() => {
    if (
      progress.currentQuestionIndex > 0 &&
      progress.currentQuestionIndex % 5 === 0 &&
      progress.currentQuestionIndex < progress.totalQuestions
    ) {
      setShowEnergyBreak(true);
    }
  }, [progress.currentQuestionIndex, progress.totalQuestions]);

  // Trigger confetti at milestones
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    if (milestones.includes(progress.percentComplete)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  }, [progress.percentComplete]);

  const handleStart = () => {
    if (isAssessmentSubmitted) return;

    if (!user) {
      startAssessment();
      navigate("/assessment/questions");
      return;
    }

    try {
      const emailKey = user.user.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const storageKey = `chaturvima_assessment_answers_${emailKey}`;
      const savedAnswers = localStorage.getItem(storageKey);
      const hasExistingAnswers =
        savedAnswers && Object.keys(JSON.parse(savedAnswers)).length > 0;

      if (!hasExistingAnswers) {
        startAssessment();
      }
      navigate("/assessment/questions");
    } catch {
      startAssessment();
      navigate("/assessment/questions");
    }
  };

  const handleContinueFromBreak = () => {
    setShowEnergyBreak(false);
  };

  const handleRetake = () => {
    resetAssessment();
    setHasStarted(false);
    setShowEnergyBreak(false);
  };

  // Welcome screen (not started or submitted)
  if (isAssessmentSubmitted || (!hasStarted && !isComplete)) {
    return (
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-teal via-brand-navy to-purple-600 flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-20 h-20 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              <span
                className="inline-block bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent"
                style={{ paddingBottom: "0.15em", lineHeight: "1.1" }}
              >
                Organizational Health Assessment
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-2 max-w-3xl mx-auto leading-relaxed">
              Evaluate your organizational health across four key stages of
              engagement and discover your current position in the workplace
              journey
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Built on the ChaturVima framework - a validated model for
              understanding employee experience, organizational alignment, and
              workplace satisfaction
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-4xl font-bold text-blue-600">
                  {totalQuestionsCount > 0 ? totalQuestionsCount : "—"}
                </p>
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
              </div>
              <p className="text-sm font-medium text-blue-900">Questions</p>
              <p className="text-xs text-blue-700 mt-1">
                Multi-dimensional evaluation
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-4xl font-bold text-purple-600">No Limit</p>
                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-900">Completion Time</p>
              <p className="text-xs text-purple-700 mt-1">Work at your own pace</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-4xl font-bold text-green-600">4</p>
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <p className="text-sm font-medium text-green-900">Stages</p>
              <p className="text-xs text-green-700 mt-1">
                Comprehensive evaluation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-4xl font-bold text-amber-600">100%</p>
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
              <p className="text-sm font-medium text-amber-900">Private</p>
              <p className="text-xs text-amber-700 mt-1">Your data secured</p>
            </motion.div>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What You'll Discover
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Your primary organizational stage (Honeymoon,
                      Self-Reflection, Soul-Searching, or Steady-State)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Stage-by-stage breakdown showing your responses across all
                      four dimensions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Insights into engagement levels, trust, alignment, and
                      satisfaction
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Actionable recommendations based on your assessment
                      results
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Tips for Best Results
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      Answer based on your genuine experience - there are no
                      wrong answers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      You can review and edit your answers anytime before
                      submitting
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      Your progress is automatically saved - return anytime to
                      continue
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      Use the quick navigation sidebar to jump to specific
                      questions
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10 p-6 bg-gradient-to-r from-brand-teal/10 via-brand-navy/10 to-purple-50 rounded-xl border border-brand-teal/20"
          >
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              Assessment Process
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Complete All Questions",
                  icon: "✍️",
                  desc: "Multi-stage evaluation",
                },
                {
                  step: "2",
                  title: "Auto-saved Progress",
                  icon: "💾",
                  desc: "Never lose your work",
                },
                {
                  step: "3",
                  title: "Submit Your Answers",
                  icon: "📋",
                  desc: "Edit before submitting",
                },
                {
                  step: "4",
                  title: "Get Detailed Results",
                  icon: "📊",
                  desc: "Insights & recommendations",
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-brand-teal flex items-center justify-center mb-2 shadow-sm">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="text-xs font-medium text-brand-teal mb-1">
                    Step {item.step}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-0.5">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Overdue: single card with cycle name and one action */}
          {isOverdue && !isChecking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-8 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6"
            >
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      {overdueCycleNames.length > 0
                        ? overdueCycleNames.join(", ")
                        : "Assessment (overdue)"}
                    </h3>
                    <p className="mt-0.5 text-sm text-amber-800">
                      The deadline has passed. Request a new date from HR if you’d still like to complete this assessment.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setShowRescheduleModal(true);
                    setRescheduleSubmitted(false);
                    setRescheduleMessage("");
                  }}
                  variant="outline"
                  size="md"
                  className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400"
                >
                  Request reschedule
                </Button>
              </div>
            </motion.div>
          )}

          {/* CTA — when overdue, nothing here (card above is the only action) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            {isChecking ? (
              <>
                <Button
                  disabled
                  size="lg"
                  className="px-12 py-6 text-lg bg-gray-400 text-white cursor-not-allowed shadow-lg opacity-90"
                >
                  <PlayCircle className="mr-2 h-6 w-6 animate-spin" />
                  Loading...
                </Button>
                <p className="mt-4 text-sm text-gray-500">
                  Checking your assessment status...
                </p>
              </>
            ) : isOverdue ? null : isAssessmentSubmitted ? (
              <>
                <Button
                  disabled
                  size="lg"
                  className="px-12 py-6 text-lg bg-green-500 text-white cursor-not-allowed shadow-lg opacity-90"
                >
                  <Check className="mr-2 h-6 w-6" />
                  Assessment Submitted
                </Button>
                <p className="mt-4 text-sm text-green-600 font-medium">
                  Your assessment has been successfully submitted. No further
                  actions are allowed.
                </p>
              </>
            ) : (
              <>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="px-12 py-6 text-lg bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <PlayCircle className="mr-2 h-6 w-6" />
                  {hasExistingAnswers
                    ? "Continue Assessment"
                    : "Start Assessment"}
                </Button>
                {hasExistingAnswers ? (
                  <p className="mt-4 text-sm text-brand-teal font-medium">
                    Your previous progress has been saved
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Your responses are automatically saved!
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* Request Reschedule Modal */}
          <AnimatePresence>
            {showRescheduleModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => !rescheduleSubmitted && setShowRescheduleModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    {rescheduleSubmitted ? (
                      <>
                        <div className="flex justify-center mb-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-7 w-7 text-green-600" />
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                          Request sent
                        </h2>
                        <p className="text-sm text-gray-600 text-center">
                          Your request to reschedule this assessment has been sent to HR. They will get back to you regarding the new dates.
                        </p>
                        <div className="mt-6 flex justify-center">
                          <Button
                            type="button"
                            onClick={() => setShowRescheduleModal(false)}
                            variant="gradient"
                            size="md"
                          >
                            Close
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-900">
                            Request reschedule
                          </h2>
                          <button
                            type="button"
                            onClick={() => setShowRescheduleModal(false)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          You can request HR to reschedule this assessment since the end date has passed. Add an optional message below.
                        </p>
                        <Textarea
                          value={rescheduleMessage}
                          onChange={(e) => setRescheduleMessage(e.target.value)}
                          placeholder="e.g. I was on leave during the assessment period..."
                          rows={3}
                          className="mb-4 resize-none"
                        />
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="md"
                            className="flex-1"
                            onClick={() => setShowRescheduleModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="gradient"
                            size="md"
                            className="flex-1 gap-2"
                            disabled={isSubmittingReschedule}
                            onClick={async () => {
                              setIsSubmittingReschedule(true);
                              // TODO: call API to submit reschedule request (employee, message, cycle/submission ref)
                              await new Promise((r) => setTimeout(r, 600));
                              setIsSubmittingReschedule(false);
                              setRescheduleSubmitted(true);
                            }}
                          >
                            {isSubmittingReschedule ? (
                              <>
                                <PlayCircle className="h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Submit request
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Assessment complete state - only show results if not submitted
  // If submitted, show welcome screen with "Assessment Submitted" button instead
  if (isComplete && result && !isAssessmentSubmitted && !isChecking) {
    return <AssessmentResults result={result} onRetake={handleRetake} />;
  }

  // Assessment in progress
  return (
    <div className="space-y-6">
      <CelebrationConfetti trigger={showConfetti} />

      {/* Progress Bar */}
      <AssessmentProgress
        current={progress.currentQuestionIndex}
        total={progress.totalQuestions}
        percentage={progress.percentComplete}
      />

      {/* Question or Energy Break */}
      <AnimatePresence mode="wait">
        {showEnergyBreak ? (
          <EnergyBreak
            key="energy-break"
            questionNumber={progress.currentQuestionIndex}
            onContinue={handleContinueFromBreak}
          />
        ) : currentQuestion ? (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={progress.currentQuestionIndex + 1}
            totalQuestions={progress.totalQuestions}
            onAnswer={handleAnswer}
            onPrevious={goToPreviousQuestion}
            canGoPrevious={progress.currentQuestionIndex > 0}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Assessment;
