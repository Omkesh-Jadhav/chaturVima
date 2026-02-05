import { useState, useEffect } from "react";
import TabNavigation from "./TabNavigation";
import Step1OrganizationInfo from "./Step1OrganizationInfo";
import Step2Departments from "./Step2Departments";
import Step3EmployeesMapping from "./Step3EmployeesMapping";
import ValidationStatus from "./ValidationStatus";
import { validateTabSpecific } from "./validationUtils";
import type { OrganizationInfo, Department, Employee, ValidationResult } from "./types";


const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState("organization");
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: "",
    company_name: "",
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
  const [actualEmployees, setActualEmployees] = useState<Employee[]>([]);
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
      activeTab === "employees" ? actualEmployees : employees
    );
    setTabValidations(validations);
  }, [activeTab, organizationInfo, departments, employees, actualEmployees]);


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
            onEmployeesChange={setActualEmployees}
            organizationName={organizationInfo.company_name || organizationInfo.name}
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

      <div className={activeTab === "departments" || activeTab === "employees" ? "w-full" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}>
        <div className={activeTab === "departments" || activeTab === "employees" ? "w-full" : "lg:col-span-2"}>
          {renderActiveTab()}
        </div>

        {activeTab !== "departments" && activeTab !== "employees" && (
          <div className="lg:col-span-1">
            <ValidationStatus
              validationResults={tabValidations}
              tabName={getTabDisplayName(activeTab)}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default OrganizationSetup;
