import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}

export const FilterSelect = ({
  value,
  onChange,
  options,
  className = "",
}: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActive = value !== options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;

      // Calculate position - Always show below the button
      const top = buttonRect.bottom + 8; // mt-2 = 8px
      const left = buttonRect.left;
      const width = buttonRect.width;

      setDropdownPosition({ top, left, width });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`inline-flex items-center justify-between gap-2 w-full rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "border-brand-teal/50 bg-brand-teal/5 text-brand-teal shadow-sm"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          } focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal`}
        >
          <span className="flex-1 text-left truncate font-semibold">{value}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            } ${isActive ? "text-brand-teal" : "text-gray-400"}`}
          />
        </button>
      </div>
      {isOpen && dropdownPosition && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/5"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-2xl border-2 border-gray-100 bg-white shadow-xl overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: "320px",
            }}
          >
            <div className="h-1 bg-linear-to-r from-brand-teal via-brand-navy to-brand-teal" />
            <div className="max-h-80 overflow-y-auto p-1.5 filter-select-scrollbar">
              <div className="space-y-0.5">
                {options.map((option) => {
                  const isSelected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 transition-all duration-150 text-left whitespace-nowrap ${
                        isSelected
                          ? "bg-linear-to-r from-brand-teal to-brand-navy text-white"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex-1 text-sm font-medium">
                        {option}
                      </span>
                      {isSelected && (
                        <div className="rounded-full bg-white/20 p-0.5">
                          <Check
                            className="h-3.5 w-3.5 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
