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
  role: "Employee" | "HoD";
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: "success" | "error" | "warning";
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""));
};

// Website validation - accepts www.example.com or https://www.example.com
export const validateWebsite = (website: string): boolean => {
  if (!website) return true; // Optional field
  // Accept formats: www.example.com, example.com, https://www.example.com, http://example.com
  const websiteRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return websiteRegex.test(website);
};

// Tab-specific validation functions

// Organization Tab Validations
export const validateOrganizationTab = (
  organizationInfo: OrganizationInfo
): ValidationResult[] => {
  const validations: ValidationResult[] = [];

  // Check mandatory organization fields
  const mandatoryOrgFields = [
    "name",
    "type",
    "size",
    "industry",
    "email",
    "phone",
    "city",
    "state",
    "country",
  ];
  const missingOrgFields = mandatoryOrgFields.filter(
    (field) => !organizationInfo[field as keyof OrganizationInfo]?.trim()
  );

  if (missingOrgFields.length === 0) {
    validations.push({
      isValid: true,
      message: "All mandatory organization fields are populated.",
      type: "success",
    });
  } else {
    validations.push({
      isValid: false,
      message: `Missing organization fields: ${missingOrgFields.join(", ")}`,
      type: "error",
    });
  }

  // Validate email format
  if (organizationInfo.email) {
    if (validateEmail(organizationInfo.email)) {
      validations.push({
        isValid: true,
        message: "Organization email format is valid.",
        type: "success",
      });
    } else {
      validations.push({
        isValid: false,
        message: "Organization email format is invalid.",
        type: "error",
      });
    }
  }

  // Validate phone format
  if (organizationInfo.phone) {
    if (validatePhone(organizationInfo.phone)) {
      validations.push({
        isValid: true,
        message: "Organization phone format is valid.",
        type: "success",
      });
    } else {
      validations.push({
        isValid: false,
        message: "Organization phone format is invalid.",
        type: "error",
      });
    }
  }

  // Validate website format (if provided)
  if (organizationInfo.website) {
    if (validateWebsite(organizationInfo.website)) {
      validations.push({
        isValid: true,
        message: "Organization website format is valid.",
        type: "success",
      });
    } else {
      validations.push({
        isValid: false,
        message: "Organization website format is invalid.",
        type: "error",
      });
    }
  }

  return validations;
};

// Departments Tab Validations
export const validateDepartmentsTab = (
  departments: Department[]
): ValidationResult[] => {
  const validations: ValidationResult[] = [];

  // Check if at least one department exists
  if (departments.length === 0) {
    validations.push({
      isValid: false,
      message: "At least one department is required.",
      type: "error",
    });
  } else {
    validations.push({
      isValid: true,
      message: `${departments.length} department(s) created.`,
      type: "success",
    });
  }

  // Check if all departments have required fields
  const invalidDepartments = departments.filter((dept) => !dept.name.trim());
  if (invalidDepartments.length === 0 && departments.length > 0) {
    validations.push({
      isValid: true,
      message: "All departments have required information.",
      type: "success",
    });
  } else if (invalidDepartments.length > 0) {
    validations.push({
      isValid: false,
      message: `${invalidDepartments.length} department(s) missing required information.`,
      type: "error",
    });
  }

  // Check for duplicate department names
  const departmentNames = departments
    .map((dept) => dept.name.toLowerCase().trim())
    .filter((name) => name);
  const duplicateNames = departmentNames.filter(
    (name, index) => departmentNames.indexOf(name) !== index
  );

  if (duplicateNames.length === 0 && departments.length > 0) {
    validations.push({
      isValid: true,
      message: "All department names are unique.",
      type: "success",
    });
  } else if (duplicateNames.length > 0) {
    validations.push({
      isValid: false,
      message: "Duplicate department names found.",
      type: "error",
    });
  }

  return validations;
};

