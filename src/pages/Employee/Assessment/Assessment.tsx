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
import { Check, Clock, Lock, PlayCircle, Target, HelpCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/common";
import { BACKGROUND_COLORS } from "@/components/assessmentDashboard";

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
      <div className="relative">
        <AnimatedBackground colors={[...BACKGROUND_COLORS]} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 mb-6">
              <div className="text-left">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mb-3 inline-flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-teal via-brand-navy to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/50">
                      <PlayCircle className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white"
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-gray-800 ring-1 ring-white/60 backdrop-blur-sm">
                    10–15 minutes • Auto-saved
                  </span>
                </motion.div>

                <h1 className="text-2xl md:text-4xl font-extrabold leading-[1.12] tracking-tight">
                  <span className="bg-linear-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent">
                    Organizational Health Assessment
                  </span>
                </h1>

                <p className="mt-2.5 text-sm md:text-base text-gray-700 leading-relaxed">
                  A quick, structured assessment that turns your responses into a
                  clear stage view and practical next steps.
                </p>

                <div className="mt-3.5 grid gap-2 text-sm text-gray-800">
                  {[
                    "Stage distribution across the four emotional stages",
                    "Sub-stage breakdown to pinpoint what’s driving it",
                    "Action-oriented insights tailored to your results",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 text-brand-teal font-black">✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  {isAssessmentSubmitted ? (
                    <Button
                      disabled
                      size="lg"
                      className="px-10 py-5 text-base bg-green-500 text-white cursor-not-allowed shadow-lg opacity-90"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Test Submitted
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="px-9 py-4 text-base bg-linear-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      {hasExistingAnswers ? "Continue Assessment" : "Start Assessment"}
                    </Button>
                  )}
                </div>

                {isAssessmentSubmitted ? (
                  <p className="mt-3 text-sm text-green-700 font-medium">
                    Your assessment has been submitted. No further edits are allowed.
                  </p>
                ) : hasExistingAnswers ? (
                  <p className="mt-3 text-sm text-brand-teal font-medium">
                    Your previous progress has been saved.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">
                    Your progress is saved automatically — you can continue anytime.
                  </p>
                )}
              </div>

              {/* Right side preview card */}
              <div className="rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-sm overflow-hidden">
                <div className="relative p-4">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-brand-teal/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-brand-navy/15 blur-3xl" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">
                        Results preview
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        Your stage distribution, sub-stages, and recommended actions
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-500">Preview</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="text-[11px] font-bold text-gray-500">
                        Stage distribution
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-teal" />
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-navy" />
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full w-2/3 bg-linear-to-r from-brand-teal to-brand-navy" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="text-[11px] font-bold text-gray-500">
                        Sub-stages
                      </div>
                      <div className="mt-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full bg-brand-teal/60"
                                style={{ width: `${25 + i * 15}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-linear-to-r from-brand-teal/10 via-brand-navy/10 to-purple-50 border border-brand-teal/20 p-3">
                    <div className="text-xs font-bold text-gray-900">
                      How it works
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                      {[
                        { t: "Answer", i: "✍️" },
                        { t: "Saved", i: "💾" },
                        { t: "Review", i: "📋" },
                        { t: "Results", i: "📊" },
                      ].map((s) => (
                        <div
                          key={s.t}
                          className="rounded-lg bg-white/70 ring-1 ring-white/60 py-2"
                        >
                          <div className="text-base">{s.i}</div>
                          <div className="text-[10px] font-bold text-gray-700">
                            {s.t}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-blue-50/50 via-transparent to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    25
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-900">
                    Questions
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Quick, structured assessment
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-blue-700" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-purple-50/50 via-transparent to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    10–15
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-900">
                    Minutes
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Complete at your own pace
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-purple-700" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-emerald-50/50 via-transparent to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    4
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-900">Stages</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Covers all core stages
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-emerald-700" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-amber-50/50 via-transparent to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    Private
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-900">
                    Your responses
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Saved locally & securely
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-amber-700" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 ring-1 ring-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-indigo-700">📊</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-1">
                    What you’ll get
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Clear outputs you can use immediately.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-brand-teal font-black">✓</span>
                      Your primary stage and distribution
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-teal font-black">✓</span>
                      Sub-stage breakdown (deeper clarity)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-teal font-black">✓</span>
                      Personalized insights and recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-teal font-black">✓</span>
                      Suggested actions tailored to your stage
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-50 to-pink-50 ring-1 ring-rose-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-rose-700">💡</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-1">
                    How to answer
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    For accurate results, use your real experience.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-brand-navy font-black">•</span>
                      There are no wrong answers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-navy font-black">•</span>
                      You can review and edit before submitting
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-navy font-black">•</span>
                      Progress is auto-saved
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-navy font-black">•</span>
                      You can jump to specific questions anytime
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
            className="mb-8 p-6 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Assessment flow
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Simple steps — you can pause anytime.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500">
                Step-by-step
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Answer questions",
                  icon: "✍️",
                  desc: "Fast and simple",
                },
                {
                  step: "2",
                  title: "Auto-save",
                  icon: "💾",
                  desc: "Continue anytime",
                },
                {
                  step: "3",
                  title: "Review",
                  icon: "📋",
                  desc: "Edit before submit",
                },
                {
                  step: "4",
                  title: "Get results",
                  icon: "📊",
                  desc: "Insights & actions",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-gray-500">
                      Step {item.step}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-teal/15 to-brand-navy/15 flex items-center justify-center ring-1 ring-brand-teal/15">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-gray-900">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA is now part of the hero for clearer conversion */}
        </motion.div>
        </div>
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
    <div className="relative">
      <AnimatedBackground colors={[...BACKGROUND_COLORS]} />
      <div className="relative z-10 space-y-6 px-4 sm:px-6">
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
    </div>
  );
};

export default Assessment;
