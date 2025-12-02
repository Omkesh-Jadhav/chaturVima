import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
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
  extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants"> {
  children: ReactNode;
  animation?: AnimationType;
  delay?: DelayType | number;
  transition?: TransitionType;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer";
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
  transition = "normal",
  className,
  as: Component = "div",
  ...props
}: AnimatedContainerProps) => {
  const delayValue = typeof delay === "number" ? delay : animationDelays[delay];
  const transitionValue = transitions[transition];

  return (
    <motion.div
      as={Component}
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
