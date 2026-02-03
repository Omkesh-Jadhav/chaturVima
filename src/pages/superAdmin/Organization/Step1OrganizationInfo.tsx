import React, { useState, useEffect } from "react";
import {
  validateEmail,
  validatePhone,
  validateWebsite,
  validateTextOnly,
} from "./validationUtils";
import type { OrganizationInfo } from "./types";
import { FilterSelect, Input, Button } from "@/components/ui";
import { useGetOrganizationDetails, useGetAllIndustries } from "@/hooks/useEmployees";
import { updateOrganizationDetails } from "@/api/api-functions/organization-setup";
import { Edit, X, Save, Loader2 } from "lucide-react";


interface Step1OrganizationInfoProps {
  data: OrganizationInfo;
  onUpdate: (data: OrganizationInfo) => void;
}

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


  const validateField = (field: keyof OrganizationInfo, value: string) => {
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
          error = "Please enter a valid website URL (e.g., www.example.com)";
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

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleEditInputChange = (field: keyof OrganizationInfo, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate text-only fields in real-time
    if (field === "city" || field === "state" || field === "country") {
      validateField(field, value);
    } else {
      // Clear field error when user starts typing for other fields
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Organization Info
        </h2>
        <div className="flex items-center gap-3">
          {(isLoadingOrg || isLoadingIndustries) && (
            <span className="text-sm text-gray-500">
              {isLoadingOrg && isLoadingIndustries 
                ? "Loading organization data and industries..." 
                : isLoadingOrg 
                  ? "Loading organization data..." 
                  : "Loading industries..."}
            </span>
          )}
        </div>
      </div>

      {/* Error state for organization data */}
      {orgError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            <strong>Note:</strong> Could not load existing organization data. You can still enter information manually.
          </div>
        </div>
      )}

      {/* Error state for industries data */}
      {industriesError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">
            <strong>Note:</strong> Could not load industries from server. Using default industry options.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            disabled={isReadonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!formData.name.trim()
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-brand-teal"
              } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
            placeholder="Enter organization name"
            required
          />
          {!formData.name.trim() && (
            <p className="mt-1 text-sm text-red-600">
              Organization name is required
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Type <span className="text-red-500">*</span>
          </label>
          <FilterSelect
            value={formData.type || "Select type"}
            onChange={() => {}}
            className={`w-full rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal ${isReadonly ? "opacity-50 pointer-events-none" : ""
              }`}
            options={[
              "Select type",
              "Private Limited",
              "Public Limited",
              "Partnership",
              "Sole Proprietorship",
              "Non-Profit",
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Size <span className="text-red-500">*</span>
          </label>
          <FilterSelect
            value={formData.size || "Select size"}
            onChange={() => {}}
            className={`w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal ${isReadonly ? "opacity-50 pointer-events-none" : ""
              }`}
            options={[
              "Select size",
              "1-10 employees",
              "11-50 employees",
              "51-200 employees",
              "201-500 employees",
              "500+ employees",
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <FilterSelect
            value={formData.industry || "Select industry"}
            onChange={() => {}}
            className={`w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal ${isReadonly ? "opacity-50 pointer-events-none" : ""
              }`}
            options={getIndustryOptions()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <Input
            type="url"
            value={formData.website}
            onBlur={(e) => validateField("website", e.target.value)}
            disabled={isReadonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.website
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-brand-teal"
              } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
            placeholder="www.example.com"
          />
          {fieldErrors.website && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.website}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onBlur={(e) => validateField("email", e.target.value)}
            disabled={isReadonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!formData.email.trim() || fieldErrors.email
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-brand-teal"
              } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
            placeholder="contact@example.com"
            required
          />
          {!formData.email.trim() && (
            <p className="mt-1 text-sm text-red-600">
              Email address is required
            </p>
          )}
          {formData.email.trim() && fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onBlur={(e) => validateField("phone", e.target.value)}
            disabled={isReadonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!formData.phone.trim() || fieldErrors.phone
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-brand-teal"
              } ${isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}`}
            placeholder="+91 9876543210"
            required
          />
          {!formData.phone.trim() && (
            <p className="mt-1 text-sm text-red-600">
              Phone number is required
            </p>
          )}
          {formData.phone.trim() && fieldErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.city}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.state}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter state"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.country}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter country"
          />
        </div>
      </div>

      {/* Edit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={openEditModal}
          variant="gradient"
          size="sm"
          className="inline-flex items-center gap-2"
        >
          <Edit size={16} />
          Edit Organization Info
        </Button>
      </div>

      {/* Edit Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Organization Information
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {updateError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800">
                    <strong>Error:</strong> {updateError}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="Enter organization name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <FilterSelect
                    value={editFormData.type || "Select type"}
                    onChange={(value) =>
                      handleEditInputChange("type", value === "Select type" ? "" : value)
                    }
                    className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    options={[
                      "Select type",
                      "Private Limited",
                      "Public Limited",
                      "Partnership",
                      "Sole Proprietorship",
                      "Non-Profit",
                    ]}
                  />
                  {fieldErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Size <span className="text-red-500">*</span>
                  </label>
                  <FilterSelect
                    value={editFormData.size || "Select size"}
                    onChange={(value) =>
                      handleEditInputChange("size", value === "Select size" ? "" : value)
                    }
                    className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
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
                  {fieldErrors.size && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <FilterSelect
                    value={editFormData.industry || "Select industry"}
                    onChange={(value) =>
                      handleEditInputChange(
                        "industry",
                        value === "Select industry" ? "" : value
                      )
                    }
                    className="w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    options={getIndustryOptions()}
                  />
                  {fieldErrors.industry && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => handleEditInputChange("website", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.website
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="www.example.com"
                  />
                  {fieldErrors.website && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.website}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="contact@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditInputChange("phone", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.phone
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="+91 9876543210"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => handleEditInputChange("city", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.city
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="Enter city"
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => handleEditInputChange("state", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.state
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="Enter state"
                  />
                  {fieldErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => handleEditInputChange("country", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      fieldErrors.country
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-brand-teal"
                    }`}
                    placeholder="Enter country"
                  />
                  {fieldErrors.country && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>
                  )}
                </div>
              </div>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1OrganizationInfo;
