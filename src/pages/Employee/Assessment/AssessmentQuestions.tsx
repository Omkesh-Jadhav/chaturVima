// Assessment Questions Page - Optimized multi-question assessment interface with progress sidebar
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
  loadAnswers,
  clearPageStorage,
  getPaginationButtons,
  getProgressEmoji,
  getProgressMessage,
} from "../../../utils/assessmentUtils";
import { ASSESSMENT_CONFIG } from "../../../data/assessmentDashboard";
import {
  getEmployeeAssessments,
  getQuestionsBySubmission,
  submitAssessmentAnswers,
  type EmployeeAssessment,
} from "../../../api/api-functions/assessment";
import type { Question } from "../../../types";

const QUESTIONNAIRE_DISPLAY_NAMES: Record<string, string> = {
  Self: "Employee Self Assessment",
  SELF: "Employee Self Assessment",
  Boss: "Manager Relationship Assessment",
  BOSS: "Manager Relationship Assessment",
  Department: "Department Assessment",
  DEPT: "Department Assessment",
  "4D": "Department Assessment",
  Company: "Company Assessment",
};

const QUESTIONNAIRE_ORDER: Record<string, number> = {
  Self: 1,
  Boss: 2,
  Department: 3,
  Company: 4,
};

const mapQuestionnaireToDisplayName = (questionnaire: string): string => {
  return QUESTIONNAIRE_DISPLAY_NAMES[questionnaire] || questionnaire;
};

const getUserIdFromStorage = (): string | null => {
  try {
    const storedUser = localStorage.getItem("chaturvima_user");
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    return parsedUser.employee_id || parsedUser.user_id || parsedUser.user || null;
  } catch {
    return null;
  }
};

const organizeAssessments = (assessments: EmployeeAssessment[]) => {
  const assessmentsMap: Record<string, EmployeeAssessment> = {};
  const questionnaireList: string[] = [];

  assessments.forEach((assessment) => {
    const questionnaire = assessment.questionnaire || "Unknown";
    if (!assessmentsMap[questionnaire]) {
      assessmentsMap[questionnaire] = assessment;
      questionnaireList.push(questionnaire);
    }
  });

  questionnaireList.sort((a, b) => {
    const orderA = QUESTIONNAIRE_ORDER[a] || 99;
    const orderB = QUESTIONNAIRE_ORDER[b] || 99;
    return orderA - orderB;
  });

  return { assessmentsMap, questionnaireList };
};

const getQuestionnaireStats = (
  questions: Question[],
  answers: Record<string, number>
) => {
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const total = questions.length;
  return { answered, total, isComplete: total > 0 && answered === total };
};

// Helper functions for page-specific localStorage storage
const getPageStorageKey = (questionnaire: string, page: number, email?: string): string => {
  const baseKey = email ? email.toLowerCase().replace(/[^a-z0-9]/g, "_") : "anonymous";
  return `chaturvima_assessment_page_${questionnaire}_${page}_${baseKey}`;
};

const savePageAnswersToLocalStorage = (
  questionnaire: string,
  page: number,
  pageAnswers: Record<string, number>,
  email?: string
): void => {
  try {
    const key = getPageStorageKey(questionnaire, page, email);
    localStorage.setItem(key, JSON.stringify(pageAnswers));
  } catch {
    // Error handling
  }
};

