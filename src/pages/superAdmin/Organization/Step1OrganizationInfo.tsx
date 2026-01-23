import React, { useState, useEffect } from "react";
import {
  validateEmail,
  validatePhone,
  validateWebsite,
} from "./validationUtils";
import type { OrganizationInfo } from "./types";
import { FilterSelect, Input } from "@/components/ui";
import { useUser } from "@/context/UserContext";
import { useGetOrganizationDetails } from "@/hooks/useEmployees";


interface Step1OrganizationInfoProps {
  data: OrganizationInfo;
  onUpdate: (data: OrganizationInfo) => void;
}

const Step1OrganizationInfo: React.FC<Step1OrganizationInfoProps> = ({
  data,
  onUpdate,
}) => {
  const { user } = useUser();
  const [formData, setFormData] = useState<OrganizationInfo>(data);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Fetch organization details from API
  const { data: organizationData, isLoading: isLoadingOrg, error: orgError } = useGetOrganizationDetails("Chaturvima");

  // Determine if the form should be readonly based on user role
  const isReadonly = user?.role_profile?.includes("hr-admin");

  // Pre-fill form data when organization data is loaded from API
  useEffect(() => {
    if (organizationData?.data) {
      const apiData = organizationData.data;
      const mappedData: OrganizationInfo = {
        name: apiData.company_name || "",
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

  const handleInputChange = (field: keyof OrganizationInfo, value: string) => {
    // Prevent changes if user is hr-admin (readonly mode)
    if (isReadonly) return;

    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Organization Info
        </h2>
        <div className="flex items-center gap-3">
          {isLoadingOrg && (
            <span className="text-sm text-gray-500">Loading organization data...</span>
          )}
          {isReadonly && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              View Only
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
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
            Organization Type *
          </label>
          <FilterSelect
            value={formData.type || "Select type"}
            onChange={(value) =>
              handleInputChange("type", value === "Select type" ? "" : value)
            }
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
            Organization Size *
          </label>
          <FilterSelect
            value={formData.size || "Select size"}
            onChange={(value) =>
              handleInputChange("size", value === "Select size" ? "" : value)
            }
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
            Industry *
          </label>
          <FilterSelect
            value={formData.industry || "Select industry"}
            onChange={(value) =>
              handleInputChange(
                "industry",
                value === "Select industry" ? "" : value
              )
            }
            className={`w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal ${isReadonly ? "opacity-50 pointer-events-none" : ""
              }`}
            options={[
              "Select industry",
              "Technology",
              "Healthcare",
              "Finance",
              "Education",
              "Manufacturing",
              "Retail",
              "Other",
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <Input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
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
            Email Address *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
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
            Phone Number *
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
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
            City *
          </label>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <Input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter state"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <Input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            disabled={isReadonly}
            className={isReadonly ? "bg-gray-50 cursor-not-allowed" : ""}
            placeholder="Enter country"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1OrganizationInfo;
