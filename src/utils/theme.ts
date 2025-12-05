/**
 * Theme Configuration
 * Centralized theme constants including colors, typography, and common constants
 */

// ==================== Colors ====================
export const colors = {
  // Brand Colors
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

// ==================== Typography ====================
export const typography = {
  // Page titles
  pageTitle: "text-2xl md:text-3xl font-bold text-gray-900",

  // Section headings
  sectionHeading: "text-lg font-semibold text-gray-900",

  // Subsection headings
  subsectionHeading: "text-base font-medium text-gray-900",

  // Card labels
  cardLabel: "text-sm font-medium text-gray-600",

  // Body text
  body: "text-sm text-gray-700",
  bodyLarge: "text-base text-gray-700",

  // Small text
  small: "text-xs text-gray-500",
  smallMedium: "text-xs font-medium text-gray-500",
} as const;

// ==================== Common Constants ====================
// Country codes with flags
export const COUNTRY_CODES = [
  ["+1", "US", "🇺🇸"],
  ["+91", "IN", "🇮🇳"],
  ["+44", "GB", "🇬🇧"],
  ["+61", "AU", "🇦🇺"],
  ["+86", "CN", "🇨🇳"],
  ["+81", "JP", "🇯🇵"],
  ["+49", "DE", "🇩🇪"],
  ["+33", "FR", "🇫🇷"],
  ["+39", "IT", "🇮🇹"],
  ["+34", "ES", "🇪🇸"],
  ["+7", "RU", "🇷🇺"],
  ["+82", "KR", "🇰🇷"],
  ["+55", "BR", "🇧🇷"],
  ["+52", "MX", "🇲🇽"],
  ["+27", "ZA", "🇿🇦"],
  ["+971", "AE", "🇦🇪"],
  ["+65", "SG", "🇸🇬"],
  ["+60", "MY", "🇲🇾"],
  ["+66", "TH", "🇹🇭"],
  ["+84", "VN", "🇻🇳"],
] as const;

// Salutation options
export const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."] as const;

// Default export for backward compatibility
export default colors;
