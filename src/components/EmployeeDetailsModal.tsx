import React from "react";
import { X, User, Mail, Briefcase, Calendar, Building2 } from "lucide-react";
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
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const InfoCard = ({ icon: Icon, label, value, isBadge = false, badgeColor = "" }: { icon: React.ElementType; label: string; value: string; isBadge?: boolean; badgeColor?: string }) => (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-brand-teal/10 rounded">
          <Icon className="w-4 h-4 text-brand-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-gray-500 mb-0.5">{label}</label>
          {isBadge ? (
            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColor}`}>
              {value || "N/A"}
            </span>
          ) : (
            <p className="text-sm text-gray-900 font-medium break-words">{value || "N/A"}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Employee Details</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent mb-3"></div>
              <div className="text-sm text-gray-600">Loading employee details...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="text-xs text-red-800">Error loading employee details: {error.message}</div>
            </div>
          )}

          {employeeDetails?.data && (
            <div className="space-y-4">
              {/* Profile Header Section */}
              <div className="bg-linear-to-r from-brand-teal/10 to-brand-navy/5 rounded-lg border border-brand-teal/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-brand-teal to-brand-navy rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {employeeDetails.data.employee_name?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{employeeDetails.data.employee_name || "N/A"}</h3>
                    <p className="text-xs text-gray-600 mb-1.5">{employeeDetails.data.designation || "N/A"}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        employeeDetails.data.status === "Active" 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {employeeDetails.data.status || "N/A"}
                      </span>
                      {employeeDetails.data.department && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {employeeDetails.data.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <User className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <InfoCard icon={User} label="Employee ID" value={employeeDetails.data.name || ""} />
                  <InfoCard icon={User} label="Full Name" value={employeeDetails.data.employee_name || ""} />
                  <InfoCard icon={User} label="First Name" value={employeeDetails.data.first_name || ""} />
                  <InfoCard icon={User} label="Gender" value={employeeDetails.data.gender || ""} />
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Mail className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <InfoCard icon={Mail} label="Email Address" value={employeeDetails.data.user_id || ""} />
                </div>
              </div>

              {/* Work Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Briefcase className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-sm font-semibold text-gray-900">Work Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <InfoCard icon={Building2} label="Company" value={employeeDetails.data.company || ""} />
                </div>
              </div>

              {/* Important Dates Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-sm font-semibold text-gray-900">Important Dates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <InfoCard icon={Calendar} label="Date of Birth" value={formatDate(employeeDetails.data.date_of_birth)} />
                  <InfoCard icon={Calendar} label="Date of Joining" value={formatDate(employeeDetails.data.date_of_joining)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
