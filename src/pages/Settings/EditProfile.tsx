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

  const salutations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

  const [formData, setFormData] = useState<FormData>({
    profilePhoto: "",
    salutation: "Ms.",
    name: "Sarah Johnson",
    designation: "Senior Software Engineer",
    department: "Engineering",
    phoneNumber: "+1 (555) 123-4567",
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

  // Close dropdown when clicking outside
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    if (formData.phoneNumber && !/^[\d\s\-+()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
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
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="p-2 rounded-md bg-green-100">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">
                          User ID
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          USR-789012
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
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            handleChange("phoneNumber", e.target.value)
                          }
                          error={errors.phoneNumber}
                          className="h-9 text-sm focus:border-transparent focus:ring-1 focus:ring-brand-teal"
                        />
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
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
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
