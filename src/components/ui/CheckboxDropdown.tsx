import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface CheckboxDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  selectAllLabel?: string;
  className?: string;
  position?: "left" | "right";
}

export const CheckboxDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "All",
  selectAllLabel = "Select all",
  className = "",
  position = "right",
}: CheckboxDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  const isActive = selected.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`inline-flex items-center justify-between gap-2 w-full rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "border-brand-teal/40 bg-brand-teal/5 text-brand-teal shadow-sm shadow-brand-teal/10"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          } focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal`}
        >
          <span className="max-w-[140px] truncate text-left">
            {displayText}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            } ${isActive ? "text-brand-teal" : "text-gray-400"}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`absolute z-20 mt-2 w-80 rounded-2xl border-2 border-gray-100 bg-white shadow-2xl ${
                  position === "right" ? "right-0" : "left-0"
                }`}
                style={{
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="p-3 border-b border-gray-100 bg-linear-to-r from-brand-teal/5 to-brand-navy/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">
                      Select {label.toLowerCase()}
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-semibold text-brand-teal hover:text-brand-teal/80 transition-colors px-2 py-0.5 rounded-lg hover:bg-brand-teal/10"
                    >
                      {selected.length === options.length
                        ? "Deselect all"
                        : selectAllLabel}
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5">
                  <div className="space-y-0.5">
                    {options.map((option) => {
                      const isActive = selected.includes(option);
                      return (
                        <motion.label
                          key={option}
                          whileHover={{ x: 2 }}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all ${
                            isActive
                              ? "bg-brand-teal/10 border border-brand-teal/20"
                              : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => toggleOption(option)}
                              className="sr-only"
                            />
                            <div
                              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                                isActive
                                  ? "bg-brand-teal border-brand-teal"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`flex-1 text-sm font-medium ${
                              isActive ? "text-brand-teal" : "text-gray-700"
                            }`}
                          >
                            {option}
                          </span>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
