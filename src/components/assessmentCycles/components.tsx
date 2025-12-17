// Shared components for assessment cycle management
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/commonUtils";
interface DepartmentBadgeProps {
  department: string;
  isActive: boolean;
  onClick?: () => void;
  variant?: "button" | "display";
}

const BASE_CLASSES =
  "rounded-full border px-3 py-1 text-xs font-semibold transition-all";
const ACTIVE_CLASSES =
  "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm";
const INACTIVE_CLASSES = "border-gray-200 text-gray-600 hover:border-gray-300";

export const DepartmentBadge = ({
  department,
  isActive,
  onClick,
  variant = "button",
}: DepartmentBadgeProps) => {
  if (variant === "display") {
    return (
      <span className={cn(BASE_CLASSES, ACTIVE_CLASSES)}>{department}</span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(BASE_CLASSES, isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES)}
    >
      {department}
    </button>
  );
};

interface DepartmentSelectorProps {
  departments: string[];
  selected: string[];
  onToggle: (dept: string) => void;
  onSelectAll?: () => void;
  showSelectAll?: boolean;
  label?: string;
}

export const DepartmentSelector = ({
  departments,
  selected,
  onToggle,
  onSelectAll,
  showSelectAll = false,
  label = "Departments",
}: DepartmentSelectorProps) => {
  const isAllSelected =
    departments.length > 0 &&
    departments.every((dept) => selected.includes(dept));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase text-gray-500">
          {label}
        </label>
        {showSelectAll && onSelectAll && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] font-semibold text-brand-teal"
          >
            {isAllSelected ? "Deselect all" : "Select all"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <DepartmentBadge
            key={dept}
            department={dept}
            isActive={selected.includes(dept)}
            onClick={() => onToggle(dept)}
          />
        ))}
      </div>
    </div>
  );
};

interface Employee {
  id: string;
  name: string;
  title: string;
}

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onToggle: () => void;
}

export const EmployeeCard = ({
  employee,
  isSelected,
  onToggle,
}: EmployeeCardProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all",
      isSelected
        ? "border-brand-teal bg-brand-teal/10"
        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
    )}
  >
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase text-gray-500">
      {getInitials(employee.name)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-semibold text-gray-900">
        {employee.name}
      </p>
      <p className="truncate text-[11px] text-gray-500">{employee.title}</p>
    </div>
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all",
        isSelected
          ? "border-brand-teal bg-brand-teal text-white"
          : "border-gray-300 bg-white text-transparent"
      )}
    >
      {isSelected ? "✓" : ""}
    </span>
  </button>
);

