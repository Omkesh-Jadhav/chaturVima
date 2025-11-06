/**
 * Edit Profile Page
 * Full-width multi-step form with tips sidebar
 */
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ArrowLeft,
  Save,
  CheckCircle2,
  Briefcase,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  Info,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "../../components/ui";
import { useUser } from "../../context/UserContext";
import { cn } from "../../utils/cn";

// Success Modal Component
const SuccessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: [
          "#2BC6B4",
          "#1E3A5F",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#10B981",
        ][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, window.innerHeight + 20],
              rotate: 360,
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-brand-teal via-brand-navy to-brand-teal p-8 pb-12 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <CheckCircle2 className="h-12 w-12 text-white" />
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

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Profile Updated! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-lg"
            >
              Your profile has been successfully updated
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Sparkles className="h-5 w-5 text-brand-teal" />
                <span className="text-sm font-medium">
                  All changes have been saved
                </span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed">
                Your profile information has been updated successfully. You can
                continue using the application with your updated details.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                size="lg"
                className="cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 min-w-[200px]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

type FormStep = 1 | 2 | 3;

interface FormData {
  // Step 1: Personal Info
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  // Step 2: Professional Details
  department: string;
  jobTitle: string;
  manager: string;
  experience: string;
  // Step 3: Location and Background
  location: string;
  timezone: string;
  bio: string;
}

const STEPS = [
  {
    number: 1,
    title: "Personal Info",
    icon: User,
  },
  {
    number: 2,
    title: "Professional Details",
    icon: Briefcase,
  },
  {
    number: 3,
    title: "Location & Background",
    icon: MapPin,
  },
];

