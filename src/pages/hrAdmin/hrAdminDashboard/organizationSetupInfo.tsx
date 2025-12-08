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

      <div className="mt-4 space-y-4">
        {/* Departments */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-brand-teal shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900">
              Departments ({DUMMY_DEPARTMENTS.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {DUMMY_DEPARTMENTS.map((dept, index) => (
              <Button key={index} variant="outline" size="xs">
                {dept}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Employee Mapping */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-brand-teal shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900">
              Employee Mapping
            </h3>
          </div>
          <div className="pl-6">
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
