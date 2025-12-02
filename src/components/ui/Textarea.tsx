import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterCount?: {
    current: number;
    max: number;
  };
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, helperText, characterCount, id, ...props },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium transition-colors",
            "placeholder:text-gray-400 placeholder:font-normal",
            "focus:outline-none focus:ring-0 focus:border-gray-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none shadow-sm",
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-400"
              : "border-gray-200",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between px-1 mt-1">
          {error && (
            <p className="text-xs font-medium text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}
          {characterCount && !error && (
            <p className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {characterCount.current}/{characterCount.max} characters
            </p>
          )}
          {helperText && !error && !characterCount && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
