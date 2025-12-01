import React, { useState, useRef } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";
import { validateEmail } from "./validationUtils";
import { Button, Input, FilterSelect } from "@/components/ui";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  boss: string;
  role: "Employee" | "Administration";
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Step3EmployeesMappingProps {
  employees: Employee[];
  departments: Department[];
  onUpdate: (employees: Employee[]) => void;
}

const Step3EmployeesMapping: React.FC<Step3EmployeesMappingProps> = ({
  employees,
  departments,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    designation: "",
    department: "",
    boss: "",
    role: "Employee" as "Employee" | "Administration",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          // Check for duplicate emails
          const isDuplicate = employees.some(
            (emp) =>
              emp.id !== editingId &&
              emp.email.toLowerCase() === value.toLowerCase()
          );
          if (isDuplicate) {
            error = "This email address is already in use";
          }
        }
        break;
      case "employeeId":
        if (value) {
          // Check for duplicate employee IDs
          const isDuplicate = employees.some(
            (emp) => emp.id !== editingId && emp.employeeId === value
          );
          if (isDuplicate) {
            error = "This employee ID is already in use";
          }
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleAddEmployee = () => {
    if (
      !formData.employeeId.trim() ||
      !formData.name.trim() ||
      !formData.email.trim()
    )
      return;

    // Validate all fields before adding
    const emailValid = validateField("email", formData.email);
    const employeeIdValid = validateField("employeeId", formData.employeeId);

    if (!emailValid || !employeeIdValid) {
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      employeeId: formData.employeeId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      designation: formData.designation.trim(),
      department: formData.department,
      boss: formData.boss,
      role: formData.role,
    };

    const updatedEmployees = [...employees, newEmployee];
    onUpdate(updatedEmployees);
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      designation: "",
      department: "",
      boss: "",
      role: "Employee",
    });
    setFieldErrors({});
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        boss: employee.boss,
        role: employee.role,
      });
      setEditingId(id);
    }
  };

  const handleUpdateEmployee = () => {
    if (!formData.employeeId || !formData.name || !formData.email || !editingId)
      return;

    const updatedEmployees = employees.map((emp) =>
      emp.id === editingId ? { ...emp, ...formData } : emp
    );

    onUpdate(updatedEmployees);
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      designation: "",
      department: "",
      boss: "",
      role: "Employee",
    });
    setEditingId(null);
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== id);
    onUpdate(updatedEmployees);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      designation: "",
      department: "",
      boss: "",
      role: "Employee",
    });
    setEditingId(null);
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
      "Employee ID,Name,Email,Designation,Department,Department Head\nEMP001,John Doe,john@example.com,Software Engineer,Engineering,Jane Smith";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAvailableBosses = () => {
    return employees.filter(
      (emp) => emp.id !== editingId && emp.role === "Administration"
    );
  };

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
                Employee ID
              </label>
              <Input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  handleInputChange("employeeId", e.target.value)
                }
                onBlur={(e) => validateField("employeeId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.employeeId
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-brand-teal"
                }`}
                placeholder="e.g., EMP001"
              />
              {fieldErrors.employeeId && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.employeeId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={(e) => validateField("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.email
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
                options={["Employee", "Administration"]}
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
                Department Head
              </label>
              <FilterSelect
                value={formData.boss || "Select Department Head"}
                onChange={(value) =>
                  handleInputChange(
                    "boss",
                    value === "Select Department Head" ? "" : value
                  )
                }
                className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                options={[
                  "Select Department Head",
                  ...getAvailableBosses().map((emp) => emp.name),
                ]}
              />
            </div>
          </div>
        )}

        {!showBulkUpload && (
          <div className="mb-6">
            {editingId ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateEmployee}
                  variant="gradient"
                  size="sm"
                >
                  Update Employee
                </Button>
                <Button onClick={resetForm} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={handleAddEmployee} variant="gradient" size="sm">
                <Plus className="w-4 h-4" />
                Add Employee
              </Button>
            )}
          </div>
        )}
      </div>

      {employees.length > 0 && (
        <div className="mb-6">
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
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department Head
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {employee.employeeId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          employee.role === "Administration"
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
                      {employee.boss || "-"}
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
    </div>
  );
};

export default Step3EmployeesMapping;
