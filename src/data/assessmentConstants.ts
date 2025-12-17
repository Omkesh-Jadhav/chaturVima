/**
 * Assessment Constants
 * Configuration and constants for assessment pages
 */

export const ASSESSMENT_CONFIG = {
  questionsPerPage: 5,
  maxVisiblePagination: 10,
  autoAdvanceDelay: 300,
  scrollOffset: 20,
  toastDuration: 3000,
} as const;

export const PROGRESS_EMOJIS = {
  0: "😴",
  20: "😕",
  40: "😐",
  60: "🙂",
  80: "😊",
  100: "🤩",
  complete: "🎉",
} as const;

export const PROGRESS_MESSAGES = {
  0: "Just starting...",
  20: "Getting there...",
  40: "Making progress...",
  60: "Great job!",
  80: "Almost done!",
  100: "So close!",
  complete: "Perfect!",
} as const;

export const ACHIEVEMENT_BADGES = [
  { icon: "Target", label: "Completed", color: "text-blue-600" },
  { icon: "Star", label: "Thoughtful", color: "text-yellow-600" },
  { icon: "Zap", label: "Valuable", color: "text-purple-600" },
] as const;

export const CONFETTI_COLORS = [
  "#2BC6B4",
  "#1E3A5F",
  "#FF6347",
  "#EF4444",
  "#6A5ACD",
  "#FFD700",
] as const;

export const TOAST_DURATION = 3000;

