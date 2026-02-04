import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  validateEmail,
  validatePhone,
  validateWebsite,
  validateTextOnly,
} from "./validationUtils";
import type { OrganizationInfo } from "./types";
import { FilterSelect, Input, Button, Card } from "@/components/ui";
import { useGetOrganizationDetails, useGetAllIndustries } from "@/hooks/useEmployees";
import { updateOrganizationDetails } from "@/api/api-functions/organization-setup";
import { Edit, X, Save, Loader2, Building2, AlertCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";


interface Step1OrganizationInfoProps {
  data: OrganizationInfo;
  onUpdate: (data: OrganizationInfo) => void;
}

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

const Step1OrganizationInfo: React.FC<Step1OrganizationInfoProps> = ({
  data,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<OrganizationInfo>(data);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<OrganizationInfo>(data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Get user role to conditionally show edit button
  const { user } = useUser();
  const isSuperAdmin = user?.role_profile?.[0] === "Superadmin";

  // Fetch organization details from API
  const { data: organizationData, isLoading: isLoadingOrg, error: orgError } = useGetOrganizationDetails(data.name || "Chaturvima");
  
  // Fetch industries from API
  const { data: industriesData, isLoading: isLoadingIndustries, error: industriesError } = useGetAllIndustries();

  // All fields are readonly by default, editing happens through modal
  const isReadonly = true;

  // Helper function to get industry options
  const getIndustryOptions = () => {
    const defaultOptions = ["Select industry"];
    
    if (industriesData?.data) {
      // Use API data, sorted alphabetically
      const apiIndustries = industriesData.data
        .map((industry: { name: string }) => industry.name)
        .sort((a: string, b: string) => a.localeCompare(b));
      return [...defaultOptions, ...apiIndustries];
    }
    
    // Fallback to hardcoded options if API fails
    return [
      ...defaultOptions,
      "Accounting",
      "Advertising", 
      "Aerospace",
      "Agriculture",
      "Automotive",
      "Banking",
      "Biotechnology",
      "Chemical",
      "Computer",
      "Consulting",
      "Consumer Products",
      "Defense",
      "Education",
      "Electronics",
      "Finance",
      "Healthcare",
      "Manufacturing",
      "Other",
      "Retail",
      "Technology",
    ];
  };

  // Pre-fill form data when organization data is loaded from API
  useEffect(() => {
    if (organizationData?.data) {
      const apiData = organizationData.data;
      const mappedData: OrganizationInfo = {
        name: apiData.name || "",
        company_name: apiData.company_name || "",
        type: apiData.custom_organization_type || "",
        size: apiData.custom_organization_size || "",
        industry: apiData.custom_industry || "",
        website: apiData.website || "",
        email: apiData.email || "",
        phone: apiData.phone_no || "",
        city: apiData.custom_city || "",
        state: apiData.custom_state || "",
        country: apiData.country || "",
      };
      
      setFormData(mappedData);
      onUpdate(mappedData);
    }
  }, [organizationData, onUpdate]);


  const validateField = useCallback((field: keyof OrganizationInfo, value: string) => {
    let error = "";

    switch (field) {
      case "email":
        if (value && !validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (value && !validatePhone(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      case "website":
        if (value && !validateWebsite(value)) {
          error = "Website must start with http://, https://, or www. (e.g., www.example.com or https://example.com)";
        }
        break;
      case "city":
        if (value && !validateTextOnly(value)) {
          error = "City should only contain letters, spaces, hyphens, and apostrophes";
        }
        break;
      case "state":
        if (value && !validateTextOnly(value)) {
          error = "State should only contain letters, spaces, hyphens, and apostrophes";
        }
        break;
      case "country":
        if (value && !validateTextOnly(value)) {
          error = "Country should only contain letters, spaces, hyphens, and apostrophes";
        }
        break;
    }

    setFieldErrors((prev) => {
      // Only update if error changed to prevent unnecessary re-renders
      if (prev[field] === error) return prev;
      return { ...prev, [field]: error };
    });
  }, []);

  const handleEditInputChange = useCallback((field: keyof OrganizationInfo, value: string) => {
    // Update form data immediately - this is the critical update
    setEditFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate fields in real-time
    const fieldsToValidate = ["city", "state", "country", "website", "email", "phone"];
    if (fieldsToValidate.includes(field)) {
      validateField(field, value);
    } else {
      // Clear field error when user starts typing for other fields
      setFieldErrors((prev) => {
        if (prev[field]) {
          return { ...prev, [field]: "" };
        }
        return prev;
      });
    }
  }, [validateField]);

  const openEditModal = () => {
    setEditFormData(formData);
    setFieldErrors({});
    setUpdateError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData(formData);
    setFieldErrors({});
    setUpdateError(null);
  };

  const validateEditForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!editFormData.name.trim()) {
      errors.name = "Organization name is required";
    }
    if (!editFormData.type) {
      errors.type = "Organization type is required";
    }
    if (!editFormData.size) {
      errors.size = "Organization size is required";
    }
    if (!editFormData.industry) {
      errors.industry = "Industry is required";
    }
    if (!editFormData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!validateEmail(editFormData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!editFormData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(editFormData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (editFormData.website && !validateWebsite(editFormData.website)) {
      errors.website = "Please enter a valid website URL";
    }
    if (!editFormData.city.trim()) {
      errors.city = "City is required";
    }
    if (!editFormData.state.trim()) {
      errors.state = "State is required";
    }
    if (!editFormData.country.trim()) {
      errors.country = "Country is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateOrganization = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatePayload = {
        name: editFormData.name,
        company_name: editFormData.company_name,
        custom_organization_type: editFormData.type,
        custom_organization_size: editFormData.size,
        custom_industry: editFormData.industry,
        website: editFormData.website,
        phone_no: editFormData.phone,
        email: editFormData.email,
        custom_city: editFormData.city,
        custom_state: editFormData.state,
        country: editFormData.country,
      };

      await updateOrganizationDetails(updatePayload);
      
      // Update local state
      setFormData(editFormData);
      onUpdate(editFormData);
      
      // Close modal
      setIsEditModalOpen(false);
      
      // Show success message (you can add a toast notification here)
      console.log("Organization details updated successfully");
      
    } catch (error: unknown) {
      console.error("Failed to update organization details:", error);
      let errorMessage = "Failed to update organization details. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Organization Info</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your organization details</p>
          </div>
          {isSuperAdmin && (
            <Button
              onClick={openEditModal}
              variant="gradient"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Organization Info
            </Button>
          )}
        </div>
      </div>

      {/* Loading States */}
      {(isLoadingOrg || isLoadingIndustries) && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-blue-700 font-medium">
                {isLoadingOrg && isLoadingIndustries 
                  ? "Loading organization data and industries..." 
                  : isLoadingOrg 
                    ? "Loading organization data..." 
                    : "Loading industries..."}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error States */}
      {orgError && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong className="font-semibold">Note:</strong> Could not load existing organization data. You can still enter information manually.
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {industriesError && (
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong className="font-semibold">Note:</strong> Could not load industries from server. Using default industry options.
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-4">
        <Card variant="elevated" className="p-4 bg-linear-to-br from-gray-50 to-white border border-gray-100">
          <div className="space-y-4">
            {/* Basic Information Section */}
            <div>
              <SectionHeader title="Basic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField label="Organization Name" required error={!formData.name.trim() ? "Organization name is required" : undefined}>
                  <Input
                    type="text"
                    value={formData.name}
                    disabled={isReadonly}
                    className={`w-full h-9 ${!formData.name.trim()
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-brand-teal"
                      } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="e.g., Chaturvima"
                  />
                </FormField>

                <FormField label="Organization Type" required>
                  <FilterSelect
                    value={formData.type || "Select type"}
                    onChange={() => {}}
                    className={`w-full h-9 ${isReadonly ? "opacity-50 pointer-events-none" : ""}`}
                    options={[
                      "Select type",
                      "Private Limited",
                      "Public Limited",
                      "Partnership",
                      "Sole Proprietorship",
                      "Non-Profit",
                    ]}
                  />
                </FormField>

                <FormField label="Organization Size" required>
                  <FilterSelect
                    value={formData.size || "Select size"}
                    onChange={() => {}}
                    className={`w-full h-9 ${isReadonly ? "opacity-50 pointer-events-none" : ""}`}
                    options={[
                      "Select size",
                      "1-10 employees",
                      "11-50 employees",
                      "51-200 employees",
                      "201-500 employees",
                      "500+ employees",
                    ]}
                  />
                </FormField>
              </div>
            </div>

            {/* Business Details Section */}
            <div>
              <SectionHeader title="Business Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField label="Industry" required>
                  <FilterSelect
                    value={formData.industry || "Select industry"}
                    onChange={() => {}}
                    className={`w-full h-9 ${isReadonly ? "opacity-50 pointer-events-none" : ""}`}
                    options={getIndustryOptions()}
                  />
                </FormField>

                <FormField label="Website" error={fieldErrors.website}>
                  <Input
                    type="url"
                    value={formData.website}
                    onBlur={(e) => validateField("website", e.target.value)}
                    disabled={isReadonly}
                    className={`w-full h-9 ${fieldErrors.website
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-brand-teal"
                      } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="www.example.com"
                  />
                </FormField>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <SectionHeader title="Contact Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField 
                  label="Email Address" 
                  required 
                  error={!formData.email.trim() ? "Email address is required" : fieldErrors.email}
                >
                  <Input
                    type="email"
                    value={formData.email}
                    onBlur={(e) => validateField("email", e.target.value)}
                    disabled={isReadonly}
                    className={`w-full h-9 ${!formData.email.trim() || fieldErrors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-brand-teal"
                      } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="contact@example.com"
                  />
                </FormField>

                <FormField 
                  label="Phone Number" 
                  required 
                  error={!formData.phone.trim() ? "Phone number is required" : fieldErrors.phone}
                >
                  <Input
                    type="tel"
                    value={formData.phone}
                    onBlur={(e) => validateField("phone", e.target.value)}
                    disabled={isReadonly}
                    className={`w-full h-9 ${!formData.phone.trim() || fieldErrors.phone
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-brand-teal"
                      } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="+91 9876543210"
                  />
                </FormField>
              </div>
            </div>

            {/* Location Information Section */}
            <div>
              <SectionHeader title="Location Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField label="City" required>
                  <Input
                    type="text"
                    value={formData.city}
                    disabled={isReadonly}
                    className={`w-full h-9 ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="e.g., Mumbai"
                  />
                </FormField>

                <FormField label="State" required>
                  <Input
                    type="text"
                    value={formData.state}
                    disabled={isReadonly}
                    className={`w-full h-9 ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="e.g., Maharashtra"
                  />
                </FormField>

                <FormField label="Country" required>
                  <Input
                    type="text"
                    value={formData.country}
                    disabled={isReadonly}
                    className={`w-full h-9 ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="e.g., India"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal Overlay */}
      {isEditModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeEditModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-xl border border-gray-200 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-brand-teal to-brand-navy rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Organization Information
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Update your organization details</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {updateError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-red-800">
                      <strong className="font-semibold">Error:</strong> {updateError}
                    </div>
                  </div>
                </motion.div>
              )}

              <Card variant="elevated" className="p-4 bg-linear-to-br from-gray-50 to-white border border-gray-100">
                <div className="space-y-4">
                  {/* Basic Information Section */}
                  <div>
                    <SectionHeader title="Basic Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FormField label="Organization Name" required error={fieldErrors.name}>
                        <Input
                          type="text"
                          value={editFormData.name}
                          disabled={true}
                          readOnly={true}
                          className="w-full h-9 bg-gray-50 cursor-not-allowed border-gray-200"
                          placeholder="e.g., Chaturvima"
                        />
                      </FormField>

                      <FormField label="Organization Type" required error={fieldErrors.type}>
                        <FilterSelect
                          value={editFormData.type || "Select type"}
                          onChange={(value) =>
                            handleEditInputChange("type", value === "Select type" ? "" : value)
                          }
                          className={`w-full h-9 ${fieldErrors.type ? "border-red-300" : ""}`}
                          options={[
                            "Select type",
                            "Private Limited",
                            "Public Limited",
                            "Partnership",
                            "Sole Proprietorship",
                            "Non-Profit",
                          ]}
                        />
                      </FormField>

                      <FormField label="Organization Size" required error={fieldErrors.size}>
                        <FilterSelect
                          value={editFormData.size || "Select size"}
                          onChange={(value) =>
                            handleEditInputChange("size", value === "Select size" ? "" : value)
                          }
                          className={`w-full h-9 ${fieldErrors.size ? "border-red-300" : ""}`}
                          options={[
                            "Select size",
                            "1-10 employees",
                            "11-50 employees",
                            "51-200 employees",
                            "201-500 employees",
                            "501-1000 employees",
                            "1000+ employees",
                          ]}
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Business Details Section */}
                  <div>
                    <SectionHeader title="Business Details" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FormField label="Industry" required error={fieldErrors.industry}>
                        <FilterSelect
                          value={editFormData.industry || "Select industry"}
                          onChange={(value) =>
                            handleEditInputChange(
                              "industry",
                              value === "Select industry" ? "" : value
                            )
                          }
                          className={`w-full h-9 ${fieldErrors.industry ? "border-red-300" : ""}`}
                          options={getIndustryOptions()}
                        />
                      </FormField>

                      <FormField label="Website" error={fieldErrors.website}>
                        <Input
                          type="url"
                          value={editFormData.website}
                          onChange={(e) => handleEditInputChange("website", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.website
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="www.example.com or https://example.com"
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div>
                    <SectionHeader title="Contact Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FormField label="Email Address" required error={fieldErrors.email}>
                        <Input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => handleEditInputChange("email", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.email
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="contact@example.com"
                        />
                      </FormField>

                      <FormField label="Phone Number" required error={fieldErrors.phone}>
                        <Input
                          type="tel"
                          value={editFormData.phone}
                          onChange={(e) => handleEditInputChange("phone", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.phone
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="+91 9876543210"
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div>
                    <SectionHeader title="Location Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FormField label="City" required error={fieldErrors.city}>
                        <Input
                          type="text"
                          value={editFormData.city}
                          onChange={(e) => handleEditInputChange("city", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.city
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="e.g., Mumbai"
                        />
                      </FormField>

                      <FormField label="State" required error={fieldErrors.state}>
                        <Input
                          type="text"
                          value={editFormData.state}
                          onChange={(e) => handleEditInputChange("state", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.state
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="e.g., Maharashtra"
                        />
                      </FormField>

                      <FormField label="Country" required error={fieldErrors.country}>
                        <Input
                          type="text"
                          value={editFormData.country}
                          onChange={(e) => handleEditInputChange("country", e.target.value)}
                          className={`w-full h-9 ${
                            fieldErrors.country
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-brand-teal"
                          }`}
                          placeholder="e.g., India"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                onClick={closeEditModal}
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateOrganization}
                disabled={isUpdating}
                variant="gradient"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Step1OrganizationInfo;
