/**
 * Button Component
 * Reusable button with variants, sizes, and smooth animations
 */
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "gradient";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      primary:
        "bg-brand-teal text-white hover:bg-brand-teal/90 focus-visible:ring-brand-teal shadow-sm hover:shadow-md",
      secondary:
        "bg-brand-navy text-white hover:bg-brand-navy/90 focus-visible:ring-brand-navy shadow-sm hover:shadow-md",
      gradient:
        "bg-linear-to-r from-brand-teal to-brand-navy text-white hover:from-brand-teal/90 hover:to-brand-navy/90 focus-visible:ring-brand-teal shadow-md hover:shadow-lg",
      outline:
        "border-1 border-brand-teal/100 hover:bg-brand-teal/10 hover:border-brand-teal",
      ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm hover:shadow-md",
    };

    const sizes = {
      xs: "text-xs px-3 py-1.5 rounded-lg",
      sm: "text-sm px-3 py-1.5 h-8 rounded-lg",
      md: "text-base px-4 py-2 h-10 rounded-xl",
      lg: "text-lg px-6 py-3 h-12 rounded-2xl",
    };

    // Check if button should be full width
    const isFullWidth =
      className?.includes("w-full") || props.style?.width === "100%";
    const wrapperClassName = isFullWidth ? "w-full" : "inline-block";

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={wrapperClassName}
      >
        <button
          ref={ref}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </>
          ) : (
            children
          )}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

export default Button;
