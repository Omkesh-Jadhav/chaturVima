/**
 * Energy Break Component
 * 
 * Displays motivational breaks with fun facts and energy restoration visuals.
 * Shown every 5 questions to maintain engagement during assessment.
 */
import { motion } from "framer-motion";
import { Coffee, Zap, Heart, Star } from "lucide-react";
import { Card, CardContent } from "../../components/ui";

interface EnergyBreakProps {
  questionNumber: number;
  onContinue: () => void;
}

// ==================== Constants ====================
const FUN_FACTS = [
  "Did you know? Taking short breaks improves focus by 20%! ☕",
  "You're doing great! Studies show self-reflection leads to better performance 🌟",
  "Fun fact: Organizations with high engagement see 21% greater profitability! 💼",
  "Keep going! Honest self-assessment is the first step to growth 🚀",
  "Research shows that purposeful work increases productivity by 30%! ⚡",
  "Almost there! Your insights will help create a better workplace 🎯",
] as const;

const ENERGY_MESSAGES = [
  {
    icon: Coffee,
    message: "Time for a quick mental break!",
    color: "text-amber-600",
  },
  {
    icon: Zap,
    message: "Energize! You're making great progress!",
    color: "text-yellow-500",
  },
  {
    icon: Heart,
    message: "Take a breath - you're doing amazing!",
    color: "text-red-500",
  },
  {
    icon: Star,
    message: "Shine on! Your input matters!",
    color: "text-purple-500",
  },
] as const;

const EnergyBreak = ({ questionNumber, onContinue }: EnergyBreakProps) => {
  const factIndex = Math.floor(questionNumber / 5) % FUN_FACTS.length;
  const energyIndex = Math.floor(questionNumber / 5) % ENERGY_MESSAGES.length;
  const energy = ENERGY_MESSAGES[energyIndex];
  const EnergyIcon = energy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-2xl mx-auto"
    >
      <Card
        variant="elevated"
        className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200"
      >
        <CardContent className="text-center py-12">
          {/* Energy Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <EnergyIcon className={`w-12 h-12 ${energy.color}`} />
            </div>
          </motion.div>

          {/* Message */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {energy.message}
          </motion.h2>

          {/* Fun Fact */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-700 mb-6"
          >
            {FUN_FACTS[factIndex]}
          </motion.p>

          {/* Energy Bar Visual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="w-3 h-12 bg-gradient-to-t from-green-400 to-green-600 rounded-full"
                  style={{ transformOrigin: "bottom" }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">Energy restored! 💚</p>
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={onContinue}
            className="px-8 py-3 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-colors shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Assessment →
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnergyBreak;
