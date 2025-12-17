/**
 * Assessment Storage Utilities
 * Handles localStorage operations for assessment progress
 */

export const getStorageKey = (type: "page" | "answers" | "submitted", email?: string): string => {
  const baseKey = email
    ? email.toLowerCase().replace(/[^a-z0-9]/g, "_")
    : "anonymous";
  
  const keys = {
    page: `chaturvima_assessment_page_${baseKey}`,
    answers: `chaturvima_assessment_answers_${baseKey}`,
    submitted: `chaturvima_assessment_submitted_${baseKey}`,
  };
  
  return keys[type];
};

export const savePage = (page: number, email?: string): void => {
  try {
    localStorage.setItem(getStorageKey("page", email), page.toString());
  } catch (error) {
    console.error("Error saving page:", error);
  }
};

export const loadPage = (email?: string): number => {
  try {
    const saved = localStorage.getItem(getStorageKey("page", email));
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveAnswers = (answers: Record<string, number>, email?: string): void => {
  try {
    localStorage.setItem(getStorageKey("answers", email), JSON.stringify(answers));
  } catch (error) {
    console.error("Error saving answers:", error);
  }
};

export const loadAnswers = (email?: string): Record<string, number> => {
  try {
    const saved = localStorage.getItem(getStorageKey("answers", email));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveSubmissionStatus = (submitted: boolean, email?: string): void => {
  try {
    localStorage.setItem(getStorageKey("submitted", email), submitted.toString());
  } catch (error) {
    console.error("Error saving submission status:", error);
  }
};

export const loadSubmissionStatus = (email?: string): boolean => {
  try {
    return localStorage.getItem(getStorageKey("submitted", email)) === "true";
  } catch {
    return false;
  }
};

export const clearPageStorage = (email?: string): void => {
  try {
    localStorage.removeItem(getStorageKey("page", email));
  } catch (error) {
    console.error("Error clearing page storage:", error);
  }
};

