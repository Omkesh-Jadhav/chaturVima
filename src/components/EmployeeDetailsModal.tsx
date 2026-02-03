import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { useGetEmployeeDetails } from "@/hooks/useEmployees";

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employeeName,
}) => {
  const { data: employeeDetails, isLoading, error } = useGetEmployeeDetails(
    employeeName,
    isOpen
  );

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent mb-3"></div>
              <div className="text-sm text-gray-500">Loading employee details...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-800">Error loading employee details: {error.message}</div>
            </div>
          )}

          {employeeDetails?.data && (
            <div className="space-y-5">
              {[
                { title: "Basic Information", fields: [
                  { label: "Employee ID", value: employeeDetails.data.name },
                  { label: "Employee Name", value: employeeDetails.data.employee_name },
                  { label: "First Name", value: employeeDetails.data.first_name },
                  { label: "Gender", value: employeeDetails.data.gender }
                ]},
                { title: "Contact Information", fields: [
                  { label: "Email", value: employeeDetails.data.user_id }
                ]},
                { title: "Work Information", fields: [
                  { label: "Company", value: employeeDetails.data.company },
                  { label: "Department", value: employeeDetails.data.department },
                  { label: "Designation", value: employeeDetails.data.designation },
                  { label: "Status", value: employeeDetails.data.status, isBadge: true }
                ]},
                { title: "Important Dates", fields: [
                  { label: "Date of Birth", value: formatDate(employeeDetails.data.date_of_birth) },
                  { label: "Date of Joining", value: formatDate(employeeDetails.data.date_of_joining) }
                ]}
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field, fIdx) => (
                      <div key={fIdx}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                        {field.isBadge ? (
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                            field.value === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                            {field.value || "N/A"}
                          </span>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">{field.value || "N/A"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-5 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
