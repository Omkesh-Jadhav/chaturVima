/**
 * Centralized Color Configuration
 * Update colors here to automatically apply across the entire project
 */

export const colors = {
  // Brand Colors
  // brand: {
  //   teal: "#2BC6B4",
  //   navy: "#1E3A5F",
  //   tealDark: "#0b8584",
  //   tealLight: "#0ea5a4",
  // },
  brand: {
    teal: "#4160F0",
    navy: "#FF6700",
    tealDark: "#4160F0",
    tealLight: "#FF6700",
  },

  // Stage Colors
  stages: {
    honeymoon: {
      main: "#475569",
      light: "#f1f5f9",
      dark: "#1e293b",
    },
    selfReflection: {
      main: "#7c3aed",
      light: "#f5f3ff",
      dark: "#5b21b6",
    },
    soulSearching: {
      main: "#0284c7",
      light: "#e0f2fe",
      dark: "#075985",
    },
    steadyState: {
      main: "#0d9488",
      light: "#ccfbf1",
      dark: "#134e4a",
    },
  },

  // Semantic Colors
  semantic: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#38bdf8",
  },

  // Neutral Colors
  neutral: {
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#334155",
    gray800: "#1f2937",
    gray900: "#111827",
  },
} as const;

// Helper function to get CSS variable name for Tailwind classes
export const getColorVar = (colorPath: string): string => {
  return colorPath.replace(/\./g, "-");
};

// Export for use in inline styles or CSS-in-JS
export default colors;
