import { Building2, Users } from "lucide-react";
import { AnimatedContainer, Button } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

// Dummy data
const DUMMY_DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
];

// Total employees (mix of bulk upload + manual upload)
const DUMMY_EMPLOYEE_COUNT = 76;

const OrganizationSetupInfo = () => {
  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Organization Setup"
        description="Departments and employee mapping information"
      />

      <div className="mt-2.5 space-y-2.5">
        {/* Departments */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-teal to-brand-navy text-white shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Departments ({DUMMY_DEPARTMENTS.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-10">
            {DUMMY_DEPARTMENTS.map((dept, index) => (
              <Button key={index} variant="outline" size="xs" className="text-xs">
                {dept}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 my-1" />

        {/* Employee Mapping */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-teal to-brand-navy text-white shadow-sm">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Employee Mapping
            </h3>
          </div>
          <div className="pl-10">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold text-gray-900">
                {DUMMY_EMPLOYEE_COUNT}
              </strong>{" "}
              employees mapped
            </p>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default OrganizationSetupInfo;
