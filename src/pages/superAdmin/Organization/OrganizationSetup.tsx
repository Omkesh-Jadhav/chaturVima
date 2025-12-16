import { useState, useEffect } from "react";
import TabNavigation from "./TabNavigation";
import Step1OrganizationInfo from "./Step1OrganizationInfo";
import Step2Departments from "./Step2Departments";
import Step3EmployeesMapping from "./Step3EmployeesMapping";
import ValidationStatus from "./ValidationStatus";
import { validateTabSpecific, validateOverallSetup } from "./validationUtils";
import type { OrganizationInfo, Department, Employee, ValidationResult } from "./types";
import { Button } from "@/components/ui";
import { useUser } from "@/context/UserContext";


const OrganizationSetup = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("organization");
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: "",
    type: "",
    size: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tabValidations, setTabValidations] = useState<ValidationResult[]>([]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Update validation whenever data changes or active tab changes
  useEffect(() => {
    const validations = validateTabSpecific(
      activeTab,
      organizationInfo,
      departments,
      employees
    );
    setTabValidations(validations);
  }, [activeTab, organizationInfo, departments, employees]);

  const handleSave = () => {
    const allValid = validateOverallSetup(
      organizationInfo,
      departments,
      employees
    );

    if (!allValid) {
      alert("Please fix all validation errors before saving.");
      return;
    }

    // Handle final save logic here
    console.log("Saving organization setup:", {
      organizationInfo,
      departments,
      employees,
    });
    // You can add API calls or navigation logic here
    alert("Organization setup saved successfully!");
  };

  const getTabDisplayName = (tab: string) => {
    switch (tab) {
      case "organization":
        return "Organization Info";
      case "departments":
        return "Departments";
      case "employees":
        return "Employees";
      default:
        return "";
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "organization":
        return (
          <Step1OrganizationInfo
            data={organizationInfo}
            onUpdate={setOrganizationInfo}
          />
        );
      case "departments":
        return (
          <Step2Departments
            departments={departments}
            onUpdate={setDepartments}
          />
        );
      case "employees":
        return (
          <Step3EmployeesMapping
            employees={employees}
            departments={departments}
            onUpdate={setEmployees}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Organisation Setup
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Set up your organization structure, departments, and employee
            hierarchy
          </p>
        </div>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">{renderActiveTab()}</div>

        <div className="lg:col-span-1">
          <ValidationStatus
            validationResults={tabValidations}
            tabName={getTabDisplayName(activeTab)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            user?.role === "hr-admin" ||
            !validateOverallSetup(organizationInfo, departments, employees)
          }
          variant="gradient"
          size="md"
        >
          {user?.role === "hr-admin" ? "Save" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationSetup;
