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
      main: "#FFD700", // Gold
      light: "#FFF9E6",
      dark: "#B8860B",
    },
    selfReflection: {
      main: "#6A5ACD", // Purple
      light: "#E6E4F7",
      dark: "#483D8B",
    },
    soulSearching: {
      main: "#FF6347", // Tomato
      light: "#FFE5E1",
      dark: "#CD5C5C",
    },
    steadyState: {
      main: "#20B2AA", // Teal
      light: "#E0F7F5",
      dark: "#008B8B",
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

// ==================== Font Families ====================
export const fonts = {
  // Headings: Inter or Poppins (modern, professional, readable)
  heading: "font-inter", // Primary: Inter, fallback: Poppins
  headingAlt: "font-poppins", // Alternative heading font

  // Body: Open Sans or Roboto (high readability for long reports)
  body: "font-open-sans", // Primary: Open Sans, fallback: Roboto
  bodyAlt: "font-roboto", // Alternative body font

  // Data/Numbers: Roboto Mono (tabular figures for alignment)
  mono: "font-roboto-mono", // For numbers, data, code
} as const;

// ==================== Typography ====================
export const typography = {
  // Page titles (using heading font)
  pageTitle: "font-inter text-2xl md:text-3xl font-bold text-gray-900",

  // Section headings (using heading font)
  sectionHeading: "font-inter text-lg font-semibold text-gray-900",

  // Subsection headings (using heading font)
  subsectionHeading: "font-inter text-base font-medium text-gray-900",

  // Card labels (using body font)
  cardLabel: "font-open-sans text-sm font-medium text-gray-600",

  // Body text (using body font)
  body: "font-open-sans text-sm text-gray-700",
  bodyLarge: "font-open-sans text-base text-gray-700",

  // Small text (using body font)
  small: "font-open-sans text-xs text-gray-500",
  smallMedium: "font-open-sans text-xs font-medium text-gray-500",

  // Data/Numbers (using mono font)
  data: "font-roboto-mono text-sm text-gray-700",
  dataLarge: "font-roboto-mono text-base font-semibold text-gray-900",
  dataBold: "font-roboto-mono text-lg font-bold text-gray-900",
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
