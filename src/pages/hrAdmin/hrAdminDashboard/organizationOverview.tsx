import { Building2, MapPin, Briefcase, Globe, Mail, Phone } from "lucide-react";
import { AnimatedContainer } from "@/components/ui";
import { SectionHeader } from "@/components/assessmentDashboard";

const CARD_BASE_CLASSES =
  "group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md";

// Mock organization data - Replace with actual data from API/context
const MOCK_ORGANIZATION_DATA = {
  name: "Mannlowe Information Services Pvt Ltd",
  type: "Private Limited",
  size: "Medium (50-200)",
  industry: "Information Technology",
  location: {
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
  },
  contact: {
    email: "info@mannlowe.com",
    phone: "+91 1234567890",
    website: "www.mannlowe.com",
  },
};

const OrganizationOverview = () => {
  const { name, type, size, industry, location, contact } =
    MOCK_ORGANIZATION_DATA;

  return (
    <AnimatedContainer
      animation="fadeInUp"
      transitionPreset="slow"
      className={CARD_BASE_CLASSES}
    >
      <SectionHeader
        title="Organization Overview"
        description="Key information about your organization"
      />

      <div className="mt-4 space-y-4">
        {/* Organization Name & Type */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-teal to-brand-navy text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {type}
              </span>
              <span className="text-gray-400">•</span>
              <span>{size}</span>
              <span className="text-gray-400">•</span>
              <span>{industry}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-600">
            {location.city}, {location.state}, {location.country}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-600 truncate">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-600">{contact.phone}</span>
          </div>
          {contact.website && (
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <Globe className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-600 truncate">{contact.website}</span>
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default OrganizationOverview;
