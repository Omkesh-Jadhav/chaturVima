import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState } from "react";

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  className?: string;
  showResultCount?: boolean;
};

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  resultCount,
  className = "",
  showResultCount = false,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group w-full sm:w-auto ${className}`}
    >
      <div className="relative flex items-center">
        <Search
          className={`absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none transition-colors z-10 ${
            isFocused ? "text-brand-teal" : ""
          }`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-9 w-full sm:w-64 md:w-72 pl-10 pr-10 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all shadow-sm hover:shadow-md hover:border-gray-300"
        />
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange("")}
            className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </div>
      {value && showResultCount && resultCount !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-1.5 px-2 py-0.5 rounded-md bg-brand-teal/10 text-[10px] font-semibold text-brand-teal backdrop-blur-sm"
        >
          {resultCount} result{resultCount !== 1 ? "s" : ""} found
        </motion.div>
      )}
    </motion.div>
  );
};
