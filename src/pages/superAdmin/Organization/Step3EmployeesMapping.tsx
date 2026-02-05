import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Edit, Trash2, Plus, Upload, Download, AlertCircle, ClipboardList, AlertTriangle, CheckCircle2, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail, validateTextOnly, validateDesignation, validateDateOfBirthBeforeJoining } from "./validationUtils";
import type { Employee, Department } from "./types";
import { Button, Input, FilterSelect, CalendarInput, Pagination, PaginationInfo, Badge } from "@/components/ui";
import { useCreateEmployee, useGetEmployees, useEditEmployeeDetails, useBulkUploadEmployees, useGetOrganizationDetails } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { getEmployeeDetails } from "@/api/api-functions/organization-setup";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal";
import EmployeeEditModal from "@/components/EmployeeEditModal";
import * as XLSX from "xlsx";

interface Step3EmployeesMappingProps {
  employees: Employee[];
  departments: Department[];
  onUpdate: (employees: Employee[]) => void;
  onEmployeesChange?: (employees: Employee[]) => void;
  organizationName?: string;
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

// Move FormField and SectionHeader outside component to prevent recreation on each render
const FormField = React.memo(({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

FormField.displayName = "FormField";

const SectionHeader = React.memo(({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-200">{title}</h4>
));

SectionHeader.displayName = "SectionHeader";

const Step3EmployeesMapping: React.FC<Step3EmployeesMappingProps> = ({
  employees,
  departments,
  onUpdate,
  onEmployeesChange,
  organizationName,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; employeeId: string | null; employeeName: string }>({
    isOpen: false,
    employeeId: null,
    employeeName: "",
  });
  const [deleteError, setDeleteError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [hasDownloadedTemplate, setHasDownloadedTemplate] = useState(false);
  const [hasReadInstructions, setHasReadInstructions] = useState(false);

  // Fetch organization details from backend to get the actual company name
  const companyNameToFetch = organizationName || "Chaturvima";
  const { data: organizationData } = useGetOrganizationDetails(companyNameToFetch);
  const actualOrganizationName = organizationData?.data?.company_name || organizationData?.data?.name || organizationName || "Your Organization";

  const createEmployeeMutation = useCreateEmployee();
  const editEmployeeMutation = useEditEmployeeDetails();
  const bulkUploadMutation = useBulkUploadEmployees();
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

    setFieldErrors((prev) => {
      // Only update if error changed to prevent unnecessary re-renders
      if (prev[field] === error) return prev;
      return { ...prev, [field]: error };
    });
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
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditEmployee = useCallback((id: string) => {
    const employee = getAllFilteredEmployees.find(e => e.id === id);
    if (employee) {
      setEmployeeToEdit(employee);
      setIsEditModalOpen(true);
    }
  }, [getAllFilteredEmployees]);

  const handleDeleteClick = (id: string) => {
    const employee = getAllFilteredEmployees.find(e => e.id === id);
    if (employee) {
      setDeleteError("");
      setDeleteConfirmModal({ isOpen: true, employeeId: id, employeeName: employee.name });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmModal.employeeId) return;

    setDeleteError("");

    try {
      const employee = getAllFilteredEmployees.find(e => e.id === deleteConfirmModal.employeeId);
      if (!employee) return;

      // Fetch employee details to get all required fields
      const employeeDetailsResponse = await getEmployeeDetails(employee.employeeId || employee.id);
      const details = employeeDetailsResponse?.data || {};

      // Prepare employee data with status: "Inactive"
      const employeeData = {
        employee_name: details.employee_name || employee.name,
        first_name: details.first_name || employee.name.split(' ')[0] || '',
        last_name: details.last_name || employee.name.split(' ').slice(1).join(' ') || '',
        user_id: details.user_id || employee.email,
        company_email: details.company_email || employee.email,
        gender: details.gender || '',
        date_of_birth: details.date_of_birth || '',
        date_of_joining: details.date_of_joining || '',
        designation: details.designation || employee.designation || '',
        department: details.department || employee.department || '',
        reports_to: details.reports_to || employee.reports_to || '',
        role_profile: details.role_profile || employee.role || 'Employee',
        status: 'Inactive', // Set status to Inactive (capitalized as required by API)
      };

      // Call the edit API to update employee status to inactive
      await editEmployeeMutation.mutateAsync({
        name: employee.employeeId || employee.id,
        employeeData: employeeData
      });

      // Remove from local state (or you can filter by status if you want to keep inactive employees)
      onUpdate(employees.filter(emp => emp.id !== deleteConfirmModal.employeeId));
      
      setDeleteConfirmModal({ isOpen: false, employeeId: null, employeeName: "" });
    } catch {
      setDeleteError("Failed to deactivate employee. Please try again.");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file exists and has size
    if (file.size === 0) {
      setUploadErrors(["The selected file is empty. Please ensure the file has been saved properly after editing."]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!hasDownloadedTemplate) {
      setUploadErrors(["Please download the template first to ensure you use the correct format."]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadErrors([`Invalid file type. Please upload ${validExtensions.join(', ')} file.`]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    console.log("File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });

    setPendingFile(file);
    
    if (!hasReadInstructions) {
      setShowUploadModal(true);
      return;
    }

    // Pass file directly to avoid async state update issue
    // Pass file directly to avoid async state update issue
    handleConfirmUpload(file);
  };

  // Wrapper for button click that uses pendingFile state
  const handleUploadButtonClick = () => {
    if (pendingFile) {
      handleConfirmUpload(pendingFile);
    } else {
      console.error("No pending file to upload");
      setUploadErrors(["No file selected. Please select a file to upload."]);
    }
  };


  const handleConfirmUpload = async (fileToUpload?: File) => {
    // Use provided file or fall back to pendingFile state
    const file = fileToUpload || pendingFile;
    
    if (!file) {
      console.error("No pending file to upload");
      setUploadErrors(["No file selected. Please select a file to upload."]);
      return;
    }

    // Validate file before upload
    if (file.size === 0) {
      setUploadErrors(["The selected file is empty. Please ensure the file has been saved properly after editing."]);
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPendingFile(null);
      return;
    }

    console.log("Starting upload:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setShowUploadModal(false);
    setHasReadInstructions(true);
    setUploadErrors([]);
    setUploadSuccess(false);

    try {
      const response = await bulkUploadMutation.mutateAsync(file);
      console.log("Upload successful:", response);
      
      const formatError = (err: any, index: number): string => {
        if (typeof err === 'string') return err;
        return `Row ${err.row || index + 1}: ${err.message || err.error || JSON.stringify(err)}`;
      };

      if (response?.message?.errors?.length) {
        setUploadErrors(response.message.errors.map(formatError));
        setUploadSuccess(false);
      } else {
        setUploadErrors([]);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 5000);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
      setPendingFile(null);
    } catch (error: any) {
      const formatError = (err: any, index: number): string => {
        if (typeof err === 'string') return err;
        return `Row ${err.row || index + 1}: ${err.message || err.error || JSON.stringify(err)}`;
      };

      let errorMessages: string[] = [];
      const errorData = error?.response?.data?.message;
      
      if (errorData) {
        if (Array.isArray(errorData)) {
          errorMessages = errorData.map(formatError);
        } else if (typeof errorData === 'string') {
          errorMessages = [errorData];
        } else if (errorData.errors?.length) {
          errorMessages = errorData.errors.map(formatError);
        } else {
          errorMessages = [errorData.message || "Failed to upload file. Please check the file format and try again."];
        }
      } else {
        // Handle timeout errors specifically
        if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
          errorMessages = ["Upload timeout. The file is large and taking longer to process. Please try again or contact support if the issue persists."];
        } else {
          errorMessages = [error?.message || "Failed to upload file. Please try again."];
        }
      }
      
      setUploadErrors(errorMessages);
      setUploadSuccess(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPendingFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const headers = ["email", "first_name", "middle_name", "last_name", "gender", "date_of_birth", "date_of_joining", "department", "company", "role_profile", "designation", "reports_to"];
    const sampleData = [["user12@gmail.com", "John", "Sam", "Doe", "Male", "10-01-1995", "01-06-2024", "Sales", actualOrganizationName, "Employee", "Software Developer", "EMP-0001"]];
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Template");
    
    const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'employee_bulk_upload_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setHasDownloadedTemplate(true);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  };

  useEffect(() => setCurrentPage(1), [departmentFilter]);
  useEffect(() => {
    if (onEmployeesChange) onEmployeesChange(getAllFilteredEmployees);
  }, [getAllFilteredEmployees, onEmployeesChange]);

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
                <div className="space-y-3">
                  <Button 
                    onClick={downloadTemplate} 
                    variant="gradient" 
                    size="sm" 
                    className="w-full"
                    disabled={!showBulkUpload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>

                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    bulkUploadMutation.isPending 
                      ? 'border-blue-300 bg-blue-50' 
                      : uploadErrors.length > 0 
                        ? 'border-red-300 bg-red-50' 
                        : !hasDownloadedTemplate
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-gray-300 bg-gray-50'
                  }`}>
                    {bulkUploadMutation.isPending ? (
                      <>
                        <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-blue-600 text-sm">Uploading...</p>
                      </>
                    ) : !hasDownloadedTemplate ? (
                      <>
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-amber-700 text-sm mb-2 font-medium">Download Template First</p>
                        <p className="text-amber-600 text-xs mb-3">Please download the template to ensure your file follows the correct format</p>
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          variant="outline" 
                          size="sm"
                          disabled={true}
                          className="opacity-50 cursor-not-allowed"
                        >
                          Browse Files
                        </Button>
                      </>
                    ) : !hasReadInstructions ? (
                      <>
                        <Info className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 text-sm mb-2 font-medium">Review Instructions</p>
                        <p className="text-blue-600 text-xs mb-3">Please review the instructions to ensure your file is formatted correctly</p>
                        <Button 
                          onClick={() => {
                            setShowUploadModal(true);
                            setPendingFile(null);
                          }} 
                          variant="gradient" 
                          size="sm"
                          disabled={!showBulkUpload}
                        >
                          View Instructions
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm mb-3">Upload Excel/CSV file</p>
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          variant="gradient" 
                          size="sm"
                          disabled={!showBulkUpload || bulkUploadMutation.isPending}
                        >
                          Browse Files
                        </Button>
                      </>
                    )}
                    <input 
                      key={`file-input-${hasDownloadedTemplate}`}
                      ref={fileInputRef} 
                      type="file" 
                      accept=".csv,.xlsx,.xls" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      disabled={bulkUploadMutation.isPending || !hasDownloadedTemplate}
                    />
                  </div>
                </div>

                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold text-sm">File uploaded successfully!</span>
                    </div>
                    <p className="text-green-700 text-xs mt-2">Employees have been added successfully.</p>
                  </motion.div>
                )}

                {uploadErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">
                        {uploadErrors.length} {uploadErrors.length === 1 ? 'error' : 'errors'} found
                      </span>
                    </div>
                    <ul className="text-red-700 text-xs space-y-1 max-h-40 overflow-y-auto">
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

      {(employeesError || editEmployeeMutation.error) && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="text-xs text-red-800 font-medium">
              {employeesError ? `Error loading employees: ${employeesError.message}` : "Failed to deactivate employee. Please try again."}
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
                                onClick={() => handleDeleteClick(employee.id)}
                                variant="ghost"
                                size="xs"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                                disabled={editEmployeeMutation.isPending}
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

      {/* Pre-Upload Instructions Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleCancelUpload}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Instructions</h3>
                    <p className="text-sm text-gray-500">Please take a moment to review these helpful guidelines</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelUpload}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Important Notes Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Helpful Tips for Success
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Edit the downloaded template:</strong> After downloading, you can edit the template file directly. Add your employee data in the rows below the header, or modify the sample row. You can upload the same edited file.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Update existing employees:</strong> If an employee with the same email already exists, uploading will update their information instead of creating a duplicate.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Keep the template format unchanged:</strong> Please maintain all column headers exactly as they appear in the downloaded template to ensure smooth processing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Company name should match:</strong> Please ensure the company name is exactly <strong className="text-gray-900">"{actualOrganizationName}"</strong> (as entered in your Organization Details) for proper data association.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Use correct department names:</strong> Please use the exact department names that are already set up in your organization to avoid any mapping issues.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span><strong>Email addresses:</strong> Each email address should be unique and in a valid format. Existing employees will be updated based on their email address.</span>
                    </li>
                  </ul>
                </div>

                {/* Validation Rules Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Format Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Date of Birth:</strong> Date of birth must be earlier than current date.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Date of Joining:</strong> Date of joining must be after date of birth.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Gender:</strong> Please use one of the following values: Male, Female, or Other.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Role Profile:</strong> Please select from: Employee, Department Head.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Date Format:</strong> Please use DD-MM-YYYY format (for example: 10-01-1995).</span>
                    </li>
                  </ul>
                </div>

                {/* File Info */}
                {pendingFile && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ready to Upload:</p>
                        <p className="text-sm text-gray-600">{pendingFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">File size: {(pendingFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                {pendingFile ? (
                  <>
                    <Button
                      onClick={handleCancelUpload}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadButtonClick}
                      variant="gradient"
                      size="sm"
                      disabled={bulkUploadMutation.isPending}
                    >
                      {bulkUploadMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          I've Reviewed, Upload File
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setHasReadInstructions(true);
                      setShowUploadModal(false);
                    }}
                    variant="gradient"
                    size="sm"
                  >
                    I've Reviewed, Continue
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setDeleteError("");
            setDeleteConfirmModal({ isOpen: false, employeeId: null, employeeName: "" });
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Deactivate Employee</h2>
                  <p className="text-sm text-gray-500 mt-0.5">This action will set the employee status to inactive</p>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to deactivate <span className="font-semibold text-gray-900">"{deleteConfirmModal.employeeName}"</span>?
                </p>
                <p className="text-xs text-orange-800 font-medium">
                  After deactivating this employee, they will not be able to participate in any assessment or any other work.
                </p>
              </div>

              {deleteError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-800 font-medium">{deleteError}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteError("");
                    setDeleteConfirmModal({ isOpen: false, employeeId: null, employeeName: "" });
                  }}
                  size="sm"
                  className="flex-1 cursor-pointer border-gray-300 hover:bg-gray-50 text-xs"
                  disabled={editEmployeeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDelete}
                  size="sm"
                  disabled={editEmployeeMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  {editEmployeeMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Deactivating...
                    </span>
                  ) : (
                    "Deactivate"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Step3EmployeesMapping;
