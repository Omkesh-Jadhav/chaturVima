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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Globe,
  FileText,
  UserCircle,
  ChevronDown,
  Hash,
  IdCard,
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
  salutation: string;
  name: string;
  designation: string;
  department: string;
  countryCode: string;
  phoneNumber: string;
  emailAddress: string;
  doj: string;
  address: string;
  location: string;
  city: string;
  country: string;
  bio: string;
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
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
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
    salutation: "Ms.",
    name: "Sarah Johnson",
    designation: "Senior Software Engineer",
    department: "Engineering",
    countryCode: "+91",
    phoneNumber: "9876543210",
    emailAddress: "sarah.johnson@company.com",
    doj: "2022-03-15",
    address: "123 Main Street, Apt 4B",
    location: "Downtown",
    city: "San Francisco",
    country: "United States",
    bio: "Experienced software engineer with a passion for building scalable applications and leading technical teams.",
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
      if (
        countryCodeDropdownRef.current &&
        !countryCodeDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryCodeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update phone number format when country code changes
  const prevCountryCodeRef = useRef<string>(formData.countryCode);
  useEffect(() => {
    if (
      prevCountryCodeRef.current !== formData.countryCode &&
      formData.phoneNumber
    ) {
      const digitsOnly = formData.phoneNumber.replace(/\D/g, "");

      if (formData.countryCode === "+91") {
        // For Indian numbers: limit to 10 digits and format with space
        const limitedDigits = digitsOnly.slice(0, 10);
        const formatted =
          limitedDigits.length > 5
            ? `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`
            : limitedDigits;
        setFormData((prev) => ({ ...prev, phoneNumber: formatted }));
      } else {
        // For other countries: just digits, no formatting
        const limitedDigits = digitsOnly.slice(0, 15);
        setFormData((prev) => ({ ...prev, phoneNumber: limitedDigits }));
      }
      prevCountryCodeRef.current = formData.countryCode;
    }
  }, [formData.countryCode, formData.phoneNumber]);

  const handleChange = (field: keyof FormData, value: string) => {
    // Special handling for phone number - only allow digits
    if (field === "phoneNumber") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      // For Indian numbers, limit to 10 digits
      if (formData.countryCode === "+91") {
        const limitedDigits = digitsOnly.slice(0, 10);
        // Format: add space after 5 digits for better readability
        const formatted =
          limitedDigits.length > 5
            ? `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`
            : limitedDigits;
        setFormData((prev) => ({ ...prev, [field]: formatted }));
      } else {
        // For other countries, allow up to 15 digits
        const limitedDigits = digitsOnly.slice(0, 15);
        setFormData((prev) => ({ ...prev, [field]: limitedDigits }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Name can only contain letters, spaces, and special characters (., ', -)";
    }

    // Email validation
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    } else if (formData.emailAddress.length > 100) {
      newErrors.emailAddress = "Email must be less than 100 characters";
    }

    // Phone number validation
    const cleanedPhone = formData.phoneNumber.replace(/\D/g, ""); // Remove all non-digits

    // India specific validation (+91)
    if (formData.countryCode === "+91") {
      if (formData.phoneNumber.trim()) {
        if (cleanedPhone.length !== 10) {
          newErrors.phoneNumber =
            "Indian mobile number must be exactly 10 digits";
        } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
          newErrors.phoneNumber =
            "Indian mobile number must start with 6, 7, 8, or 9";
        }
      }
    } else {
      // For other countries
      if (formData.phoneNumber.trim()) {
        if (cleanedPhone.length < 7) {
          newErrors.phoneNumber = "Phone number must be at least 7 digits";
        } else if (cleanedPhone.length > 15) {
          newErrors.phoneNumber = "Phone number must be less than 15 digits";
        }
      }
    }

    // Date of Joining validation
    if (formData.doj) {
      const dojDate = new Date(formData.doj);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dojDate.getTime())) {
        newErrors.doj = "Please enter a valid date";
      } else if (dojDate > today) {
        newErrors.doj = "Date of joining cannot be in the future";
      } else {
        // Check if date is too old (e.g., more than 100 years ago)
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
        if (dojDate < hundredYearsAgo) {
          newErrors.doj = "Date of joining seems invalid";
        }
      }
    }

    // Address validation
    if (formData.address.trim() && formData.address.trim().length > 200) {
      newErrors.address = "Address must be less than 200 characters";
    }

    // Location validation
    if (formData.location.trim() && formData.location.trim().length > 50) {
      newErrors.location = "Location must be less than 50 characters";
    }

    // City validation
    if (formData.city.trim() && formData.city.trim().length > 50) {
      newErrors.city = "City must be less than 50 characters";
    } else if (
      formData.city.trim() &&
      !/^[a-zA-Z\s.'-]+$/.test(formData.city.trim())
    ) {
      newErrors.city =
        "City can only contain letters, spaces, and special characters";
    }

    // Country validation
    if (formData.country.trim() && formData.country.trim().length > 50) {
      newErrors.country = "Country must be less than 50 characters";
    } else if (
      formData.country.trim() &&
      !/^[a-zA-Z\s.'-]+$/.test(formData.country.trim())
    ) {
      newErrors.country =
        "Country can only contain letters, spaces, and special characters";
    }

    // Bio validation
    if (formData.bio.trim() && formData.bio.trim().length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
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

      // Update profile via context
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
                          EMP-2022-0456
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
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Personal Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 rounded-md bg-brand-teal/10">
                        <User className="h-4 w-4 text-brand-teal" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Salutation */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <UserCircle className="h-3 w-3 text-gray-400" />
                          Salutation
                        </label>
                        <div className="relative" ref={salutationDropdownRef}>
                          <button
                            type="button"
                            onClick={() =>
                              setSalutationDropdownOpen(!salutationDropdownOpen)
                            }
                            className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-brand-teal/30 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal/50 cursor-pointer"
                          >
                            <span>{formData.salutation}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-500 transition-transform ${
                                salutationDropdownOpen
                                  ? "rotate-180"
                                  : "rotate-0"
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {salutationDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="absolute right-0 z-10 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                              >
                                {salutations.map((salutation) => (
                                  <button
                                    key={salutation}
                                    type="button"
                                    onClick={() => {
                                      handleChange("salutation", salutation);
                                      setSalutationDropdownOpen(false);
                                    }}
                                    className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
                                      formData.salutation === salutation
                                        ? "bg-gradient-to-r from-brand-teal/15 to-brand-navy/15 text-brand-navy font-medium"
                                        : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5"
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

                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          error={errors.name}
                          required
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      {/* Designation - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-gray-400" />
                          Designation
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={formData.designation}
                            disabled
                            className="h-9 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200">
                              <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-tight">
                                Locked
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <span>🔒</span> This field cannot be modified
                        </p>
                      </div>

                      {/* Department - Read Only */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Building className="h-3 w-3 text-gray-400" />
                          Department
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={formData.department}
                            disabled
                            className="h-9 text-sm bg-gray-50 border border-gray-200 cursor-not-allowed"
                            readOnly
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200">
                              <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-tight">
                                Locked
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <span>🔒</span> This field cannot be modified
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 pb-2">
                      <div className="p-1.5 rounded-md bg-blue-100">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          {/* Country Code Dropdown */}
                          <div
                            className="relative"
                            ref={countryCodeDropdownRef}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setCountryCodeDropdownOpen(
                                  !countryCodeDropdownOpen
                                )
                              }
                              className="inline-flex h-9 min-w-[80px] items-center justify-between rounded-lg border border-brand-teal/30 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal/50 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-base">
                                  {
                                    countryCodes.find(
                                      (cc) => cc.code === formData.countryCode
                                    )?.flag
                                  }
                                </span>
                                <span className="font-medium">
                                  {formData.countryCode}
                                </span>
                              </span>
                              <ChevronDown
                                className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                                  countryCodeDropdownOpen
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {countryCodeDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="absolute left-0 z-10 mt-2 max-h-60 w-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg custom-scrollbar"
                                >
                                  {countryCodes.map((item) => (
                                    <button
                                      key={item.code}
                                      type="button"
                                      onClick={() => {
                                        handleChange("countryCode", item.code);
                                        setCountryCodeDropdownOpen(false);
                                      }}
                                      className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                        formData.countryCode === item.code
                                          ? "bg-gradient-to-r from-brand-teal/15 to-brand-navy/15 text-brand-navy font-medium"
                                          : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5"
                                      }`}
                                    >
                                      <span className="text-base">
                                        {item.flag}
                                      </span>
                                      <span className="flex-1 font-medium">
                                        {item.code}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {item.country}
                                      </span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {/* Phone Number Input */}
                          <Input
                            type="tel"
                            placeholder={
                              formData.countryCode === "+91"
                                ? "98765 43210"
                                : "Enter phone number"
                            }
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              handleChange("phoneNumber", e.target.value)
                            }
                            onKeyDown={(e) => {
                              // Prevent non-digit keys except backspace, delete, tab, arrow keys
                              if (
                                !/[0-9]/.test(e.key) &&
                                ![
                                  "Backspace",
                                  "Delete",
                                  "Tab",
                                  "ArrowLeft",
                                  "ArrowRight",
                                  "ArrowUp",
                                  "ArrowDown",
                                  "Home",
                                  "End",
                                ].includes(e.key) &&
                                !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd + A, C, V, X
                              ) {
                                e.preventDefault();
                              }
                            }}
                            maxLength={formData.countryCode === "+91" ? 11 : 15} // 10 digits + 1 space for Indian
                            error={errors.phoneNumber}
                            className="h-9 flex-1 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.emailAddress}
                          onChange={(e) =>
                            handleChange("emailAddress", e.target.value)
                          }
                          error={errors.emailAddress}
                          required
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Employment Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 pb-2">
                      <div className="p-1.5 rounded-md bg-green-100">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Employment Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Date of Joining */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          Date of Joining (DOJ)
                        </label>
                        <Input
                          type="date"
                          value={formData.doj}
                          onChange={(e) => handleChange("doj", e.target.value)}
                          error={errors.doj}
                          max={new Date().toISOString().split("T")[0]}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 pb-2">
                      <div className="p-1.5 rounded-md bg-orange-100">
                        <MapPin className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Location Information
                      </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Address */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          Address
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your full address"
                          value={formData.address}
                          onChange={(e) =>
                            handleChange("address", e.target.value)
                          }
                          error={errors.address}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          Location
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter location"
                          value={formData.location}
                          onChange={(e) =>
                            handleChange("location", e.target.value)
                          }
                          error={errors.location}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          City
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          error={errors.city}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          Country
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter country"
                          value={formData.country}
                          onChange={(e) =>
                            handleChange("country", e.target.value)
                          }
                          error={errors.country}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Bio Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 pb-2">
                      <div className="p-1.5 rounded-md bg-purple-100">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Bio or Comment
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        rows={4}
                        maxLength={500}
                        className={`flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                          errors.bio
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        {errors.bio && (
                          <p className="text-xs text-red-600">{errors.bio}</p>
                        )}
                        <p className="ml-auto text-xs text-gray-500">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-sm font-medium text-red-600">
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-200"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/settings")}
                      disabled={isLoading}
                      className="cursor-pointer border-gray-300 hover:bg-gray-50 font-medium"
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
                        className="cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg hover:shadow-xl transition-all font-medium px-6"
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
