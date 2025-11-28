/**
 * Login Page
 * OTP-based authentication page with email and mobile verification
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import type { UserRole } from "../types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Shield,
  RefreshCw,
  User,
} from "lucide-react";
import PhoneInput, { type CountryData } from "react-phone-input-2";
import logoImage from "../assets/chaturvima-logo.png";
import "react-phone-input-2/lib/style.css";
import { getRoleLandingRoute } from "../utils/roleRoutes";

type LoginStep = "credentials" | "otp" | "success";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 60;
const OTP_SEND_DELAY = 1500;
const OTP_VERIFY_DELAY = 1500;
const REDIRECT_DELAY = 1500;

// Dummy credentials for validation - Multiple test emails supported
const VALID_EMAILS = [
  "user@example.com",
  "admin@example.com",
  "hr@example.com",
  "manager@example.com",
  "super-admin@example.com",
];
const VALID_COUNTRY_CODE = "+91";
const VALID_PHONE_NUMBER = "9876543210"; // Format: [country code][phone number] - Must start with 6, 7, 8, or 9

const Login = () => {
  const navigate = useNavigate();
  const { loginWithOTP } = useUser();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [name, setName] = useState("Chaturvima");
  const [email, setEmail] = useState("hr@example.com");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneValue, setPhoneValue] = useState(
    VALID_COUNTRY_CODE.replace("+0", "")
  );
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill("1"));
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && step === "otp") {
      setCanResendOTP(true);
    }
  }, [otpTimer, step]);

  // Validation helpers
  const validateName = useCallback((name: string) => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }, []);

  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validatePhoneNumber = useCallback(
    (phone: string, countryCode: string) => {
      const digitsOnly = phone.replace(/\D/g, "");

      // India specific validation (+91)
      if (countryCode === "+91") {
        if (digitsOnly.length !== 10) {
          return false;
        }
        // Indian mobile numbers must start with 6, 7, 8, or 9
        return /^[6-9]\d{9}$/.test(digitsOnly);
      }

      // For other countries
      // Minimum 7 digits, maximum 15 digits (E.164 standard)
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    },
    []
  );

  const handlePhoneChange = useCallback((value: string, data: CountryData) => {
    const digitsOnly = value.replace(/\D/g, "");
    const dialCode = data?.dialCode?.replace(/\D/g, "") ?? "";
    const nationalNumber = digitsOnly.slice(
      dialCode.length,
      dialCode.length + 15
    );
    setCountryCode(dialCode ? `+${dialCode}` : "+");
    setPhoneNumber(nationalNumber);
    setPhoneValue(`${dialCode}${nationalNumber}`);
  }, []);

  const handleSendOTP = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!validateName(name)) {
        setError("Please enter a valid name (2-50 characters)");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!validatePhoneNumber(phoneNumber, countryCode)) {
        if (countryCode === "+91") {
          setError(
            "Indian mobile number must be exactly 10 digits and start with 6, 7, 8, or 9"
          );
        } else {
          setError("Phone number must be between 7 and 15 digits");
        }
        return;
      }

      // Validate credentials against hardcoded values
      const normalizedEmail = email.toLowerCase().trim();
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

      // Check if email is in the list of valid emails
      const isValidEmail = VALID_EMAILS.some(
        (validEmail) => validEmail.toLowerCase() === normalizedEmail
      );

      if (!isValidEmail) {
        setError("Invalid email address. Please check your credentials.");
        return;
      }

      // Compare country code and phone number
      if (countryCode !== VALID_COUNTRY_CODE) {
        setError("Invalid mobile number. Please check your credentials.");
        return;
      }

      if (cleanedPhoneNumber !== VALID_PHONE_NUMBER) {
        setError("Invalid mobile number. Please check your credentials.");
        return;
      }

      setIsSendingOTP(true);

      try {
        // Simulate API call to send OTP
        await new Promise((resolve) => setTimeout(resolve, OTP_SEND_DELAY));

        setOtpTimer(OTP_TIMER_DURATION);
        setCanResendOTP(false);
        setStep("otp");
      } catch {
        setError("Failed to send OTP. Please try again.");
      } finally {
        setIsSendingOTP(false);
      }
    },
    [
      name,
      email,
      countryCode,
      phoneNumber,
      validateName,
      validateEmail,
      validatePhoneNumber,
    ]
  );

  const handleResendOTP = useCallback(async () => {
    if (!canResendOTP) return;

    setIsSendingOTP(true);
    setError("");

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOtpTimer(OTP_TIMER_DURATION);
      setCanResendOTP(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  }, [canResendOTP]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) return;

    const digit = value.replace(/\D/g, "");

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = digit;
      return newOtp;
    });

    // Auto-focus next input when digit is entered
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        // If current box has a value, clear it and move to previous box
        if (otp[index] && index > 0) {
          e.preventDefault();
          setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index] = "";
            return newOtp;
          });
          // Move to previous box immediately
          setTimeout(() => {
            otpInputRefs.current[index - 1]?.focus();
          }, 0);
        }
        // If current box is empty and not the first box, move to previous and clear it
        else if (!otp[index] && index > 0) {
          e.preventDefault();
          setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index - 1] = "";
            return newOtp;
          });
          // Small delay to ensure the value is cleared before focusing
          setTimeout(() => {
            otpInputRefs.current[index - 1]?.focus();
          }, 0);
        }
      }
    },
    [otp]
  );

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
      const digits = pastedData.slice(0, OTP_LENGTH).split("");

      setOtp((prev) => {
        const newOtp = [...prev];
        digits.forEach((digit, i) => {
          if (i < OTP_LENGTH) newOtp[i] = digit;
        });
        return newOtp;
      });

      const nextIndex = Math.min(OTP_LENGTH - 1, digits.length - 1);
      otpInputRefs.current[nextIndex]?.focus();
    },
    []
  );

  const handleVerifyOTP = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      const otpString = otp.join("");
      if (otpString.length !== OTP_LENGTH) {
        setError(`Please enter the complete ${OTP_LENGTH}-digit OTP`);
        return;
      }

      setIsLoading(true);

      try {
        // Simulate OTP verification
        await new Promise((resolve) => setTimeout(resolve, OTP_VERIFY_DELAY));

        // Login user with OTP
        const fullMobile = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
        await loginWithOTP(email, fullMobile, name.trim());
        setStep("success");

        // Redirect to assessment page after showing success message
        setTimeout(() => {
          let role: UserRole | undefined;
          const storedUser = localStorage.getItem("chaturvima_user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              role = parsed.role as UserRole;
            } catch {
              role = undefined;
            }
          }
          navigate(getRoleLandingRoute(role));
        }, REDIRECT_DELAY);
      } catch {
        setError("OTP verification failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [otp, email, countryCode, phoneNumber, name, loginWithOTP, navigate]
  );

  // Memoized step titles and descriptions
  const stepConfig = useMemo(
    () => ({
      credentials: {
        title: "Welcome Back",
        description: "Enter your email and mobile to receive OTP",
      },
      otp: {
        title: "Verify OTP",
        description: `OTP sent to ${email} and ${countryCode}${phoneNumber.replace(
          /\s/g,
          ""
        )}`,
      },
      success: {
        title: "Login Successful",
        description: "Redirecting to assessment...",
      },
    }),
    [email, countryCode, phoneNumber]
  );

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-linear-to-br from-blue-200/30 to-purple-200/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-linear-to-tr from-indigo-200/30 to-pink-200/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <img
              src={logoImage}
              alt="ChaturVima Logo"
              className="h-20 w-auto object-contain"
            />
          </motion.div>
        </div>

        {/* Login Card */}
        <Card
          variant="elevated"
          className="backdrop-blur-sm bg-white/95 shadow-2xl"
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold mb-2">
              {stepConfig[step].title}
            </CardTitle>
            {step === "otp" && (
              <div className="space-y-2">
                <CardDescription className="text-sm text-gray-600">
                  Enter the 6-digit code sent to
                </CardDescription>
                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <Mail className="h-3.5 w-3.5 text-brand-teal" />
                    <span className="font-medium text-gray-700">{email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <Phone className="h-3.5 w-3.5 text-brand-teal" />
                    <span className="font-medium text-gray-700">
                      {countryCode}
                      {phoneNumber.replace(/\s/g, "")}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {step === "credentials" && (
              <CardDescription className="text-sm text-gray-600">
                {stepConfig[step].description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-5">
            <AnimatePresence mode="wait">
              {step === "credentials" && (
                <motion.form
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                  autoComplete="off"
                >
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="off"
                        name="name"
                        id="name-input"
                        className="pl-10"
                        disabled={isSendingOTP}
                        minLength={2}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                        name="email"
                        id="email-input"
                        className="pl-10"
                        disabled={isSendingOTP}
                      />
                    </div>
                  </div>

                  {/* Mobile Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <PhoneInput
                      country="in"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      enableSearch
                      searchPlaceholder="Search country"
                      disableCountryGuess={false}
                      inputProps={{
                        name: "phoneNumber",
                        required: true,
                        autoComplete: "off",
                        id: "phoneNumber-input",
                        disabled: isSendingOTP,
                      }}
                      specialLabel=""
                      containerClass="!w-full"
                      inputClass="!w-full !h-11 !pl-12 !pr-4 !text-base !font-medium !text-gray-900 !rounded-lg !border !border-brand-teal/30 focus:!border-brand-teal focus:!shadow-[0_0_0_3px_rgba(16,185,129,0.25)] disabled:!bg-gray-100 disabled:!cursor-not-allowed"
                      buttonClass="!border !border-brand-teal/30 !bg-white !rounded-l-lg hover:!bg-brand-teal/5 focus:!ring-2 focus:!ring-brand-teal/40"
                      dropdownClass="!shadow-lg !border !border-gray-200 !rounded-xl !text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      {countryCode === "+91"
                        ? "Enter 10-digit mobile number"
                        : "Enter phone number (7-15 digits)"}
                    </p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send OTP Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full cursor-pointer bg-linear-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg"
                      size="lg"
                      isLoading={isSendingOTP}
                    >
                      {!isSendingOTP && <ArrowRight className="mr-2 h-5 w-5" />}
                      Send OTP
                    </Button>
                  </motion.div>

                  {/* Security Note - Simplified */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>OTP sent to email & mobile</span>
                  </div>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-5"
                  autoComplete="off"
                >
                  {/* OTP Input - Professional Design */}
                  <div className="space-y-5">
                    <div className="flex justify-center gap-2.5">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="h-14 w-14 text-center text-2xl font-semibold rounded-xl border-2 bg-white border-gray-300 text-gray-900 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:shadow-md transition-all shadow-sm hover:border-gray-400 hover:shadow-md"
                          disabled={isLoading}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP Section - Professional Timer */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {otpTimer > 0 ? (
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-linear-to-r from-gray-50 to-gray-100/50 border border-gray-200">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Didn't receive code?
                            </span>
                          </div>
                          <div className="h-6 w-px bg-gray-300" />
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-brand-teal/10">
                              <span className="text-lg font-bold text-brand-teal">
                                {otpTimer}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              seconds
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isSendingOTP}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/30 text-brand-teal font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              isSendingOTP ? "animate-spin" : ""
                            }`}
                          />
                          {isSendingOTP ? "Sending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Verify OTP Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full cursor-pointer bg-linear-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg"
                      size="lg"
                      isLoading={isLoading}
                    >
                      {!isLoading && <ArrowRight className="mr-2 h-5 w-5" />}
                      Verify OTP
                    </Button>
                  </motion.div>
                </motion.form>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-green-200"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                  <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                    Login Successful!
                  </h3>
                  <p className="text-base text-gray-600">
                    Redirecting to assessment...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
