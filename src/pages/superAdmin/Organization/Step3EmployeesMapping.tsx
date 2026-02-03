import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Edit, Trash2, Plus, Upload, Download, AlertCircle, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { validateEmail, validateTextOnly, validateDesignation, validateDateOfBirthBeforeJoining } from "./validationUtils";
import type { Employee, Department } from "./types";
import { Button, Input, FilterSelect, CalendarInput, Pagination, PaginationInfo, Badge } from "@/components/ui";
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

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  dateOfJoining: "",
  designation: "",
  department: "",
  reports_to: "",
  role: "Employee" as "Employee" | "Department Head",
};

const Step3EmployeesMapping: React.FC<Step3EmployeesMappingProps> = ({
  employees,
  departments,
  onUpdate,
  onEmployeesChange,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEmployeeMutation = useCreateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const { data: apiEmployees, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployees(departmentFilter);
  const { data: fetchedDepartments = [], isLoading: isLoadingDepartments } = useDepartments();

  // Consolidated validation
  const validateField = useCallback((field: string, value: string) => {
    let error = "";
    const trimmedValue = value.trim();

    switch (field) {
      case "email":
        if (trimmedValue && !validateEmail(trimmedValue)) {
          error = "Please enter a valid email address";
        } else if (trimmedValue && employees.some(emp => emp.email.toLowerCase() === trimmedValue.toLowerCase())) {
          error = "This email address is already in use";
        }
        break;
      case "firstName":
      case "lastName":
        if (trimmedValue && !validateTextOnly(trimmedValue)) {
          error = `${field === "firstName" ? "First" : "Last"} name should only contain letters, spaces, hyphens, and apostrophes`;
        }
        break;
      case "designation":
        if (trimmedValue && !validateDesignation(trimmedValue)) {
          error = "Designation should only contain letters, numbers, spaces, hyphens, and apostrophes";
        }
        break;
      case "department":
        if (!trimmedValue || trimmedValue === "Select Department") {
          error = "Please select a department";
        }
        break;
      case "gender":
        if (!trimmedValue || trimmedValue === "Select Gender") {
          error = "Please select a gender";
        }
        break;
      case "dateOfBirth":
        if (!trimmedValue) {
          error = "Please select date of birth";
        } else {
          const selectedDate = new Date(trimmedValue);
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          if (selectedDate >= currentDate) {
            error = "Date of birth must be earlier than current date";
          }
        }
        break;
      case "dateOfJoining":
        if (!trimmedValue) {
          error = "Please select date of joining";
        } else if (formData.dateOfBirth && !validateDateOfBirthBeforeJoining(formData.dateOfBirth, trimmedValue)) {
          error = "Date of joining must be after date of birth";
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  }, [employees, formData.dateOfBirth]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "firstName" || field === "lastName") {
        const firstName = field === "firstName" ? value : prev.firstName;
        const lastName = field === "lastName" ? value : prev.lastName;
        updated.name = `${firstName} ${lastName}`.trim();
      }
      return updated;
    });

    if (["firstName", "lastName", "designation", "email"].includes(field)) {
      validateField(field, value);
    } else if (["department", "gender", "dateOfBirth", "dateOfJoining"].includes(field)) {
      validateField(field, value);
    }
  }, [validateField]);

  const getAvailableDepartments = useMemo(() => {
    return fetchedDepartments.length > 0 ? fetchedDepartments : departments;
  }, [fetchedDepartments, departments]);

  const mapApiToEmployeeFormat = useCallback((apiData: Array<{
    name: string;
    employee_name: string;
    user_id: string | null;
    role_profile?: string;
    company_email?: string;
    email?: string;
    designation: string;
    department?: string;
    reports_to?: string;
    reports_to_name?: string;
  }>): Employee[] => {
    return apiData.map((emp, index) => ({
      id: emp.name || `api-emp-${index}`,
      employeeId: emp.name || '',
      name: emp.employee_name || '',
      email: emp.user_id || emp.company_email || '',
      role: (emp.role_profile === 'Department Head' ? 'Department Head' : 'Employee') as 'Employee' | 'Department Head',
      department: emp.department || '',
      designation: emp.designation || '',
      boss: emp.reports_to_name || emp.reports_to || '',
      reports_to: emp.reports_to || '',
      reports_to_name: emp.reports_to_name || '',
    }));
  }, []);

  const getAllFilteredEmployees = useMemo((): Employee[] => {
    const allEmployees = apiEmployees?.message 
      ? mapApiToEmployeeFormat(apiEmployees.message) 
      : employees;
    return departmentFilter 
      ? allEmployees.filter(emp => emp.department === departmentFilter)
      : allEmployees;
  }, [apiEmployees, employees, departmentFilter, mapApiToEmployeeFormat]);

  const getPaginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return getAllFilteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [getAllFilteredEmployees, currentPage, itemsPerPage]);

  const getAvailableBosses = useMemo((): Employee[] => {
    return getAllFilteredEmployees.filter(emp => emp.role === "Department Head");
  }, [getAllFilteredEmployees]);

  const getEmployeeIdFromName = useCallback((name: string) => {
    const employee = getAllFilteredEmployees.find(emp => emp.name === name);
    return employee?.employeeId || employee?.id || "";
  }, [getAllFilteredEmployees]);

  const totalEmployees = getAllFilteredEmployees.length;
  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  const handleAddEmployee = async () => {
    const requiredFields = ["firstName", "lastName", "email", "department", "gender", "dateOfBirth", "dateOfJoining"];
    const hasErrors = requiredFields.some(field => {
      validateField(field, formData[field as keyof typeof formData] as string);
      return fieldErrors[field];
    });

    if (hasErrors || !validateField("email", formData.email)) return;

    try {
      await createEmployeeMutation.mutateAsync({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        employee_name: formData.name.trim(),
        company: "Chaturvima",
        email: formData.email.trim(),
        department: formData.department,
        gender: formData.gender,
        role_profile: formData.role,
        designation: formData.designation.trim() || "Employee",
        date_of_birth: formData.dateOfBirth,
        date_of_joining: formData.dateOfJoining,
        reports_to: getEmployeeIdFromName(formData.reports_to) || ""
      });

      setFormData(INITIAL_FORM_DATA);
      setFieldErrors({});
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  const handleEditEmployee = useCallback((id: string) => {
    const employee = getAllFilteredEmployees.find(e => e.id === id);
    if (employee) {
      setEmployeeToEdit(employee);
      setIsEditModalOpen(true);
    }
  }, [getAllFilteredEmployees]);

  const handleDeleteEmployee = async (id: string) => {
    const employee = getAllFilteredEmployees.find(e => e.id === id);
    if (!employee || !window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;

    try {
      await deleteEmployeeMutation.mutateAsync(employee.employeeId || employee.id);
      onUpdate(employees.filter(emp => emp.id !== id));
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadErrors(["Row 3: Invalid email format", "Row 5: Duplicate Employee ID", "Row 8: Missing required field: Name"]);
  };

  const downloadTemplate = () => {
    const csvContent = "Employee ID,Name,Email,Designation,Department,Reporting Manager\nEMP001,John Doe,john@example.com,Software Engineer,Engineering,Jane Smith";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => setCurrentPage(1), [departmentFilter]);
  useEffect(() => {
    if (onEmployeesChange) onEmployeesChange(getAllFilteredEmployees);
  }, [getAllFilteredEmployees, onEmployeesChange]);

  const FormField = ({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-200">{title}</h4>
  );

  const renderFormFields = () => {
    const inputClass = (hasError: boolean) => `w-full h-9 ${hasError ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-brand-teal"}`;
    const selectClass = (hasError: boolean) => `w-full h-9 ${hasError ? "border-red-300" : ""}`;

    return (
      <div className="space-y-3">
        <div>
          <SectionHeader title="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField label="First Name" required error={fieldErrors.firstName}>
              <Input type="text" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className={inputClass(!!fieldErrors.firstName)} placeholder="e.g., John" />
            </FormField>
            <FormField label="Last Name" required error={fieldErrors.lastName}>
              <Input type="text" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className={inputClass(!!fieldErrors.lastName)} placeholder="e.g., Doe" />
            </FormField>
            <FormField label="Full Name">
              <Input type="text" value={formData.name} readOnly disabled className="w-full h-9 bg-gray-50 cursor-not-allowed border-gray-200" placeholder="Auto-generated" />
            </FormField>
          </div>
        </div>

        <div>
          <SectionHeader title="Contact & Personal Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField label="Email" required error={fieldErrors.email}>
              <Input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} onBlur={(e) => validateField("email", e.target.value)} className={inputClass(!!fieldErrors.email)} placeholder="e.g., john.doe@company.com" />
            </FormField>
            <FormField label="Gender" required error={fieldErrors.gender}>
              <FilterSelect value={formData.gender || "Select Gender"} onChange={(value) => handleInputChange("gender", value === "Select Gender" ? "" : value)} className={selectClass(!!fieldErrors.gender)} options={["Select Gender", "Male", "Female", "Other"]} />
            </FormField>
            <FormField label="Date of Birth" required error={fieldErrors.dateOfBirth}>
              <CalendarInput value={formData.dateOfBirth} onChange={(value) => handleInputChange("dateOfBirth", value)} placeholder="Select DoB" className="w-full" />
            </FormField>
          </div>
        </div>

        <div>
          <SectionHeader title="Employment Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField label="Date of Joining" required error={fieldErrors.dateOfJoining}>
              <CalendarInput value={formData.dateOfJoining} onChange={(value) => handleInputChange("dateOfJoining", value)} placeholder="Joining Date" className="w-full" />
            </FormField>
            <FormField label="Designation" error={fieldErrors.designation}>
              <Input type="text" value={formData.designation} onChange={(e) => handleInputChange("designation", e.target.value)} className={inputClass(!!fieldErrors.designation)} placeholder="e.g., Software Engineer" />
            </FormField>
            <FormField label="Role">
              <FilterSelect value={formData.role} onChange={(value) => handleInputChange("role", value)} className="w-full h-9" options={["Employee", "Department Head"]} />
            </FormField>
          </div>
        </div>

        <div>
          <SectionHeader title="Organizational Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Department" required error={fieldErrors.department}>
              <FilterSelect value={formData.department || "Select Department"} onChange={(value) => handleInputChange("department", value === "Select Department" ? "" : value)} className={selectClass(!!fieldErrors.department)} options={["Select Department", ...getAvailableDepartments.map(dept => dept.name).sort()]} />
            </FormField>
            <FormField label="Reporting To">
              <FilterSelect value={formData.reports_to || "Select Manager"} onChange={(value) => handleInputChange("reports_to", value === "Select Manager" ? "" : value)} className="w-full h-9" options={["Select Manager", ...getAvailableBosses.map(emp => emp.name).sort()]} />
            </FormField>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employee Setup</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your organization employees</p>
          </div>
          {getAllFilteredEmployees.length > 0 && (
            <div className="px-3 py-1.5 bg-linear-to-r from-brand-teal to-brand-navy text-white rounded-lg shadow-sm">
              <span className="text-xs font-semibold">{getAllFilteredEmployees.length} Employee{getAllFilteredEmployees.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="p-4">
        <div className="flex gap-3 mb-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Left Side - Form Fields (70%) */}
          <div className={`lg:col-span-7 transition-opacity duration-300 ${showBulkUpload ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-linear-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 mb-4">
              {renderFormFields()}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddEmployee}
                variant="gradient"
                size="sm"
                disabled={createEmployeeMutation.isPending || showBulkUpload || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
                className="min-w-[160px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </div>

          {/* Right Side - Bulk Upload Section (30%) */}
          <div className={`lg:col-span-3 transition-opacity duration-300 ${!showBulkUpload ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-linear-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3 text-sm">Drag & Drop Excel/CSV here or</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="gradient" 
                    size="sm"
                    disabled={!showBulkUpload}
                  >
                    Browse Files
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                </div>

                <Button 
                  onClick={downloadTemplate} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={!showBulkUpload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>

                {uploadErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">{uploadErrors.length} rows failed</span>
                    </div>
                    <ul className="text-red-700 text-xs space-y-1">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {(isLoadingEmployees || isLoadingDepartments) && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-blue-700 font-medium">Loading employees...</span>
            </div>
          </motion.div>
        </div>
      )}

      {(employeesError || deleteEmployeeMutation.error) && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="text-xs text-red-800 font-medium">
              {employeesError ? `Error loading employees: ${employeesError.message}` : "Failed to delete employee. Please try again."}
            </div>
          </motion.div>
        </div>
      )}

      {/* Table Section - Full Width */}
      {!isLoadingEmployees && (
        <div className="mt-4 pt-4 px-4 border-t border-gray-200 pb-4 w-full">
          {/* Table Header with Filter */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Employee List</h3>
              <p className="text-xs text-gray-500">View and manage all employees</p>
            </div>
            <div className="flex items-center gap-3">
              <FilterSelect
                value={departmentFilter || "All Departments"}
                onChange={(value) => setDepartmentFilter(value === "All Departments" ? "" : value)}
                className="w-full sm:w-64"
                options={["All Departments", ...getAvailableDepartments.map(dept => dept.name).sort()]}
              />
            </div>
          </div>

          {/* Table Content */}
          {getAllFilteredEmployees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-linear-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-dashed border-gray-300 shadow-sm"
            >
              <div className="w-16 h-16 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                {departmentFilter
                  ? `No employees found in ${departmentFilter} department.`
                  : "Start by adding employees using the form above."}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
                <div className="w-full overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'auto', minWidth: '100%' }}>
                    <thead className="bg-linear-to-r from-gray-50 via-gray-50 to-gray-100">
                      <tr>
                        {["Employee ID", "Name", "Email", "Designation", "Role", "Department", "Reporting Manager", "Actions"].map((header) => (
                          <th key={header} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {getPaginatedEmployees.map((employee, idx) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-linear-to-r hover:from-brand-teal/5 hover:via-white hover:to-gray-50 transition-all duration-200 group"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{employee.employeeId}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedEmployeeName(employee.employeeId);
                                setIsModalOpen(true);
                              }}
                              className="text-sm font-bold text-brand-teal hover:text-brand-navy hover:underline transition-all duration-200 group-hover:scale-105"
                            >
                              {employee.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[200px] truncate">
                            <span className="text-sm text-gray-600" title={employee.email}>{employee.email}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">
                            <span className="text-sm font-medium text-gray-700" title={employee.designation || "-"}>{employee.designation || "-"}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={employee.role === "Department Head" ? "info" : "default"}
                              className={`text-xs font-semibold shadow-sm ${
                                employee.role === "Department Head" 
                                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                                  : "bg-yellow-100 text-gray-700 border border-yellow-200"
                              }`}
                            >
                              {employee.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">
                            <span className="text-sm font-medium text-gray-700" title={employee.department}>{employee.department}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">
                            <span className="text-sm text-gray-600" title={employee.reports_to_name || employee.reports_to || "-"}>{employee.reports_to_name || employee.reports_to || "-"}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditEmployee(employee.id)}
                                variant="ghost"
                                size="xs"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                variant="ghost"
                                size="xs"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                                disabled={deleteEmployeeMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalEmployees > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                  <PaginationInfo
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalEmployees}
                    size="sm"
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    size="sm"
                    showFirstLast={totalPages > 5}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <EmployeeDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployeeName("");
        }}
        employeeName={selectedEmployeeName}
      />

      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEmployeeToEdit(null);
        }}
        employee={employeeToEdit}
        departments={getAvailableDepartments}
        availableBosses={getAvailableBosses}
        onSave={(updatedEmployee) => {
          onUpdate(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        }}
        existingEmployees={getAllFilteredEmployees}
      />
    </div>
  );
};

export default Step3EmployeesMapping;