const STEP_TIPS = {
  1: [
    "Use your full legal name as it appears on official documents",
    "Ensure your email is active and accessible for important notifications",
    "Phone number helps us reach you for urgent matters",
  ],
  2: [
    "Select the department that best matches your current role",
    "Job title should reflect your current position accurately",
    "Manager information helps organize team structure",
  ],
  3: [
    "Location helps with timezone and regional settings",
    "Timezone ensures proper scheduling and notifications",
    "Bio section is optional but helps others know you better",
  ],
};

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Form state with prefilled data
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    department: "",
    jobTitle: "",
    manager: "",
    experience: "",
    location: "",
    timezone: "",
    bio: "",
  });

  // Initial form data for comparison
  const [initialData, setInitialData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    department: "",
    jobTitle: "",
    manager: "",
    experience: "",
    location: "",
    timezone: "",
    bio: "",
  });

  // Prefill form when user data is available
  useEffect(() => {
    if (user) {
      const initial: FormData = {
        name: user.name || "",
        email: user.email || "",
        phone: "",
        dateOfBirth: "",
        department: user.department || "",
        jobTitle: "",
        manager: "",
        experience: "",
        location: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        bio: "",
      };
      setFormData(initial);
      setInitialData(initial);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(changed);
  }, [formData, initialData]);

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (step === 2) {
      if (!formData.department.trim()) {
        newErrors.department = "Department is required";
      }

      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
      }
    }

    if (step === 3) {
      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update profile via context
      if (updateProfile) {
        updateProfile({
          name: formData.name.trim(),
          email: formData.email.trim(),
          department: formData.department.trim(),
        });
      }

      // Update initial data to reflect saved state
      setInitialData({ ...formData });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                error={errors.dateOfBirth}
                className="h-11"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your department"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                error={errors.department}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Software Engineer, Manager"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                error={errors.jobTitle}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Manager / Reporting To
              </label>
              <Input
                type="text"
                placeholder="Manager's name"
                value={formData.manager}
                onChange={(e) => handleChange("manager", e.target.value)}
                error={errors.manager}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <Input
                type="text"
                placeholder="e.g., 5 years"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                error={errors.experience}
                className="h-11"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  error={errors.location}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <Input
                  type="text"
                  placeholder="Select your timezone"
                  value={formData.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  error={errors.timezone}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bio / About
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={5}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
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

      {/* Main Content Grid - Full Width */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form Section - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stepper */}
          <Card
            variant="elevated"
            className="overflow-hidden bg-gradient-to-r from-brand-teal/5 to-brand-navy/5 border-brand-teal/20"
          >
            <CardContent className="p-2 py-2.5">
              <div className="relative">
                {/* Progress Background Line */}
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 rounded-full z-0" />
                <motion.div
                  className="absolute top-3 left-0 h-0.5 bg-gradient-to-r from-brand-teal to-brand-navy rounded-full z-10 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />

                {/* Steps */}
                <div className="relative flex items-center justify-between z-20">
                  {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;

                    return (
                      <div
                        key={step.number}
                        className="flex flex-col items-center flex-1"
                      >
                        {/* Step Circle */}
                        <motion.div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            isCompleted
                              ? "bg-brand-teal border-brand-teal text-white shadow-md"
                              : isActive
                              ? "bg-brand-teal border-brand-teal text-white shadow-lg ring-2 ring-brand-teal/30 scale-110"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                          animate={{
                            scale: isActive ? 1.1 : isCompleted ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" />
                          )}
                          {/* Active Step Pulse Animation */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-brand-teal"
                              animate={{
                                scale: [1, 1.5, 1.5],
                                opacity: [0.4, 0, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                              }}
                            />
                          )}
                        </motion.div>

                        {/* Step Label */}
                        <div className="mt-0.5 text-center">
                          <motion.p
                            className={`text-[10px] font-semibold transition-colors ${
                              isActive
                                ? "text-brand-teal"
                                : isCompleted
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                            animate={{
                              scale: isActive ? 1.05 : 1,
                            }}
                          >
                            {step.title}
                          </motion.p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-brand-teal" />
                {STEPS[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 mt-6">
                    <p className="text-sm font-medium text-red-600">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    size="sm"
                    className="cursor-pointer text-xs py-1.5 h-auto"
                  >
                    <ChevronLeft className="mr-1.5 h-3.5 w-3.5" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        size="sm"
                        className="cursor-pointer text-xs py-1.5 h-auto bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-sm"
                      >
                        Next Step
                        <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/settings")}
                          disabled={isLoading}
                          size="sm"
                          className="cursor-pointer text-xs py-1.5 h-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          isLoading={isLoading}
                          disabled={!hasChanges}
                          size="sm"
                          className={cn(
                            "cursor-pointer text-xs py-1.5 h-auto shadow-sm",
                            hasChanges
                              ? "bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90"
                              : "bg-gray-200 border border-gray-300 text-gray-700 cursor-not-allowed"
                          )}
                        >
                          {!isLoading && (
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Tips & Suggestions - Takes 1/3 width */}
        <div className="space-y-3">
          {/* Tips Card */}
          <Card
            variant="elevated"
            className="border-l-4 border-l-brand-teal bg-gradient-to-br from-brand-teal/5 to-transparent"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-brand-teal" />
                Tips & Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
              {STEP_TIPS[currentStep].map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-2 rounded-md bg-white/60 border border-gray-200/50 hover:border-brand-teal/40 hover:bg-brand-teal/5 transition-all duration-200 group"
                >
                  <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-brand-teal text-white text-[10px] font-bold shadow-sm group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed flex-1">
                    {tip}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card
            variant="elevated"
            className="border-l-4 border-l-brand-navy bg-gradient-to-br from-brand-navy/5 to-transparent"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-brand-navy" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-3 pt-0">
              <div className="flex items-start gap-2 p-2 rounded-md bg-white/60 border border-gray-200/50 hover:border-brand-navy/40 hover:bg-brand-navy/5 transition-all duration-200">
                <Sparkles className="h-3 w-3 text-brand-navy shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed">
                  Fields marked with{" "}
                  <span className="text-red-500 font-semibold">*</span> are
                  required
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-md bg-white/60 border border-gray-200/50 hover:border-brand-navy/40 hover:bg-brand-navy/5 transition-all duration-200">
                <Sparkles className="h-3 w-3 text-brand-navy shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed">
                  Review all information before submitting
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default EditProfile;
