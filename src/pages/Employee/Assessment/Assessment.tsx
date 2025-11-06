/**
 * Assessment Page
 * Complete assessment flow with gamification
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../../../context/AssessmentContext";
import { useUser } from "../../../context/UserContext";
import { Button } from "../../../components/ui";
import QuestionCard from "../../../components/assessment/QuestionCard";
import AssessmentProgress from "../../../components/assessment/AssessmentProgress";
import EnergyBreak from "../../../components/assessment/EnergyBreak";
import AssessmentResults from "../../../components/assessment/AssessmentResults";
import CelebrationConfetti from "../../../components/assessment/CelebrationConfetti";
import { PlayCircle, Check } from "lucide-react";

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
    answers,
  } = useAssessment();

  // Wrapper for backward compatibility with QuestionCard
  const handleAnswer = (optionIndex: number) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, optionIndex);
    }
  };

  const [showEnergyBreak, setShowEnergyBreak] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Check if user has existing saved answers
  const hasExistingAnswers = useMemo(() => {
    if (!user) return false;

    try {
      // Use user-specific storage key
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const storageKey = `chaturvima_assessment_answers_${emailKey}`;
      const savedAnswers = localStorage.getItem(storageKey);
      return savedAnswers && Object.keys(JSON.parse(savedAnswers)).length > 0;
    } catch {
      return Object.keys(answers).length > 0;
    }
  }, [answers, user]);

  // Check if assessment is already submitted
  const isAssessmentSubmitted = useMemo(() => {
    if (!user) return isComplete;

    try {
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const submissionKey = `chaturvima_assessment_submitted_${emailKey}`;
      const savedSubmissionStatus = localStorage.getItem(submissionKey);
      return savedSubmissionStatus === "true" || isComplete;
    } catch {
      return isComplete;
    }
  }, [user, isComplete]);

  // Check if we should show energy break (every 5 questions, but not at the end)
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
      setTimeout(() => setShowConfetti(false), 100); // Reset for next milestone
    }
  }, [progress.percentComplete]);

  const handleStart = () => {
    // Prevent starting if already submitted
    if (isAssessmentSubmitted) return;

    // Check if there are saved answers
    if (!user) {
      startAssessment();
      navigate("/assessment/questions");
      return;
    }

    try {
      // Use user-specific storage key
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const storageKey = `chaturvima_assessment_answers_${emailKey}`;
      const savedAnswers = localStorage.getItem(storageKey);
      const hasExistingAnswers =
        savedAnswers && Object.keys(JSON.parse(savedAnswers)).length > 0;

      if (!hasExistingAnswers) {
        // No saved answers - start fresh assessment
        startAssessment();
      }
      // If has existing answers, don't call startAssessment() to preserve them
      navigate("/assessment/questions");
    } catch {
      // If error parsing, start fresh
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

  // If assessment is submitted, always show welcome screen with disabled button
  // Not started state (or submitted state - show welcome screen with disabled button)
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
                <p className="text-4xl font-bold text-blue-600">25</p>
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
                <p className="text-4xl font-bold text-purple-600">10-15</p>
                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-900">Minutes</p>
              <p className="text-xs text-purple-700 mt-1">At your own pace</p>
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
                  title: "Complete 25 Questions",
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
                  title: "Review Your Answers",
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

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            {isAssessmentSubmitted ? (
              <>
                <Button
                  disabled
                  size="lg"
                  className="px-12 py-6 text-lg bg-green-500 text-white cursor-not-allowed shadow-lg opacity-90"
                >
                  <Check className="mr-2 h-6 w-6" />
                  Test Submitted
                </Button>
                <p className="mt-4 text-sm text-green-600 font-medium">
                  Your assessment has been successfully submitted. No further
                  edits are allowed.
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
                    Estimated completion time: 10-15 minutes • Your responses
                    are automatically saved!
                  </p>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // If assessment is submitted, show welcome screen with disabled button (not results)
  // Assessment complete state - only show results if not submitted
  if (isComplete && result && !isAssessmentSubmitted) {
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
