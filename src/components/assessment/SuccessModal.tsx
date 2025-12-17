import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Target, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import { CONFETTI_COLORS, ACHIEVEMENT_BADGES } from "@/data/assessmentDashboard";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
}

const iconMap = { Target, Star, Zap };

const SuccessModal = ({ isOpen, onClose, onViewReport }: SuccessModalProps) => {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; color: string; delay: number }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      setConfetti(
        Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          delay: Math.random() * 0.5,
        }))
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, window.innerHeight + 20],
              rotate: 360,
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-teal via-brand-navy to-brand-teal p-8 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Assessment Complete! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-lg"
            >
              Thank you for your thoughtful responses
            </motion.p>
          </div>
        </div>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Sparkles className="h-5 w-5 text-brand-teal" />
                <span className="text-sm font-medium">Your insights are being analyzed</span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed">
                We've successfully received your assessment responses. Your organizational health
                profile is being generated based on your honest feedback.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {ACHIEVEMENT_BADGES.map((badge, idx) => {
                const Icon = iconMap[badge.icon as keyof typeof iconMap];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <Icon className={cn("h-6 w-6", badge.color)} />
                    <span className="text-xs font-medium text-gray-700">{badge.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">
                Close
              </Button>
              <Button
                onClick={onViewReport}
                className="flex-1 cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
              >
                <Trophy className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;

