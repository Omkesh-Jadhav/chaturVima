/**
 * Animation variants and constants for consistent animations across the project
 */

// Common animation variants (compatible with framer-motion)
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
} as const;

export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
} as const;

export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

// Transition presets
export const transitions = {
  fast: { duration: 0.2 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  spring: { type: "spring", duration: 0.3 },
  smooth: { duration: 0.4, ease: "easeOut" },
} as const;

// Common animation delays for staggered animations
export const animationDelays = {
  none: 0,
  xs: 0.1,
  sm: 0.2,
  md: 0.3,
  lg: 0.4,
  xl: 0.5,
} as const;