const loadPageAnswersFromLocalStorage = (
  questionnaire: string,
  page: number,
  email?: string
): Record<string, number> => {
  try {
    const key = getPageStorageKey(questionnaire, page, email);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const clearPageAnswersFromLocalStorage = (
  questionnaire: string,
  page: number,
  email?: string
): void => {
  try {
    const key = getPageStorageKey(questionnaire, page, email);
    localStorage.removeItem(key);
  } catch {
    // Error handling
  }
};

const AssessmentQuestions = () => {
  const navigate = useNavigate();
  const { answers, answerQuestion, submitAssessment, isComplete } = useAssessment();
  const { user } = useUser();

  const [questionnaires, setQuestionnaires] = useState<string[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [questionsByQuestionnaire, setQuestionsByQuestionnaire] = useState<Record<string, Question[]>>({});
  const [loadedQuestionnaires, setLoadedQuestionnaires] = useState<Set<string>>(new Set());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [assessmentsByQuestionnaire, setAssessmentsByQuestionnaire] = useState<Record<string, EmployeeAssessment>>({});
  const [currentPage, setCurrentPage] = useState(() => loadPage(user?.email));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Track which answers are saved to server (to distinguish from localStorage-only)
  const [serverSavedAnswers, setServerSavedAnswers] = useState<Set<string>>(new Set());

  const previousQuestionnaireRef = useRef<string | null>(null);
  const previousPageRef = useRef<number>(-1);
  const previousQuestionnaireForPageRef = useRef<string | null>(null);
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const answersRef = useRef(answers);
  
  // Keep answers ref in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Helper: Extract cycle ID from submission name
  const getCycleId = (submissionName: string): string => {
    const parts = submissionName.split('-');
    if (parts.length >= 7) {
      return `${parts[5]}-${parts[6]}`; // dimension-cycleNumber
    }
    return '';
  };

  // Helper: Get latest cycle assessments only
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

  // Fetch employee assessments - only show latest cycle
  useEffect(() => {
    const fetchEmployeeAssessments = async () => {
      const userId = getUserIdFromStorage();
      if (!userId) return;

      try {
        const assessments = await getEmployeeAssessments(userId);
        
        // Get only the latest cycle assessments
        const latestCycleAssessments = getLatestCycleAssessments(assessments);
        
        // Organize only the latest cycle assessments
        const { assessmentsMap, questionnaireList } = organizeAssessments(latestCycleAssessments);

        if (questionnaireList.length > 0) {
          setQuestionnaires(questionnaireList);
          setAssessmentsByQuestionnaire(assessmentsMap);
          if (!selectedQuestionnaire) {
            setSelectedQuestionnaire(questionnaireList[0]);
          }
        }
      } catch {
        // Error handling - could add user notification here
      }
    };

    fetchEmployeeAssessments();
  }, [selectedQuestionnaire]);

  // Auto-select first questionnaire
  useEffect(() => {
    if (questionnaires.length > 0 && !selectedQuestionnaire) {
      setSelectedQuestionnaire(questionnaires[0]);
    }
  }, [questionnaires, selectedQuestionnaire]);

  // Fetch questions for selected questionnaire
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedQuestionnaire || loadedQuestionnaires.has(selectedQuestionnaire)) return;

      const assessment = assessmentsByQuestionnaire[selectedQuestionnaire];
      if (!assessment?.submission_name) return;

      try {
        setIsLoadingQuestions(true);
        const { questions, answers: serverAnswers } = await getQuestionsBySubmission(
          assessment.submission_name
        );

        setQuestionsByQuestionnaire((prev) => ({ ...prev, [selectedQuestionnaire]: questions }));
        setLoadedQuestionnaires((prev) => new Set(prev).add(selectedQuestionnaire));

        // Track server-saved answers
        const serverSavedSet = new Set<string>(Object.keys(serverAnswers));
        setServerSavedAnswers((prev) => {
          const newSet = new Set(prev);
          serverSavedSet.forEach((id) => newSet.add(id));
          return newSet;
        });

        // Priority 1: Load server answers first (regardless of status if they exist)
        // Server answers are the source of truth for saved data
        // Use a batch update to avoid multiple re-renders
        const answersToLoad: Array<[string, number]> = [];
        const currentAnswers = answersRef.current;
        
        if (Object.keys(serverAnswers).length > 0) {
          Object.entries(serverAnswers).forEach(([questionId, optionIndex]) => {
            // Check current answers state to avoid overwriting
            if (currentAnswers[questionId] === undefined) {
              answersToLoad.push([questionId, optionIndex]);
            }
          });
        }

        // Priority 2: Load localStorage answers for all pages and merge
        questions.forEach((question, index) => {
          const page = Math.floor(index / ASSESSMENT_CONFIG.questionsPerPage);
          const pageAnswers = loadPageAnswersFromLocalStorage(selectedQuestionnaire, page, user?.email);
          
          // Apply localStorage answer if:
          // 1. Server doesn't have it (unsaved change), AND
          // 2. User hasn't answered it yet in current session
          if (
            pageAnswers[question.id] !== undefined && 
            currentAnswers[question.id] === undefined &&
            !serverSavedSet.has(question.id)
          ) {
            answersToLoad.push([question.id, pageAnswers[question.id]]);
          }
        });

        // Load all answers in batch to avoid multiple re-renders
        answersToLoad.forEach(([questionId, optionIndex]) => {
          answerQuestion(questionId, optionIndex);
        });
      } catch {
        setQuestionsByQuestionnaire((prev) => ({ ...prev, [selectedQuestionnaire]: [] }));
        setLoadedQuestionnaires((prev) => new Set(prev).add(selectedQuestionnaire));
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
    // Removed 'answers' from dependencies to prevent infinite loops
    // Answers are checked inside the function using current state
  }, [selectedQuestionnaire, loadedQuestionnaires, assessmentsByQuestionnaire, answerQuestion, user?.email]);

  // Submit answers for questionnaire (all answers)
  const submitAssessmentAnswersForQuestionnaire = useCallback(
    (questionnaire: string) => {
      if (isSubmitted) return;

      const questions = questionsByQuestionnaire[questionnaire] || [];
      const questionnaireAnswers = questions.reduce((acc, question) => {
        if (answers[question.id] !== undefined) {
          acc[question.id] = answers[question.id];
        }
        return acc;
      }, {} as Record<string, number>);

      if (Object.keys(questionnaireAnswers).length > 0) {
        const assessment = assessmentsByQuestionnaire[questionnaire];
        if (assessment?.submission_name) {
          submitAssessmentAnswers(assessment.submission_name, questions, questionnaireAnswers)
            .then(() => {
              // Mark all submitted answers as server-saved
              setServerSavedAnswers((prev) => {
                const newSet = new Set(prev);
                Object.keys(questionnaireAnswers).forEach((id) => newSet.add(id));
                return newSet;
              });
            })
            .catch(() => {
              // Error handling
            });
        }
      }
    },
    [questionsByQuestionnaire, answers, isSubmitted, assessmentsByQuestionnaire]
  );

  // Submit answers for current page only (used on page change)
  const submitCurrentPageAnswers = useCallback(
    async (questionnaire: string, page: number) => {
      if (isSubmitted || !selectedQuestionnaire) return;

      const questions = questionsByQuestionnaire[questionnaire] || [];
      const start = page * ASSESSMENT_CONFIG.questionsPerPage;
      const end = start + ASSESSMENT_CONFIG.questionsPerPage;
      const pageQuestions = questions.slice(start, end);

      // Get answers for current page only
      const pageAnswers: Record<string, number> = {};
      pageQuestions.forEach((question) => {
        if (answers[question.id] !== undefined) {
          pageAnswers[question.id] = answers[question.id];
        }
      });

      if (Object.keys(pageAnswers).length > 0) {
        const assessment = assessmentsByQuestionnaire[questionnaire];
        if (assessment?.submission_name) {
          try {
            await submitAssessmentAnswers(assessment.submission_name, pageQuestions, pageAnswers);
            // Mark page answers as server-saved
            setServerSavedAnswers((prev) => {
              const newSet = new Set(prev);
              Object.keys(pageAnswers).forEach((id) => newSet.add(id));
              return newSet;
            });
            // Clear localStorage for this page since it's now saved to server
            clearPageAnswersFromLocalStorage(questionnaire, page, user?.email);
          } catch {
            // Error handling - keep localStorage as backup
          }
        }
      }
    },
    [questionsByQuestionnaire, answers, isSubmitted, selectedQuestionnaire, assessmentsByQuestionnaire, user?.email]
  );

  // Auto-save on questionnaire change - save current page of previous questionnaire
  useEffect(() => {
    const previousQuestionnaire = previousQuestionnaireRef.current;
    if (previousQuestionnaire === null) {
      previousQuestionnaireRef.current = selectedQuestionnaire;
      return;
    }
    if (previousQuestionnaire !== selectedQuestionnaire && previousQuestionnaire) {
      // Save current page of previous questionnaire before switching
      submitCurrentPageAnswers(previousQuestionnaire, currentPage);
      // Also save all answers for the previous questionnaire
      submitAssessmentAnswersForQuestionnaire(previousQuestionnaire);
    }
    previousQuestionnaireRef.current = selectedQuestionnaire;
  }, [selectedQuestionnaire, submitAssessmentAnswersForQuestionnaire, submitCurrentPageAnswers, currentPage]);

  // Auto-save on page change - save previous page answers to API
  useEffect(() => {
    if (isSubmitted || !selectedQuestionnaire) {
      previousPageRef.current = currentPage;
      previousQuestionnaireForPageRef.current = selectedQuestionnaire;
      return;
    }

    const isInitialMount = previousPageRef.current === -1;
    const isTabChange = previousQuestionnaireForPageRef.current !== selectedQuestionnaire;

    // When page changes (not initial mount, not tab change), save previous page to API
    if (!isInitialMount && !isTabChange && previousPageRef.current !== currentPage) {
      const previousPage = previousPageRef.current;
      // Save previous page answers to API
      submitCurrentPageAnswers(selectedQuestionnaire, previousPage);
    }

    previousPageRef.current = currentPage;
    previousQuestionnaireForPageRef.current = selectedQuestionnaire;
  }, [currentPage, selectedQuestionnaire, isSubmitted, submitCurrentPageAnswers]);

  // Computed values
  const filteredQuestions = useMemo(
    () => (selectedQuestionnaire ? questionsByQuestionnaire[selectedQuestionnaire] || [] : []),
    [questionsByQuestionnaire, selectedQuestionnaire]
  );

  const totalPages = Math.ceil(filteredQuestions.length / ASSESSMENT_CONFIG.questionsPerPage);

  const currentPageQuestions = useMemo(() => {
    const start = currentPage * ASSESSMENT_CONFIG.questionsPerPage;
    const end = start + ASSESSMENT_CONFIG.questionsPerPage;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, currentPage]);

  const answeredCount = useMemo(
    () => filteredQuestions.filter((q) => answers[q.id] !== undefined).length,
    [filteredQuestions, answers]
  );

  const allQuestionnairesComplete = useMemo(() => {
    if (questionnaires.length === 0) return false;
    return questionnaires.every((questionnaire) => {
      const questions = questionsByQuestionnaire[questionnaire] || [];
      return getQuestionnaireStats(questions, answers).isComplete;
    });
  }, [questionnaires, questionsByQuestionnaire, answers]);

  // Memoized values for confirmation modal
  const confirmationModalStats = useMemo(() => {
    const total = questionnaires.reduce(
      (sum, questionnaire) => sum + (questionsByQuestionnaire[questionnaire]?.length || 0),
      0
    );
    const answered = questionnaires.reduce((count, questionnaire) => {
      const questions = questionsByQuestionnaire[questionnaire] || [];
      return count + questions.filter((q) => answers[q.id] !== undefined).length;
    }, 0);
    return { total, answered };
  }, [questionnaires, questionsByQuestionnaire, answers]);

  // Load saved answers from localStorage (fallback for general storage)
  useEffect(() => {
    if (!user?.email) return;

    try {
      const storedAnswers = loadAnswers(user.email);
      if (storedAnswers && Object.keys(storedAnswers).length > 0) {
        // Only load if not already in answers (to avoid overwriting server answers)
        Object.entries(storedAnswers).forEach(([questionId, optionIndex]) => {
          if (answers[questionId] === undefined) {
            answerQuestion(questionId, optionIndex as number);
          }
        });
      }
    } catch {
      // Error handling
    }
  }, [user?.email, answerQuestion, answers]);

  // Restore saved page and check submission status from API
  useEffect(() => {
    const savedPage = loadPage(user?.email);
    if (savedPage >= 0 && savedPage < totalPages && savedPage !== currentPage) {
      setCurrentPage(savedPage);
    }
    
    // Check if current assessment cycle is submitted based on API status
    if (questionnaires.length > 0 && assessmentsByQuestionnaire) {
      const allSubmitted = questionnaires.every((questionnaire) => {
        const assessment = assessmentsByQuestionnaire[questionnaire];
        return assessment?.status === "Completed";
      });
      setIsSubmitted(allSubmitted && isComplete);
    }
  }, [user?.email, totalPages, currentPage, isComplete, questionnaires, assessmentsByQuestionnaire]);

  // Scroll to question helper
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

  // Handle answer change
  const handleAnswerChange = useCallback(
    (questionId: string, optionIndex: number) => {
      if (isSubmitted || !selectedQuestionnaire) return;

      answerQuestion(questionId, optionIndex);

      // Save to general localStorage (for backward compatibility)
      if (user?.email) {
        saveAnswers({ ...answers, [questionId]: optionIndex }, user.email);
      }

      // Save to page-specific localStorage (for unsaved changes on current page)
      const currentQuestionIndex = filteredQuestions.findIndex((q) => q.id === questionId);
      if (currentQuestionIndex !== -1) {
        const questionPage = Math.floor(currentQuestionIndex / ASSESSMENT_CONFIG.questionsPerPage);
        
        // Get current page answers
        const start = questionPage * ASSESSMENT_CONFIG.questionsPerPage;
        const end = start + ASSESSMENT_CONFIG.questionsPerPage;
        const pageQuestions = filteredQuestions.slice(start, end);
        const pageAnswers: Record<string, number> = {};
        
        pageQuestions.forEach((q) => {
          const answer = q.id === questionId ? optionIndex : answers[q.id];
          if (answer !== undefined) {
            pageAnswers[q.id] = answer;
          }
        });

        // Save page answers to localStorage (only if not already saved to server)
        if (!serverSavedAnswers.has(questionId)) {
          savePageAnswersToLocalStorage(selectedQuestionnaire, questionPage, pageAnswers, user?.email);
        }
      }

      // Mark current assessment cycle as STARTED (at least one answer given)
      // This is used by the main Assessment page to decide between
      // "Start Assessment" vs "Continue Assessment" without requiring a full refresh.
      if (user?.email && assessmentsByQuestionnaire && Object.keys(assessmentsByQuestionnaire).length > 0) {
        const firstAssessment = Object.values(assessmentsByQuestionnaire)[0];
        if (firstAssessment?.submission_name) {
          const cycleParts = firstAssessment.submission_name.split("-");
          if (cycleParts.length >= 7) {
            const currentCycleId = `${cycleParts[5]}-${cycleParts[6]}`;
            const cycleStartedKey = `chaturvima_started_cycle_${currentCycleId}_${user.email
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_")}`;
            try {
              localStorage.setItem(cycleStartedKey, "true");
            } catch {
              // Ignore localStorage errors
            }
          }
        }
      }

      if (isSaved) {
        setIsSaved(false);
        setShowSavedToast(false);
      }

      if (currentQuestionIndex === -1 || currentQuestionIndex >= filteredQuestions.length - 1) return;

      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextPage = Math.floor(nextQuestionIndex / ASSESSMENT_CONFIG.questionsPerPage);
      const nextQuestion = filteredQuestions[nextQuestionIndex];

      if (nextPage === currentPage) {
        scrollToQuestion(nextQuestion.id);
      } else if (nextPage < totalPages) {
        setTimeout(() => {
          setCurrentPage(nextPage);
          savePage(nextPage, user?.email);
          questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }, ASSESSMENT_CONFIG.autoAdvanceDelay);
      }
    },
    [
      isSubmitted,
      selectedQuestionnaire,
      answerQuestion,
      answers,
      isSaved,
      filteredQuestions,
      currentPage,
      totalPages,
      user?.email,
      scrollToQuestion,
      serverSavedAnswers,
      assessmentsByQuestionnaire,
    ]
  );

  // Change page
  const changePage = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      savePage(newPage, user?.email);
    },
    [user?.email]
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (!selectedQuestionnaire) return;

    // Save current page to API
    submitCurrentPageAnswers(selectedQuestionnaire, currentPage);
    // Save all answers to API
    submitAssessmentAnswersForQuestionnaire(selectedQuestionnaire);
    
    // Clear localStorage for current page since it's now saved to server
    clearPageAnswersFromLocalStorage(selectedQuestionnaire, currentPage, user?.email);
    
    savePage(currentPage, user?.email);
    saveAnswers(answers, user?.email);
    setIsSaved(true);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), ASSESSMENT_CONFIG.toastDuration);

    const currentIndex = questionnaires.findIndex((q) => q === selectedQuestionnaire);
    const nextTab = questionnaires[currentIndex + 1];

    if (nextTab) {
      setTimeout(() => {
        setSelectedQuestionnaire(nextTab);
        setCurrentPage(0);
        savePage(0, user?.email);
        questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 500);
    }
  }, [
    currentPage,
    answers,
    user?.email,
    selectedQuestionnaire,
    questionnaires,
    submitAssessmentAnswersForQuestionnaire,
    submitCurrentPageAnswers,
  ]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (allQuestionnairesComplete && isSaved && !isSubmitted) {
      setShowConfirmationModal(true);
    }
  }, [allQuestionnairesComplete, isSaved, isSubmitted]);

  // Handle confirm submit
  const handleConfirmSubmit = useCallback(() => {
    setShowConfirmationModal(false);
    submitAssessment();
    setIsSubmitted(true);
    setShowSuccessModal(true);
    
    // Save cycle-specific submission status when modal is confirmed
    // Each cycle has its own submission flag: chaturvima_submitted_cycle_{cycleId}_{email}
    if (user?.email && assessmentsByQuestionnaire && Object.keys(assessmentsByQuestionnaire).length > 0) {
      const firstAssessment = Object.values(assessmentsByQuestionnaire)[0];
      if (firstAssessment?.submission_name) {
        const cycleParts = firstAssessment.submission_name.split('-');
        if (cycleParts.length >= 7) {
          const currentCycleId = `${cycleParts[5]}-${cycleParts[6]}`;
          const cycleSubmissionKey = `chaturvima_submitted_cycle_${currentCycleId}_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          localStorage.setItem(cycleSubmissionKey, 'true');
        }
      }
    }
    
    clearPageStorage(user?.email);
  }, [submitAssessment, user?.email, assessmentsByQuestionnaire]);

  // Handle view report
  const handleViewReport = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/assessment-report");
  }, [navigate]);

  // Handle close modal - navigate back to assessment page
  const handleCloseSuccessModal = useCallback(() => {
    // Navigate immediately to avoid showing the questions page briefly
    // Using replace to avoid adding to history stack
    navigate("/assessment", { replace: true });
    // Close modal after navigation starts (component will unmount anyway)
    setShowSuccessModal(false);
  }, [navigate]);

  // Reset page on questionnaire change
  useEffect(() => {
    setCurrentPage(0);
    previousQuestionnaireRef.current = null;
    questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedQuestionnaire]);

  // Scroll to top on page change
  useEffect(() => {
    questionsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const progressPercentage = useMemo(
    () => (filteredQuestions.length > 0 ? Math.round((answeredCount / filteredQuestions.length) * 100) : 0),
    [answeredCount, filteredQuestions.length]
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!(isSubmitted && !showSuccessModal) && (
        <div className="relative z-10 h-full w-full overflow-hidden px-4 py-3 lg:px-6 lg:py-8">
        <div className="h-full overflow-hidden flex flex-col">
          <div className="grid lg:grid-cols-4 gap-4 h-full min-h-0 flex-1 overflow-hidden">
            <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="shrink-0 space-y-2 mb-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/assessment")}
                  className="cursor-pointer text-xs py-1 h-auto"
                  size="sm"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Assessment
                </Button>

                <div className="space-y-2">
                  <motion.h1
                    className="text-xl md:text-2xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Q4 2024 Assessment Cycle
                  </motion.h1>

                  <div className="flex gap-1 overflow-x-auto custom-scrollbar-horizontal">
                    {questionnaires.map((questionnaire) => {
                      const questions = questionsByQuestionnaire[questionnaire] || [];
                      const { answered, total, isComplete: isQComplete } = getQuestionnaireStats(questions, answers);
                      const isSelected = selectedQuestionnaire === questionnaire;
                      const assessment = assessmentsByQuestionnaire[questionnaire];
                      const status = assessment?.status || "Draft";

                      return (
                        <button
                          key={questionnaire}
                          onClick={() => setSelectedQuestionnaire(questionnaire)}
                          className={cn(
                            "relative px-2.5 py-1.5 text-xs font-medium transition-all rounded-md whitespace-nowrap shrink-0",
                            isSubmitted
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer",
                            isQComplete
                              ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                              : isSelected
                              ? "bg-brand-teal text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                          title={`${mapQuestionnaireToDisplayName(questionnaire)} - ${status}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">
                              {mapQuestionnaireToDisplayName(questionnaire)}
                            </span>
                            {isQComplete && (
                              <Check
                                className={cn(
                                  "h-3 w-3 shrink-0",
                                  isSelected || isQComplete ? "text-white" : "text-green-600"
                                )}
                              />
                            )}
                            {total > 0 && (
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                                  isSelected || isQComplete
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 text-gray-600"
                                )}
                              >
                                {answered}/{total}
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
                {isLoadingQuestions ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-sm text-gray-600">Loading questions...</p>
                    </div>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center space-y-3 max-w-md">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"
                      >
                        <Target className="w-8 h-8 text-gray-400" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900">No Questions Available</h3>
                      <p className="text-sm text-gray-600">
                        There are no questions available for{" "}
                        {selectedQuestionnaire ? mapQuestionnaireToDisplayName(selectedQuestionnaire) : "this questionnaire"} at the moment. Please try again later.
                      </p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {currentPageQuestions.map((question, idx) => {
                      const questionNumber =
                        currentPage * ASSESSMENT_CONFIG.questionsPerPage + idx + 1;
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
                                    Question {questionNumber} of {filteredQuestions.length}
                                  </span>
                                  <h3 className="text-sm font-medium text-gray-900 mt-0.5">
                                    {question.text}
                                  </h3>
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
                                      className="shrink-0 ml-4 relative"
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
                                  const isSelected = selectedAnswer === optionIndex;
                                  return (
                                    <motion.button
                                      key={optionIndex}
                                      type="button"
                                      onClick={() => handleAnswerChange(question.id, optionIndex)}
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
                                      whileTap={isSubmitted ? {} : { scale: 0.98 }}
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
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
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
                                            isSelected ? "text-gray-900" : "text-gray-700"
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
                )}
              </div>

              <div className="shrink-0 flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                <Button
                  variant="outline"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={cn(
                    "text-xs py-1.5 h-auto",
                    isSubmitted ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                  size="sm"
                >
                  <ChevronLeft className="mr-1.5 h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPaginationButtons(currentPage, totalPages).map((pageIdx, idx) => {
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
                        onClick={() => changePage(pageIdx)}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
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
                  })}
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
                          disabled={!allQuestionnairesComplete}
                          className={cn(
                            "text-xs py-1.5 h-auto",
                            allQuestionnairesComplete
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
                    disabled={currentPage === totalPages - 1}
                    className={cn(
                      "text-xs py-1.5 h-auto",
                      isSubmitted ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                    size="sm"
                  >
                    Next
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-3">
                <Card variant="elevated" className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-teal" />
                    Your Progress
                  </h3>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          {selectedQuestionnaire ? mapQuestionnaireToDisplayName(selectedQuestionnaire) : ""}
                        </span>
                        <motion.span
                          className="text-3xl"
                          key={`${selectedQuestionnaire}-${answeredCount}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          {getProgressEmoji(progressPercentage)}
                        </motion.span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progressPercentage}%`,
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {getProgressMessage(progressPercentage)}
                        </span>
                        <span className="text-xs font-semibold text-brand-teal">
                          {answeredCount} / {filteredQuestions.length}
                        </span>
                      </div>
                    </div>

                    {questionnaires.length > 1 && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-700">
                            Overall Completion
                          </span>
                          <span className="text-xs font-semibold text-brand-teal">
                            {questionnaires.filter((questionnaire) => {
                              const questions = questionsByQuestionnaire[questionnaire] || [];
                              return getQuestionnaireStats(questions, answers).isComplete;
                            }).length}{" "}
                            / {questionnaires.length} Questionnaires
                          </span>
                        </div>
                        <div className="space-y-2">
                          {questionnaires.map((questionnaire) => {
                            const questions = questionsByQuestionnaire[questionnaire] || [];
                            const { answered, total } = getQuestionnaireStats(questions, answers);
                            if (total === 0) return null;
                            return (
                              <div key={questionnaire} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-600 truncate">
                                    {questionnaire}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-700">
                                    {answered}/{total}
                                  </span>
                                </div>
                                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`absolute inset-y-0 left-0 rounded-full ${
                                      answered === total ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${total > 0 ? (answered / total) * 100 : 0}%`,
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
                          idx >= currentPage * ASSESSMENT_CONFIG.questionsPerPage &&
                          idx < (currentPage + 1) * ASSESSMENT_CONFIG.questionsPerPage;

                        return (
                          <button
                            key={question.id}
                            onClick={() => {
                              const targetPage = Math.floor(idx / ASSESSMENT_CONFIG.questionsPerPage);
                              changePage(targetPage);
                            }}
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
                            title={`Question ${idx + 1}: ${question.text.slice(0, 30)}...`}
                          >
                            <span className="font-semibold">{idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {allQuestionnairesComplete && (
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
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0"
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
      )}

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        answeredCount={confirmationModalStats.answered}
        totalQuestions={confirmationModalStats.total}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onViewReport={handleViewReport}
      />
    </div>
  );
};

export default AssessmentQuestions;
