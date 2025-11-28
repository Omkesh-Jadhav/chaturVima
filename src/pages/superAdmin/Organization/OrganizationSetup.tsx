import { useState, useEffect } from 'react';
import TabNavigation from './TabNavigation';
import Step1OrganizationInfo from './Step1OrganizationInfo';
import Step2Departments from './Step2Departments';
import Step3EmployeesMapping from './Step3EmployeesMapping';
import ValidationStatus from './ValidationStatus';
import { validateTabSpecific, validateOverallSetup } from './validationUtils';
import type { ValidationResult } from './validationUtils';

interface OrganizationInfo {
  name: string;
  type: string;
  size: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  boss: string;
  role: 'Employee' | 'Administration';
}

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('organization');
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: '',
    type: '',
    size: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tabValidations, setTabValidations] = useState<ValidationResult[]>([]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Update validation whenever data changes or active tab changes
  useEffect(() => {
    const validations = validateTabSpecific(activeTab, organizationInfo, departments, employees);
    setTabValidations(validations);
  }, [activeTab, organizationInfo, departments, employees]);

  const handleSave = () => {
    const allValid = validateOverallSetup(organizationInfo, departments, employees);
    
    if (!allValid) {
      alert('Please fix all validation errors before saving.');
      return;
    }
    
    // Handle final save logic here
    console.log('Saving organization setup:', {
      organizationInfo,
      departments,
      employees,
    });
    // You can add API calls or navigation logic here
    alert('Organization setup saved successfully!');
  };

  const getTabDisplayName = (tab: string) => {
    switch (tab) {
      case 'organization':
        return 'Organization Info';
      case 'departments':
        return 'Departments';
      case 'employees':
        return 'Employees';
      default:
        return '';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <Step1OrganizationInfo
            data={organizationInfo}
            onUpdate={setOrganizationInfo}
          />
        );
      case 'departments':
        return (
          <Step2Departments
            departments={departments}
            onUpdate={setDepartments}
          />
        );
      case 'employees':
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organisation Setup</h1>
          <p className="text-gray-600">Set up your organization structure, departments, and employee hierarchy</p>
        </div>
        
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderActiveTab()}
          </div>
          
          <div className="lg:col-span-1">
            <ValidationStatus 
              validationResults={tabValidations} 
              tabName={getTabDisplayName(activeTab)}
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!validateOverallSetup(organizationInfo, departments, employees)}
            className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 ${
              validateOverallSetup(organizationInfo, departments, employees)
                ? 'bg-brand-teal text-white hover:bg-brand-teal/90 focus:ring-brand-teal'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Organization Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetup;