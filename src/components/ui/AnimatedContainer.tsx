import { motion } from "framer-motion";
import type { ReactNode, ComponentProps } from "react";
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  fadeIn,
  transitions,
  animationDelays,
} from "../../utils/animations";
import { cn } from "../../utils/cn";

type AnimationType =
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "scaleIn"
  | "fadeIn";

type DelayType = keyof typeof animationDelays;
type TransitionType = keyof typeof transitions;

interface AnimatedContainerProps
  extends Omit<
    ComponentProps<typeof motion.div>,
    "initial" | "animate" | "variants" | "transition"
  > {
  children: ReactNode;
  animation?: AnimationType;
  delay?: DelayType | number;
  transitionPreset?: TransitionType;
  className?: string;
}

const animationVariants = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  fadeIn,
};

export const AnimatedContainer = ({
  children,
  animation = "fadeInUp",
  delay = "none",
  transitionPreset = "normal",
  className,
  ...props
}: AnimatedContainerProps) => {
  const delayValue = typeof delay === "number" ? delay : animationDelays[delay];
  const transitionValue = transitions[transitionPreset];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationVariants[animation]}
      transition={{
        ...transitionValue,
        delay: delayValue,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
