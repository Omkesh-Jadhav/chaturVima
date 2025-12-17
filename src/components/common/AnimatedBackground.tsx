// Floating gradient orbs for dashboard background using centralized theme colors
import { motion } from "framer-motion";
import { getStagePieColor } from "@/utils/assessmentConfig";

interface AnimatedBackgroundProps {
  colors?: string[];
}

export const AnimatedBackground = ({
  colors = [
    getStagePieColor("Honeymoon"),
    getStagePieColor("Self-Introspection"),
    getStagePieColor("Soul-Searching"),
  ],
}: AnimatedBackgroundProps) => {
  const orbs = colors.map((color, index) => ({
    id: index,
    color,
    size: 200 + Math.random() * 100,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 20 + Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

