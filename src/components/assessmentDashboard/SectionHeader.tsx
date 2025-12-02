/**
 * Section Header Component
 * Reusable header for dashboard sections
 */

interface SectionHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader = ({
  title,
  description,
  actions,
}: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    {actions && <div>{actions}</div>}
  </div>
);
