/**
 * Pagination Utilities
 * Helper functions for pagination logic
 */

export const getPaginationButtons = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 10
): (number | "ellipsis")[] => {
  if (totalPages <= maxVisible) {
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

export const getProgressEmoji = (percent: number): string => {
  if (percent === 0) return "😴";
  if (percent < 20) return "😕";
  if (percent < 40) return "😐";
  if (percent < 60) return "🙂";
  if (percent < 80) return "😊";
  if (percent < 100) return "🤩";
  return "🎉";
};

export const getProgressMessage = (percent: number): string => {
  if (percent === 0) return "Just starting...";
  if (percent < 20) return "Getting there...";
  if (percent < 40) return "Making progress...";
  if (percent < 60) return "Great job!";
  if (percent < 80) return "Almost done!";
  if (percent < 100) return "So close!";
  return "Perfect!";
};

