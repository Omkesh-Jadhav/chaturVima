import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[] | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  helperText?: string;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  error,
  helperText,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Extract width classes from className if provided
  const widthMatch = className?.match(/(w-|min-w-|max-w-)[^\s]*/);
  const widthClass = widthMatch ? widthMatch[0] : "w-full";
  const otherClasses = className
    ?.replace(/(w-|min-w-|max-w-)[^\s]*/g, "")
    .trim();

  return (
    <div className={cn(widthClass, otherClasses)}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className={cn(
            "inline-flex h-10 w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-0",
            disabled
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-600"
              : error
              ? "border-red-300 focus:border-red-400"
              : "border-brand-teal/40 text-gray-800 hover:border-brand-teal/60 cursor-pointer"
          )}
        >
          <span className="flex items-center gap-2 flex-1 text-left truncate">
            {selectedOption?.icon}
            <span>{selectedOption?.label || placeholder}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-brand-teal transition-transform duration-200 shrink-0",
              isOpen && "rotate-180",
              disabled && "text-gray-400"
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && !disabled && (
            <>
              <div
                className="fixed inset-0 z-10 bg-black/5"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-xl"
              >
                <div className="h-1 bg-linear-to-r from-brand-teal via-brand-navy to-brand-teal" />
                <div className="max-h-80 overflow-y-auto p-1.5">
                  <div className="space-y-0.5">
                    {normalizedOptions.map((option) => {
                      const isSelected = value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          className={cn(
                            "w-full flex items-center justify-between gap-2 rounded-lg px-4 py-2.5 transition-all duration-150 text-left",
                            isSelected
                              ? "bg-linear-to-r from-brand-teal/20 to-brand-navy/20 text-brand-navy border-l-4 border-brand-teal"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <span className="flex items-center gap-2 flex-1">
                            {option.icon}
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                          </span>
                          {isSelected && (
                            <div className="rounded-full bg-brand-teal/20 p-0.5">
                              <Check
                                className="h-3.5 w-3.5 text-brand-teal"
                                strokeWidth={2.5}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
