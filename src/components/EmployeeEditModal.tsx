import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button, Input, FilterSelect } from "@/components/ui";
import { validateEmail } from "@/pages/superAdmin/Organization/validationUtils";
import type { Employee, Department } from "@/pages/superAdmin/Organization/types";
import { useGetEmployeeDetails, useEditEmployeeDetails } from "@/hooks/useEmployees";

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: Department[];
  availableBosses: Employee[];
  onSave: (updatedEmployee: Employee) => void;
  existingEmployees: Employee[];
}

const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  departments,
  availableBosses,
  onSave,
  existingEmployees,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    dateOfJoining: "",
    designation: "",
    department: "",
    boss: "",
    role: "Employee" as "Employee" | "HoD",
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Fetch employee details from API when modal opens
  const { data: employeeDetails, isLoading: isLoadingDetails, error: detailsError } = useGetEmployeeDetails(
    employee?.employeeId || employee?.id || "",
    isOpen && !!employee
  );

  // Edit employee details mutation
  const editEmployeeMutation = useEditEmployeeDetails();

  // Initialize form data when employee details are fetched
  useEffect(() => {
    if (employeeDetails?.data) {
      const details = employeeDetails.data;
      // Parse name into first and last name (simple split)
      const nameParts = (details.employee_name || employee?.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        name: details.employee_name || employee?.name || "",
        email: details.user_id || employee?.email || "",
        gender: details.gender || "",
        dateOfBirth: details.date_of_birth || "",
        dateOfJoining: details.date_of_joining || "",
        designation: details.designation || employee?.designation || "",
        department: details.department || employee?.department || "",
        boss: details.reports_to || employee?.boss || "",
        role: details.role_profile || employee?.role || "Employee",
      });
      setFieldErrors({});
    } else if (employee && !isLoadingDetails) {
      // Fallback to basic employee data if API call fails or no details available
      const nameParts = employee.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        name: employee.name,
        email: employee.email,
        gender: "",
        dateOfBirth: "",
        dateOfJoining: "",
        designation: employee.designation,
        department: employee.department,
        boss: employee.boss,
        role: employee.role,
      });
      setFieldErrors({});
    }
  }, [employeeDetails, employee, isLoadingDetails]);

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
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "email":
        if (value && !validateEmail(value)) {
          error = "Please enter a valid email address";
        } else if (value) {
          // Check for duplicate emails (excluding current employee)
          const isDuplicate = existingEmployees.some(
            (emp) =>
              emp.id !== employee?.id &&
              emp.email.toLowerCase() === value.toLowerCase()
          );
          if (isDuplicate) {
            error = "This email address is already in use";
          }
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleSave = async () => {
    if (!employee || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      return;
    }

    // Validate all fields before saving
    const emailValid = validateField("email", formData.email);

    if (!emailValid) {
      return;
    }

    try {
      // Find the selected boss's employee ID/name for reports_to field
      const selectedBoss = availableBosses.find(boss => boss.name === formData.boss);
      const reportsToValue = selectedBoss ? (selectedBoss.employeeId || selectedBoss.id) : "";

      // Prepare employee data for API
      const employeeData = {
        employee_name: formData.name,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_id: formData.email,
        company_email: formData.email,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        date_of_joining: formData.dateOfJoining,
        designation: formData.designation,
        department: formData.department,
        reports_to: reportsToValue,
        role_profile: formData.role,
      };

      // Call the API to update employee details
      await editEmployeeMutation.mutateAsync({
        name: employee.employeeId || employee.id,
        employeeData: employeeData
      });

      // Create updated employee object for local state update
      const updatedEmployee: Employee = {
        ...employee,
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        department: formData.department,
        boss: formData.boss,
        reports_to: formData.boss,
        role: formData.role,
      };

      onSave(updatedEmployee);
      onClose();
    } catch (error) {
      console.error("Failed to update employee:", error);
      // You might want to show a toast notification here
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      name: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      dateOfJoining: "",
      designation: "",
      department: "",
      boss: "",
      role: "Employee",
    });
    setFieldErrors({});
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Loading State */}
          {isLoadingDetails && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-teal mr-2" />
              <span className="text-gray-600">Loading employee details...</span>
            </div>
          )}

          {/* Error State */}
          {detailsError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">
                Failed to load employee details. Using basic information.
              </div>
            </div>
          )}

          {/* Save Error State */}
          {editEmployeeMutation.error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">
                Failed to save employee details. Please try again.
              </div>
            </div>
          )}

          {/* Form Fields */}
          {!isLoadingDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange("firstName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="e.g., John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange("lastName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="e.g., Doe"
              />
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
                Email <span className="text-red-500">*</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="e.g., Software Engineer"
              />
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
                  ...departments.map((dept) => dept.name),
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
                  ...availableBosses.map((emp) => emp.name),
                ]}
              />
            </div>
          </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="gradient"
            size="sm"
            disabled={isLoadingDetails || editEmployeeMutation.isPending || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
          >
            {editEmployeeMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {editEmployeeMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditModal;
