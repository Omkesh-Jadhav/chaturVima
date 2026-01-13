/**
 * Edit Profile Page
 */
import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  ArrowLeft,
  Save,
  CheckCircle2,
  Camera,
  Hash,
  IdCard,
  UserCircle,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Textarea,
  FormSection,
  AnimatedContainer,
  type SelectOption,
} from "../../components/ui";
import { useUser } from "../../context/UserContext";
import { COUNTRY_CODES, SALUTATIONS } from "../../utils/theme";

// Success Modal Component
const SuccessModal = ({
  isOpen,
  onClose,
  onDone,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatedContainer
      animation="fadeIn"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <AnimatedContainer
        animation="scaleIn"
        transitionPreset="spring"
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-r from-brand-teal to-brand-navy p-6 pb-8 relative">
          <div className="relative z-10 text-center">
            <AnimatedContainer
              animation="scaleIn"
              transitionPreset="spring"
              delay="sm"
              className="mb-4 flex justify-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/20"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </AnimatedContainer>
            <h2 className="text-2xl font-bold text-white mb-2">
              Profile Updated! 🎉
            </h2>
            <p className="text-white/90 text-sm">
              Your profile has been successfully updated
            </p>
          </div>
        </div>
        <div className="p-6">
          <Button onClick={onDone} variant="gradient" className="w-full">
            Done
          </Button>
        </div>
      </AnimatedContainer>
    </AnimatedContainer>
  );
};

interface FormData {
  profilePhoto: string;
  employeeId: string;
  salutation: string;
  name: string;
  designation: string;
  department: string;
  countryCode: string;
  phoneNumber: string;
  emailAddress: string;
  city: string;
  country: string;
  briefDescription: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate options from constants
  const salutationOptions = useMemo<SelectOption[]>(
    () => SALUTATIONS.map((sal) => ({ value: sal, label: sal })),
    []
  );

  const countryCodeOptions = useMemo<SelectOption[]>(
    () =>
      COUNTRY_CODES.map(([code, , flag]) => ({
        value: code,
        label: code,
        icon: <span className="text-base">{flag}</span>,
      })),
    []
  );

  const [formData, setFormData] = useState<FormData>({
    profilePhoto: "",
    employeeId: "EMP-2022-0456",
    salutation: "Ms.",
    name: "Sarah Johnson",
    designation: "Senior Software Engineer",
    department: "Engineering",
    countryCode: "+91",
    phoneNumber: "98765 43210",
    emailAddress: "sarah.johnson@company.com",
    city: "San Francisco",
    country: "United States",
    briefDescription:
      "Experienced software engineer with a passion for building scalable applications and leading technical teams.",
  });

  // Prefill form data from user context
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user.replace(/[^a-z0-9]/g, '')}`,
      name: user.full_name,
      designation: user.role_profile[0] || "Employee", // Use first role
      department: "General", // Default department since it's not in API response
      emailAddress: user.user,
    }));
  }, [user]);

  const handleChange = (field: keyof FormData, value: string) => {
    if (field !== "salutation" && field !== "briefDescription") return;

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.salutation.trim().length > 10) {
      newErrors.salutation = "Salutation must be less than 10 characters";
    }
    if (formData.briefDescription.trim().length > 500) {
      newErrors.briefDescription =
        "Brief Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateProfile?.({
        full_name: formData.name.trim(),
        user: formData.emailAddress.trim(),
        role_profile: [formData.designation], // Convert to array
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/settings")}
          size="sm"
          className="shrink-0"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-brand-teal" />
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            Edit Profile
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column - Profile Photo & Basic Info */}
        <div className="lg:col-span-1">
          <AnimatedContainer animation="fadeInUp" transitionPreset="normal">
            <Card
              variant="elevated"
              className="overflow-hidden border border-gray-200"
            >
              <CardContent className="p-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-linear-to-br from-brand-teal/20 to-brand-navy/20 flex items-center justify-center ring-2 ring-brand-teal/20">
                      {formData.profilePhoto ? (
                        <img
                          src={formData.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="primary"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full p-2.5 w-auto h-auto ring-2 ring-white"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-base font-semibold text-gray-900">
                      {formData.salutation} {formData.name || "Your Name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formData.designation || "Designation"}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>

                {/* Employee Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-brand-teal" />
                    Employee Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="p-2 rounded-md bg-blue-100">
                        <Hash className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">
                          Employee ID
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {formData.employeeId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatedContainer animation="fadeInRight" transitionPreset="normal">
            <Card
              variant="elevated"
              className="border-2 border-gray-100 shadow-xl"
            >
              <CardContent className="p-5 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <FormSection icon={User} title="Personal Information">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <span>Salutation</span>
                          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                            Editable
                          </span>
                        </label>
                        <Select
                          value={formData.salutation}
                          onChange={(value) =>
                            handleChange("salutation", value)
                          }
                          options={salutationOptions}
                          error={errors.salutation}
                        />
                      </div>
                      <Input
                        label="Name"
                        type="text"
                        value={formData.name}
                        disabled
                        readOnly
                      />
                      <Input
                        label="Designation"
                        type="text"
                        value={formData.designation}
                        disabled
                        readOnly
                      />
                      <Input
                        label="Department"
                        type="text"
                        value={formData.department}
                        disabled
                        readOnly
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    icon={Mail}
                    title="Contact Information"
                    iconColor="from-blue-500 to-cyan-500"
                    className="pt-5 border-t-2 border-gray-100"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Email ID"
                        type="email"
                        value={formData.emailAddress}
                        disabled
                        readOnly
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="w-[110px] shrink-0">
                            <Select
                              value={formData.countryCode}
                              onChange={() => {}}
                              options={countryCodeOptions}
                              disabled
                            />
                          </div>
                          <Input
                            type="tel"
                            value={formData.phoneNumber}
                            disabled
                            className="flex-1"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    icon={MapPin}
                    title="Location Information"
                    iconColor="from-orange-400 to-amber-400"
                    className="pt-5 border-t-2 border-gray-100"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="City"
                        type="text"
                        value={formData.city}
                        disabled
                        readOnly
                      />
                      <Input
                        label="Country"
                        type="text"
                        value={formData.country}
                        disabled
                        readOnly
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    icon={FileText}
                    title="Brief Description"
                    editable
                    iconColor="from-purple-500 to-pink-500"
                    className="pt-5 border-t-2 border-gray-100"
                  >
                    <Textarea
                      placeholder="Tell us about yourself, your interests, or any additional information you'd like to share..."
                      value={formData.briefDescription}
                      onChange={(e) =>
                        handleChange("briefDescription", e.target.value)
                      }
                      rows={5}
                      maxLength={500}
                      error={errors.briefDescription}
                      characterCount={{
                        current: formData.briefDescription.length,
                        max: 500,
                      }}
                    />
                  </FormSection>

                  {errors.submit && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <span>⚠️</span>
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-100 mt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/settings")}
                      disabled={isLoading}
                      size="lg"
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      isLoading={isLoading}
                      size="lg"
                      className="px-8"
                    >
                      {!isLoading && <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        onDone={() => {
          setShowSuccess(false);
          navigate("/settings");
        }}
      />
    </div>
  );
};

export default EditProfile;
