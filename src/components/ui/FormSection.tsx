import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  editable?: boolean;
  iconColor?: string;
  className?: string;
}

export const FormSection = ({
  icon: Icon,
  title,
  children,
  editable,
  iconColor = "from-brand-teal to-brand-navy",
  className = "",
}: FormSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div
          className={`rounded-lg bg-linear-to-br ${iconColor} p-2 text-white shadow-sm`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {editable && (
          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
            Editable
          </span>
        )}
      </div>
      {children}
    </div>
  );
};
