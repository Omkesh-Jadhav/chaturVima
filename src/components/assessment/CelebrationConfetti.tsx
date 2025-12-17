/**
 * Celebration Confetti Component
 * 
 * Displays confetti animation for milestone celebrations.
 * Uses react-confetti library for animated particle effects.
 */
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "../../hooks/useWindowSize";

interface CelebrationConfettiProps {
  trigger: boolean;
  duration?: number;
}

const CelebrationConfetti = ({
  trigger,
  duration = 3000,
}: CelebrationConfettiProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
    />
  );
};

export default CelebrationConfetti;
