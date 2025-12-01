/**
 * Animated Background Component
 * Floating gradient orbs for dashboard background
 */

import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  colors?: string[];
}

export const AnimatedBackground = ({
  colors = ["#10b981", "#7c3aed", "#3b82f6"],
}: AnimatedBackgroundProps) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-20 blur-3xl"
        style={{
          width: 220 + i * 120,
          height: 220 + i * 120,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          left: `${10 + i * 30}%`,
          top: `${5 + i * 25}%`,
        }}
        animate={{ x: [0, 40, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
        transition={{
          duration: 12 + i * 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);
