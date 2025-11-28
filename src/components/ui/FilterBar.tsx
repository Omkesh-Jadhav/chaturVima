import { Filter } from "lucide-react";
import { SearchInput } from "./SearchInput";
import type { SearchInputProps } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";
import { CheckboxDropdown } from "./CheckboxDropdown";

export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export interface CheckboxFilterConfig {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export interface FilterBarProps {
  search: SearchInputProps;
  filters?: FilterConfig[];
  checkboxFilters?: CheckboxFilterConfig[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
}

export const FilterBar = ({
  search,
  filters = [],
  checkboxFilters = [],
  onClearFilters,
  showClearButton = true,
  className = "",
}: FilterBarProps) => {
  const hasActiveFilters =
    filters.some((f) => f.value !== f.options[0]) ||
    checkboxFilters.some((f) => f.selected.length > 0);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <SearchInput {...search} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <FilterSelect
              key={filter.label}
              label={filter.label}
              value={filter.value}
              onChange={filter.onChange}
              options={filter.options}
            />
          ))}
          {checkboxFilters.map((filter) => (
            <CheckboxDropdown
              key={filter.label}
              label={filter.label}
              options={filter.options}
              selected={filter.selected}
              onChange={filter.onChange}
              placeholder={filter.placeholder}
            />
          ))}
        </div>
      </div>
      {showClearButton && hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-brand-teal hover:bg-brand-teal/10 transition-all duration-200"
        >
          <Filter className="h-3 w-3" />
          Clear all filters
        </button>
      )}
    </div>
  );
};
