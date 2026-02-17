/**
 * Button Component
 * Reusable button with variants & sizes — hover only changes bg via Tailwind
 */
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
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
      "inline-flex items-center justify-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none transition-colors duration-150";

    const variants = {
      primary:
        "bg-brand-teal text-white hover:bg-brand-teal/80 focus-visible:ring-brand-teal shadow-sm",
      secondary:
        "bg-brand-navy text-white hover:bg-brand-navy/80 focus-visible:ring-brand-navy shadow-sm",
      gradient:
        "bg-gradient-to-r from-brand-teal to-brand-navy text-white hover:from-brand-teal/80 hover:to-brand-navy/80 focus-visible:ring-brand-teal shadow-md",
      outline:
        "border border-brand-teal/70 text-brand-teal hover:bg-brand-teal/10 hover:border-brand-teal focus-visible:ring-brand-teal",
      ghost:
        "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm",
    };

    const sizes = {
      xs: "text-xs px-3 py-1.5 rounded-lg",
      sm: "text-sm px-4 py-2 rounded-lg h-9",
      md: "text-base px-5 py-2.5 rounded-xl h-10",
      lg: "text-lg px-6 py-3 rounded-2xl h-12",
    };

    return (
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
    );
  }
);

Button.displayName = "Button";

export default Button;