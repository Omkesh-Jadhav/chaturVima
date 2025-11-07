/**
 * Edit Profile Page
 * Modern, professional profile editing interface
 */
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ArrowLeft,
  Save,
  CheckCircle2,
  Camera,
  ChevronDown,
  Hash,
  IdCard,
  UserCircle,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import { Button, Card, CardContent, Input } from "../../components/ui";
import { useUser } from "../../context/UserContext";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-teal to-brand-navy p-6 pb-8 relative">
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
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
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Profile Updated! 🎉
            </h2>
            <p className="text-white/90 text-sm">
              Your profile has been successfully updated
            </p>
          </div>
        </div>
        <div className="p-6">
          <Button
            onClick={onDone}
            className="w-full cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
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
  const [salutationDropdownOpen, setSalutationDropdownOpen] = useState(false);
  const salutationDropdownRef = useRef<HTMLDivElement>(null);
  const countryCodeDropdownRef = useRef<HTMLDivElement>(null);

  const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

  const countryCodes = [
    { code: "+1", country: "US", flag: "🇺🇸" },
    { code: "+91", country: "IN", flag: "🇮🇳" },
    { code: "+44", country: "GB", flag: "🇬🇧" },
    { code: "+61", country: "AU", flag: "🇦🇺" },
    { code: "+86", country: "CN", flag: "🇨🇳" },
    { code: "+81", country: "JP", flag: "🇯🇵" },
    { code: "+49", country: "DE", flag: "🇩🇪" },
    { code: "+33", country: "FR", flag: "🇫🇷" },
    { code: "+39", country: "IT", flag: "🇮🇹" },
    { code: "+34", country: "ES", flag: "🇪🇸" },
    { code: "+7", country: "RU", flag: "🇷🇺" },
    { code: "+82", country: "KR", flag: "🇰🇷" },
    { code: "+55", country: "BR", flag: "🇧🇷" },
    { code: "+52", country: "MX", flag: "🇲🇽" },
    { code: "+27", country: "ZA", flag: "🇿🇦" },
    { code: "+971", country: "AE", flag: "🇦🇪" },
    { code: "+65", country: "SG", flag: "🇸🇬" },
    { code: "+60", country: "MY", flag: "🇲🇾" },
    { code: "+66", country: "TH", flag: "🇹🇭" },
    { code: "+84", country: "VN", flag: "🇻🇳" },
  ];

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
    if (user) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: user.avatar || prev.profilePhoto,
        name: user.name || prev.name,
        designation: user.role || prev.designation,
        department: user.department || prev.department,
        emailAddress: user.email || prev.emailAddress,
      }));
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        salutationDropdownRef.current &&
        !salutationDropdownRef.current.contains(event.target as Node)
      ) {
        setSalutationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    // Only allow changes to editable fields: salutation and briefDescription
    if (field === "salutation" || field === "briefDescription") {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
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

    // Only validate editable fields: Salutation and Brief Description
    // Salutation validation (optional, but if provided should be valid)
    if (formData.salutation.trim() && formData.salutation.trim().length > 10) {
      newErrors.salutation = "Salutation must be less than 10 characters";
    }

    // Brief Description validation
    if (
      formData.briefDescription.trim() &&
      formData.briefDescription.trim().length > 500
    ) {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update profile via context - only update editable fields
      if (updateProfile) {
        updateProfile({
          name: formData.name.trim(),
          email: formData.emailAddress.trim(),
          department: formData.department,
          avatar: formData.profilePhoto,
        });
      }

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
          className="cursor-pointer text-xs py-1.5 h-auto shrink-0"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              variant="elevated"
              className="overflow-hidden border border-gray-200"
            >
              <CardContent className="p-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-brand-teal/20 to-brand-navy/20 flex items-center justify-center ring-2 ring-brand-teal/20"
                    >
                      {formData.profilePhoto ? (
                        <img
                          src={formData.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-16 w-16 text-gray-400" />
                      )}
                    </motion.div>
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute bottom-0 right-0 p-2.5 rounded-full bg-brand-teal text-white shadow-lg hover:bg-brand-teal/90 transition-all ring-2 ring-white"
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button>
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
          </motion.div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              variant="elevated"
              className="border-2 border-gray-100 shadow-xl"
            >
              <CardContent className="p-5 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Personal Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="rounded-lg bg-gradient-to-br from-brand-teal to-brand-navy p-2 text-white shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Salutation */}
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <span>Salutation</span>
                          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                            Editable
                          </span>
                        </label>
                        <div className="relative" ref={salutationDropdownRef}>
                          <button
                            type="button"
                            onClick={() =>
                              setSalutationDropdownOpen(!salutationDropdownOpen)
                            }
                            className="inline-flex h-10 w-full items-center justify-between rounded-xl border border-brand-teal/40 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors focus:outline-none focus:ring-0 focus:border-brand-teal/40 cursor-pointer"
                          >
                            <span>{formData.salutation}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-brand-teal transition-transform duration-200 ${
                                salutationDropdownOpen
                                  ? "rotate-180"
                                  : "rotate-0"
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {salutationDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 z-10 mt-2 w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-xl"
                              >
                                {salutations.map((salutation) => (
                                  <button
                                    key={salutation}
                                    type="button"
                                    onClick={() => {
                                      handleChange("salutation", salutation);
                                      setSalutationDropdownOpen(false);
                                    }}
                                    className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                                      formData.salutation === salutation
                                        ? "bg-gradient-to-r from-brand-teal/20 to-brand-navy/20 text-brand-navy border-l-4 border-brand-teal"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {salutation}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Name - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Name
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Designation - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Designation
                        </label>
                        <Input
                          type="text"
                          value={formData.designation}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Department - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Department
                        </label>
                        <Input
                          type="text"
                          value={formData.department}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 pt-5 border-t-2 border-gray-100"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2 text-white shadow-sm">
                        <Mail className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Email ID - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Email ID
                        </label>
                        <Input
                          type="email"
                          value={formData.emailAddress}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Phone Number - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          {/* Country Code Dropdown - Disabled */}
                          <div ref={countryCodeDropdownRef}>
                            <button
                              type="button"
                              disabled
                              className="inline-flex h-10 min-w-[90px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 cursor-not-allowed"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-base">
                                  {
                                    countryCodes.find(
                                      (cc) => cc.code === formData.countryCode
                                    )?.flag
                                  }
                                </span>
                                <span>{formData.countryCode}</span>
                              </span>
                            </button>
                          </div>
                          {/* Phone Number Input - Read Only */}
                          <Input
                            type="tel"
                            value={formData.phoneNumber}
                            disabled
                            className="h-10 flex-1 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4 pt-5 border-t-2 border-gray-100"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 p-2 text-white shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Location Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* City - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          City
                        </label>
                        <Input
                          type="text"
                          value={formData.city}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>

                      {/* Country - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Country
                        </label>
                        <Input
                          type="text"
                          value={formData.country}
                          disabled
                          className="h-10 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Brief Description Section - Editable */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 pt-5 border-t-2 border-gray-100"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white shadow-sm">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Brief Description
                      </h3>
                      <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                        Editable
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        placeholder="Tell us about yourself, your interests, or any additional information you'd like to share..."
                        value={formData.briefDescription}
                        onChange={(e) =>
                          handleChange("briefDescription", e.target.value)
                        }
                        rows={5}
                        maxLength={500}
                        className={`flex w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-medium transition-colors placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 resize-none shadow-sm ${
                          errors.briefDescription
                            ? "border-red-300 focus:ring-red-500 focus:border-red-400"
                            : "border-gray-300"
                        }`}
                      />
                      <div className="flex items-center justify-between px-1">
                        {errors.briefDescription && (
                          <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                            <span>⚠️</span>
                            {errors.briefDescription}
                          </p>
                        )}
                        <p className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {formData.briefDescription.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 border-2 border-red-200 p-4 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <span>⚠️</span>
                        {errors.submit}
                      </p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-100 mt-5"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/settings")}
                      disabled={isLoading}
                      className="cursor-pointer border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        className="cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg hover:shadow-xl transition-all font-semibold px-8 py-2.5 rounded-xl"
                      >
                        {!isLoading && <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
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
