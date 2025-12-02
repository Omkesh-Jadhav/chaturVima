/**
 * Animation variants and constants for consistent animations across the project
 */

import { Variants } from "framer-motion";

// Common animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

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
