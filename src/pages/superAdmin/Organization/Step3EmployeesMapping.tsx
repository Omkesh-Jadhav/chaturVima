import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";
import { validateEmail, validateTextOnly, validateDesignation } from "./validationUtils";
import type { Employee, Department } from "./types";
import { Button, Input, FilterSelect } from "@/components/ui";
import { useCreateEmployee, useGetEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal";
import EmployeeEditModal from "@/components/EmployeeEditModal";


interface Step3EmployeesMappingProps {
  employees: Employee[];
  departments: Department[];
  onUpdate: (employees: Employee[]) => void;
  onEmployeesChange?: (employees: Employee[]) => void;
}

const Step3EmployeesMapping: React.FC<Step3EmployeesMappingProps> = ({
  employees,
  departments,
  onUpdate,
  onEmployeesChange,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    company_email: "",
    gender: "",
    dateOfBirth: "",
    dateOfJoining: "",
    designation: "",
    department: "",
    reports_to: "",
    boss: "",
    role: "Employee" as "Employee" | "HoD",
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query hooks
  const createEmployeeMutation = useCreateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const { data: apiEmployees, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployees(departmentFilter);
  const { data: fetchedDepartments = [], isLoading: isLoadingDepartments } = useDepartments();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-populate name field when firstName or lastName changes
      if (field === "firstName" || field === "lastName") {
        const firstName = field === "firstName" ? value : prev.firstName;
        const lastName = field === "lastName" ? value : prev.lastName;
        updated.name = `${firstName} ${lastName}`.trim();
      }

      return updated;
    });
    
    // Validate text fields in real-time
    if (field === "firstName" || field === "lastName" || field === "designation") {
      validateField(field, value);
    } else {
      // Clear field error when user starts typing for other fields
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "email":
        if (value && !validateEmail(value)) {
          error = "Please enter a valid email address";
        } else if (value) {
          // Check for duplicate emails
          const isDuplicate = employees.some(
            (emp) =>
              emp.email.toLowerCase() === value.toLowerCase()
          );
          if (isDuplicate) {
            error = "This email address is already in use";
          }
        }
        break;
      case "firstName":
        if (value && !validateTextOnly(value)) {
          error = "First name should only contain letters, spaces, hyphens, and apostrophes";
        }
        break;
      case "lastName":
        if (value && !validateTextOnly(value)) {
          error = "Last name should only contain letters, spaces, hyphens, and apostrophes";
        }
        break;
      case "designation":
        if (value && !validateDesignation(value)) {
          error = "Designation should only contain letters, numbers, spaces, hyphens, and apostrophes";
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleAddEmployee = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    )
      return;

    // Validate all fields before adding
    const emailValid = validateField("email", formData.email);

    if (!emailValid) {
      return;
    }

    try {
      const employeeData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        employee_name: formData.name.trim(),
        company: "Chaturvima",
        email: formData.email.trim(),
        company_email: formData.email.trim(),
        department: formData.department,
        gender: formData.gender,
        role_profile: formData.role,
        designation: formData.designation.trim() || "Employee",
        date_of_birth: formData.dateOfBirth,
        date_of_joining: formData.dateOfJoining,
        reports_to: formData.reports_to || ""
      };

      await createEmployeeMutation.mutateAsync(employeeData);

      // Clear form fields on success
      setFormData({
        firstName: "",
        lastName: "",
        name: "",
        email: "",
        company_email: "",
        gender: "",
        dateOfBirth: "",
        dateOfJoining: "",
        designation: "",
        department: "",
        reports_to: "",
        boss: "",
        role: "Employee",
      });
      setFieldErrors({});
    } catch (error) {
      console.error("Failed to create employee:", error);
      // You might want to show a toast notification here
    }
  };

  const handleEditEmployee = (id: string) => {
    // Find employee from the actual displayed list (API or props)
    const allEmployees = getFilteredEmployees();
    const employee = allEmployees.find((e) => e.id === id);
    if (employee) {
      setEmployeeToEdit(employee);
      setIsEditModalOpen(true);
    }
  };


  const handleDeleteEmployee = async (id: string) => {
    // Find employee from the actual displayed list (API or props)
    const allEmployees = getFilteredEmployees();
    const employee = allEmployees.find((e) => e.id === id);
    
    if (!employee) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete ${employee.name}?`);
    if (!confirmed) return;

    try {
      // Call API to delete employee using employee name/ID
      await deleteEmployeeMutation.mutateAsync(employee.employeeId || employee.id);

      // Update local state by removing the employee
      const updatedEmployees = employees.filter((emp) => emp.id !== id);
      onUpdate(updatedEmployees);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      // You might want to show a toast notification here
    }
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate file processing and validation
    const errors = [
      "Row 3: Invalid email format",
      "Row 5: Duplicate Employee ID",
      "Row 8: Missing required field: Name",
    ];

    setUploadErrors(errors);

    // In a real implementation, you would parse the CSV/Excel file here
    // and add valid employees to the list
  };

  const downloadTemplate = () => {
    // In a real implementation, this would download an actual CSV template
    const csvContent =
      "Employee ID,Name,Email,Designation,Department,Reporting Manager\nEMP001,John Doe,john@example.com,Software Engineer,Engineering,Jane Smith";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAvailableBosses = () => {
    // Get all employees (API data or props data)
    const allEmployees = getFilteredEmployees();
    return allEmployees.filter((emp) => emp.role === "HoD");
  };

  const getAvailableDepartments = useCallback(() => {
    // Use API data if available, otherwise fall back to props data
    if (fetchedDepartments.length > 0) {
      return fetchedDepartments;
    }
    return departments;
  }, [fetchedDepartments, departments]);

  const handleEmployeeNameClick = (employeeName: string) => {
    setSelectedEmployeeName(employeeName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeName("");
  };

  const handleSaveEmployeeEdit = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    onUpdate(updatedEmployees);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEmployeeToEdit(null);
  };

  // Map API response to Employee format
  const mapApiToEmployeeFormat = (apiData: Array<{
    name: string;
    employee_name: string;
    user_id: string | null;
    role_profile?: string;
    company_email?: string;
    email?: string;
    designation: string;
    department?: string;
    reports_to?: string;
  }>) => {
    return apiData.map((emp, index) => ({
      id: emp.name || `api-emp-${index}`,
      employeeId: emp.name || '',
      name: emp.employee_name || '',
      email: emp.user_id || emp.company_email || '',
      role: (emp.role_profile as 'Employee' | 'HoD') || 'HoD',
      department: emp.department || '',
      designation: emp.designation || '',
      boss: emp.reports_to || '',
      reports_to: emp.reports_to || '',
    }));
  };

  const getFilteredEmployees = useCallback(() => {
    // Use API data if available, otherwise fall back to props data
    if (apiEmployees?.data) {
      return mapApiToEmployeeFormat(apiEmployees.data);
    }
    
    // Fallback to props data with filter
    if (!departmentFilter) {
      return employees;
    }
    return employees.filter((employee) => employee.department === departmentFilter);
  }, [apiEmployees, employees, departmentFilter]);

  // Notify parent component when actual employees change for validation
  useEffect(() => {
    const actualEmployees = getFilteredEmployees();
    if (onEmployeesChange) {
      onEmployeesChange(actualEmployees);
    }
  }, [apiEmployees, employees, departmentFilter, onEmployeesChange, getFilteredEmployees]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Employee Setup
      </h2>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <Button
            onClick={() => setShowBulkUpload(false)}
            variant={!showBulkUpload ? "gradient" : "outline"}
            size="sm"
          >
            Manual Entry
          </Button>
          <Button
            onClick={() => setShowBulkUpload(true)}
            variant={showBulkUpload ? "gradient" : "outline"}
            size="sm"
          >
            Bulk Upload
          </Button>
        </div>

        {showBulkUpload ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag & Drop Excel/CSV here or
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="gradient"
                size="sm"
              >
                Browse
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Download Employee Data Template
            </Button>

            {uploadErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {uploadErrors.length} rows failed
                  </span>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {uploadErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-800 hover:text-red-900 mt-2"
                >
                  Download error log
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange("firstName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.firstName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-brand-teal"
                }`}
                placeholder="e.g., John"
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange("lastName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.lastName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-brand-teal"
                }`}
                placeholder="e.g., Doe"
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.name}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                placeholder="Auto-generated from first and last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={(e) => validateField("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-brand-teal"
                  }`}
                placeholder="e.g., john.doe@company.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <FilterSelect
                value={formData.gender || "Select Gender"}
                onChange={(value) =>
                  handleInputChange(
                    "gender",
                    value === "Select Gender" ? "" : value
                  )
                }
                className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                options={["Select Gender", "Male", "Female", "Other"]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Joining
              </label>
              <Input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) =>
                  handleInputChange("dateOfJoining", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <Input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.designation
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-brand-teal"
                }`}
                placeholder="e.g., Software Engineer"
              />
              {fieldErrors.designation && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <FilterSelect
                value={formData.role}
                onChange={(value) => handleInputChange("role", value)}
                className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                options={["Employee", "HoD"]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <FilterSelect
                value={formData.department || "Select Department"}
                onChange={(value) =>
                  handleInputChange(
                    "department",
                    value === "Select Department" ? "" : value
                  )
                }
                className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                options={[
                  "Select Department",
                  ...getAvailableDepartments().map((dept) => dept.name),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting To
              </label>
              <FilterSelect
                value={formData.boss || "Select Reporting Manager"}
                onChange={(value) =>
                  handleInputChange(
                    "boss",
                    value === "Select Reporting Manager" ? "" : value
                  )
                }
                className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                options={[
                  "Select Reporting Manager",
                  ...getAvailableBosses().map((emp) => emp.name),
                ]}
              />
            </div>
          </div>
        )}

        {!showBulkUpload && (
          <div className="mb-6">
            <Button
              onClick={handleAddEmployee}
              variant="gradient"
              size="sm"
              disabled={createEmployeeMutation.isPending || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
            >
              <Plus className="w-4 h-4" />
              {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {(isLoadingEmployees || isLoadingDepartments) && (
        <div className="mb-6 text-center py-8">
          <div className="text-gray-500">
            {isLoadingEmployees && isLoadingDepartments 
              ? "Loading employees and departments..." 
              : isLoadingEmployees 
                ? "Loading employees..." 
                : "Loading departments..."}
          </div>
        </div>
      )}

      {/* Error state */}
      {employeesError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            Error loading employees: {employeesError.message}
          </div>
        </div>
      )}

      {/* Delete Error State */}
      {deleteEmployeeMutation.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            Failed to delete employee. Please try again.
          </div>
        </div>
      )}

      {/* Employee table - show if we have API data or fallback prop data */}
      {(apiEmployees?.data?.length > 0 || employees.length > 0) && !isLoadingEmployees && (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Department:
            </label>
            <FilterSelect
              value={departmentFilter || "All Departments"}
              onChange={(value) => 
                setDepartmentFilter(value === "All Departments" ? "" : value)
              }
              className="w-64 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              options={[
                "All Departments",
                ...getAvailableDepartments().map((dept) => dept.name),
              ]}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Designation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reporting Manager
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredEmployees().map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {employee.employeeId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleEmployeeNameClick(employee.employeeId)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {employee.name}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {employee.designation}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${employee.role === "HoD"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {employee.department}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {employee.reports_to || employee.boss || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditEmployee(employee.id)}
                          variant="ghost"
                          size="xs"
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={deleteEmployeeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employeeName={selectedEmployeeName}
      />

      {/* Employee Edit Modal */}
      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        employee={employeeToEdit}
        departments={getAvailableDepartments()}
        availableBosses={getAvailableBosses()}
        onSave={handleSaveEmployeeEdit}
        existingEmployees={getFilteredEmployees()}
      />
    </div>
  );
};

export default Step3EmployeesMapping;