// Employees Tab Validations
export const validateEmployeesTab = (
  employees: Employee[]
): ValidationResult[] => {
  const validations: ValidationResult[] = [];

  // Check if at least one employee exists
  if (employees.length === 0) {
    validations.push({
      isValid: false,
      message: "At least one employee is required.",
      type: "error",
    });
  } else {
    validations.push({
      isValid: true,
      message: `${employees.length} employee(s) added.`,
      type: "success",
    });
  }

  // Check if all employees have mandatory fields
  const mandatoryEmpFields = ["employeeId", "name", "email", "designation"];
  const invalidEmployees = employees.filter((emp) =>
    mandatoryEmpFields.some((field) => !emp[field as keyof Employee]?.trim())
  );

  if (invalidEmployees.length === 0 && employees.length > 0) {
    validations.push({
      isValid: true,
      message: "All employees have mandatory information.",
      type: "success",
    });
  } else if (invalidEmployees.length > 0) {
    validations.push({
      isValid: false,
      message: `${invalidEmployees.length} employee(s) missing mandatory information.`,
      type: "error",
    });
  }

  // Check email uniqueness
  const emails = employees
    .map((emp) => emp.email.toLowerCase().trim())
    .filter((email) => email);
  const duplicateEmails = emails.filter(
    (email, index) => emails.indexOf(email) !== index
  );

  if (duplicateEmails.length === 0 && employees.length > 0) {
    validations.push({
      isValid: true,
      message: "All employee email addresses are unique.",
      type: "success",
    });
  } else if (duplicateEmails.length > 0) {
    validations.push({
      isValid: false,
      message: "Duplicate employee email addresses found.",
      type: "error",
    });
  }

  // Check employee ID uniqueness
  const employeeIds = employees
    .map((emp) => emp.employeeId.trim())
    .filter((id) => id);
  const duplicateIds = employeeIds.filter(
    (id, index) => employeeIds.indexOf(id) !== index
  );

  if (duplicateIds.length === 0 && employees.length > 0) {
    validations.push({
      isValid: true,
      message: "All employee IDs are unique.",
      type: "success",
    });
  } else if (duplicateIds.length > 0) {
    validations.push({
      isValid: false,
      message: "Duplicate employee IDs found.",
      type: "error",
    });
  }

  // Check for circular reporting (within employees only)
  const circularReportingResult = validateNoCircularReporting(employees);
  validations.push(circularReportingResult);

  return validations;
};

// Check for circular reporting in hierarchy
export const validateNoCircularReporting = (
  employees: Employee[]
): ValidationResult => {
  const employeeMap = new Map(employees.map((emp) => [emp.employeeId, emp]));

  for (const employee of employees) {
    if (!employee.boss) continue; // Skip employees without boss

    const visited = new Set<string>();
    let current = employee.employeeId;

    while (current) {
      if (visited.has(current)) {
        const cycle = Array.from(visited).concat(current);
        const names = cycle
          .map((id) => employeeMap.get(id)?.name || id)
          .join(" → ");
        return {
          isValid: false,
          message: `Circular reporting detected in hierarchy: ${names}`,
          type: "error",
        };
      }

      visited.add(current);
      const currentEmployee = employeeMap.get(current);
      current = currentEmployee?.boss || "";
    }
  }

  return {
    isValid: true,
    message: "No circular reporting detected in hierarchy.",
    type: "success",
  };
};

// Tab-specific validation function
export const validateTabSpecific = (
  activeTab: string,
  organizationInfo: OrganizationInfo,
  departments: Department[],
  employees: Employee[]
): ValidationResult[] => {
  switch (activeTab) {
    case "organization":
      return validateOrganizationTab(organizationInfo);
    case "departments":
      return validateDepartmentsTab(departments);
    case "employees":
      return validateEmployeesTab(employees);
    default:
      return [];
  }
};

// Overall validation for save button
export const validateOverallSetup = (
  organizationInfo: OrganizationInfo,
  departments: Department[],
  employees: Employee[]
): boolean => {
  const orgValidations = validateOrganizationTab(organizationInfo);
  const deptValidations = validateDepartmentsTab(departments);
  const empValidations = validateEmployeesTab(employees);

  const allValidations = [
    ...orgValidations,
    ...deptValidations,
    ...empValidations,
  ];
  return allValidations.every((v) => v.isValid);
};
