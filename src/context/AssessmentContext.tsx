/**
 * Assessment Context
 * Manages assessment state, progress, and answers
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type {
  Answer,
  AssessmentProgress,
  AssessmentResult,
  StageDistribution,
  StageType,
} from "../types";
import { MOCK_QUESTIONS } from "../data/mockQuestions";
import { useUser } from "./UserContext";

interface AssessmentContextType {
  progress: AssessmentProgress;
  currentQuestion: (typeof MOCK_QUESTIONS)[0] | null;
  isComplete: boolean;
  result: AssessmentResult | null;
  questions: typeof MOCK_QUESTIONS;
  answers: Record<string, number>; // questionId -> selectedOption
  startAssessment: () => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  goToQuestion: (index: number) => void;
  goToPreviousQuestion: () => void;
  goToNextQuestion: () => void;
  submitAssessment: () => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};

interface AssessmentProviderProps {
  children: ReactNode;
}

// Helper function to get user-specific storage keys
const getStorageKeys = (userEmail: string | null) => {
  const emailKey = userEmail
    ? userEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")
    : "anonymous";
  return {
    answers: `chaturvima_assessment_answers_${emailKey}`,
    index: `chaturvima_assessment_index_${emailKey}`,
  };
};

export const AssessmentProvider = ({ children }: AssessmentProviderProps) => {
  const { user } = useUser();

  // Load saved answers and index from localStorage on mount
  const loadSavedState = (): {
    answers: Record<string, number>;
    index: number;
  } => {
    if (!user) {
      return { answers: {}, index: 0 };
    }

    const storageKeys = getStorageKeys(user.email);
    try {
      const savedAnswers = localStorage.getItem(storageKeys.answers);
      const savedIndex = localStorage.getItem(storageKeys.index);
      return {
        answers: savedAnswers ? JSON.parse(savedAnswers) : {},
        index: savedIndex ? parseInt(savedIndex, 10) : 0,
      };
    } catch (error) {
      console.error("Error loading saved assessment state:", error);
      return { answers: {}, index: 0 };
    }
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return loadSavedState().index;
  });
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    return loadSavedState().answers;
  });
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Reload answers when user changes
  useEffect(() => {
    const savedState = loadSavedState();
    setAnswers(savedState.answers);
    setCurrentQuestionIndex(savedState.index);
  }, [user?.email]); // Reload when user email changes

  const totalQuestions = MOCK_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const percentComplete = Math.round((answeredCount / totalQuestions) * 100);

  const progress: AssessmentProgress = {
    currentQuestionIndex,
    totalQuestions,
    answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
      timestamp: new Date(),
    })),
    percentComplete,
    timeStarted: new Date(),
    timeElapsed: 0,
  };

  const currentQuestion =
    currentQuestionIndex < MOCK_QUESTIONS.length
      ? MOCK_QUESTIONS[currentQuestionIndex]
      : null;

  const calculateStageDistribution = useCallback(
    (answers: Answer[]): StageDistribution => {
      // Initialize stage scores
      const stageScores: Record<StageType, number> = {
        honeymoon: 0,
        "self-reflection": 0,
        "soul-searching": 0,
        "steady-state": 0,
      };

      // Calculate weighted scores for each stage
      answers.forEach((answer) => {
        const question = MOCK_QUESTIONS.find((q) => q.id === answer.questionId);
        if (!question) return;

        const stage = question.stage;
        const weight = question.weight;

        // Likert scale: 0-4 (Strongly Disagree to Strongly Agree)
        // Convert to 0-1 score and multiply by weight
        const score = (answer.selectedOption / 4) * weight;
        stageScores[stage] += score;
      });

      // Calculate total score
      const totalScore = Object.values(stageScores).reduce(
        (sum, score) => sum + score,
        0
      );

      // Convert to percentages (0-100)
      const distribution: StageDistribution = {
        honeymoon:
          totalScore > 0
            ? Math.round((stageScores.honeymoon / totalScore) * 100)
            : 0,
        "self-reflection":
          totalScore > 0
            ? Math.round((stageScores["self-reflection"] / totalScore) * 100)
            : 0,
        "soul-searching":
          totalScore > 0
            ? Math.round((stageScores["soul-searching"] / totalScore) * 100)
            : 0,
        "steady-state":
          totalScore > 0
            ? Math.round((stageScores["steady-state"] / totalScore) * 100)
            : 0,
      };

      // Ensure percentages add up to 100 (adjust for rounding)
      const sum =
        distribution.honeymoon +
        distribution["self-reflection"] +
        distribution["soul-searching"] +
        distribution["steady-state"];

      if (sum !== 100 && sum > 0) {
        // Add difference to the largest value
        const maxStage = Object.entries(distribution).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0] as StageType;
        distribution[maxStage] += 100 - sum;
      }

      return distribution;
    },
    []
  );

  const getDominantStage = (distribution: StageDistribution): StageType => {
    return Object.entries(distribution).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as StageType;
  };

  const startAssessment = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
    setResult(null);
    // Clear saved state when starting new assessment
    if (user) {
      const storageKeys = getStorageKeys(user.email);
      try {
        localStorage.removeItem(storageKeys.answers);
        localStorage.removeItem(storageKeys.index);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  }, [user]);

  const answerQuestion = useCallback(
    (questionId: string, optionIndex: number) => {
      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [questionId]: optionIndex,
        };
        // Auto-save to localStorage
        if (user) {
          const storageKeys = getStorageKeys(user.email);
          try {
            localStorage.setItem(
              storageKeys.answers,
              JSON.stringify(newAnswers)
            );
          } catch (error) {
            console.error("Error saving answers to localStorage:", error);
          }
        }
        return newAnswers;
      });
    },
    [user]
  );

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
        // Save current page index
        if (user) {
          const storageKeys = getStorageKeys(user.email);
          try {
            localStorage.setItem(storageKeys.index, index.toString());
          } catch (error) {
            console.error("Error saving page index to localStorage:", error);
          }
        }
      }
    },
    [totalQuestions, user]
  );

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      const newIndex = Math.max(0, prev - 1);
      if (user) {
        const storageKeys = getStorageKeys(user.email);
        try {
          localStorage.setItem(storageKeys.index, newIndex.toString());
        } catch (error) {
          console.error("Error saving page index to localStorage:", error);
        }
      }
      return newIndex;
    });
  }, [user]);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      const newIndex = Math.min(totalQuestions - 1, prev + 1);
      if (user) {
        const storageKeys = getStorageKeys(user.email);
        try {
          localStorage.setItem(storageKeys.index, newIndex.toString());
        } catch (error) {
          console.error("Error saving page index to localStorage:", error);
        }
      }
      return newIndex;
    });
  }, [totalQuestions, user]);

  const submitAssessment = useCallback(() => {
    const answerArray: Answer[] = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
        timestamp: new Date(),
      })
    );

    const distribution = calculateStageDistribution(answerArray);
    const dominantStage = getDominantStage(distribution);

    setIsComplete(true);
    setResult({
      userId: user?.id || "unknown",
      level: "employee",
      stageDistribution: distribution,
      dominantStage,
      completedAt: new Date(),
      score: Math.round(
        Object.values(distribution).reduce((sum, val) => sum + val, 0) / 4
      ),
    });

    // Clear saved state after successful submission
    if (user) {
      const storageKeys = getStorageKeys(user.email);
      try {
        localStorage.removeItem(storageKeys.answers);
        localStorage.removeItem(storageKeys.index);
      } catch (error) {
        console.error("Error clearing localStorage after submission:", error);
      }
    }
  }, [answers, user, calculateStageDistribution]);

  const resetAssessment = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
    setResult(null);
    // Clear saved state when resetting
    if (user) {
      const storageKeys = getStorageKeys(user.email);
      try {
        localStorage.removeItem(storageKeys.answers);
        localStorage.removeItem(storageKeys.index);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  }, [user]);

  const value: AssessmentContextType = {
    progress,
    currentQuestion,
    isComplete,
    result,
    questions: MOCK_QUESTIONS,
    answers,
    startAssessment,
    answerQuestion,
    goToQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    submitAssessment,
    resetAssessment,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};
