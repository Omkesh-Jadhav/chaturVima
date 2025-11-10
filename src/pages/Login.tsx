/**
 * Login Page
 * OTP-based authentication page with email and mobile verification
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
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
  TrendingUp,
  CheckCircle2,
  Shield,
  RefreshCw,
  User,
  ChevronDown,
} from "lucide-react";
import { getDefaultRouteForRole } from "../config/roleRoutes";

type LoginStep = "credentials" | "otp" | "success";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 60;
const OTP_SEND_DELAY = 1500;
const OTP_VERIFY_DELAY = 1500;
const REDIRECT_DELAY = 1500;

const VALID_EMAILS = ["employee@demo.com", "superadmin@demo.com"];
const VALID_COUNTRY_CODE = "+91";
const VALID_PHONE_NUMBER = "9876543210"; // Format: [country code][phone number] - Must start with 6, 7, 8, or 9

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

const Login = () => {
  const navigate = useNavigate();
  const { loginWithOTP } = useUser();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
  const countryCodeDropdownRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    if (phoneNumber) {
      const formatted = formatPhoneNumber(phoneNumber, countryCode);
      if (formatted !== phoneNumber) {
        setPhoneNumber(formatted);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && step === "otp") {
      setCanResendOTP(true);
    }
  }, [otpTimer, step]);

  const validateName = useCallback((value: string) => {
    return value.trim().length >= 2 && value.trim().length <= 50;
  }, []);

  const validateEmail = useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  const validatePhoneNumber = useCallback(
    (phone: string, selectedCountryCode: string) => {
      const digitsOnly = phone.replace(/\D/g, "");

      if (selectedCountryCode === "+91") {
        if (digitsOnly.length !== 10) {
          return false;
        }
        return /^[6-9]\d{9}$/.test(digitsOnly);
      }

      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    },
    []
  );

  const formatPhoneNumber = useCallback(
    (value: string, selectedCountryCode: string) => {
      const digitsOnly = value.replace(/\D/g, "");

      if (selectedCountryCode === "+91") {
        const limitedDigits = digitsOnly.slice(0, 10);
        return limitedDigits.length > 5
          ? `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`
          : limitedDigits;
      }

      return digitsOnly.slice(0, 15);
    },
    []
  );

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

      const normalizedEmail = email.toLowerCase().trim();
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

      const isValidEmail = VALID_EMAILS.some(
        (validEmail) => validEmail.toLowerCase() === normalizedEmail
      );

      if (!isValidEmail) {
        setError("Invalid email address. Please check your credentials.");
        return;
      }

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

    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (otp[index] && index > 0) {
          e.preventDefault();
          setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index] = "";
            return newOtp;
          });
          setTimeout(() => {
            otpInputRefs.current[index - 1]?.focus();
          }, 0);
        } else if (!otp[index] && index > 0) {
          e.preventDefault();
          setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index - 1] = "";
            return newOtp;
          });
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
        await new Promise((resolve) => setTimeout(resolve, OTP_VERIFY_DELAY));

        const fullMobile = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
        const authenticatedUser = await loginWithOTP(
          email,
          fullMobile,
          name.trim()
        );
        setStep("success");

        setTimeout(() => {
          navigate(getDefaultRouteForRole(authenticatedUser.role));
        }, REDIRECT_DELAY);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "OTP verification failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [otp, email, countryCode, phoneNumber, name, loginWithOTP, navigate]
  );

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
        description: "Redirecting to your dashboard...",
      },
    }),
    [email, countryCode, phoneNumber]
  );

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl"
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
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 blur-3xl"
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
        <div className="mb-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-navy shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-1 bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-3xl font-bold text-transparent">
              ChaturVima
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Organizational Health Diagnostics
            </p>
          </motion.div>
        </div>

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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative" ref={countryCodeDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setCountryCodeDropdownOpen(!countryCodeDropdownOpen)
                          }
                          disabled={isSendingOTP}
                          className="inline-flex h-11 min-w-[80px] items-center justify-between rounded-lg border border-brand-teal/30 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">
                              {
                                countryCodes.find(
                                  (cc) => cc.code === countryCode
                                )?.flag
                              }
                            </span>
                            <span className="font-medium">{countryCode}</span>
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
                                    setCountryCode(item.code);
                                    setCountryCodeDropdownOpen(false);
                                  }}
                                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                    countryCode === item.code
                                      ? "bg-gradient-to-r from-brand-teal/15 to-brand-navy/15 text-brand-navy font-medium"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-teal/5 hover:to-brand-navy/5"
                                  }`}
                                >
                                  <span className="text-base">{item.flag}</span>
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
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                          type="tel"
                          placeholder={
                            countryCode === "+91"
                              ? "98765 43210"
                              : "Enter phone number"
                          }
                          value={phoneNumber}
                          onChange={(e) =>
                            setPhoneNumber(
                              formatPhoneNumber(e.target.value, countryCode)
                            )
                          }
                          onKeyDown={(e) => {
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
                              !(e.ctrlKey || e.metaKey)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          required
                          autoComplete="off"
                          name="phoneNumber"
                          id="phoneNumber-input"
                          className="pl-10 h-11"
                          maxLength={countryCode === "+91" ? 11 : 15}
                          disabled={isSendingOTP}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {countryCode === "+91"
                        ? "Enter 10-digit mobile number"
                        : "Enter phone number (7-15 digits)"}
                    </p>
                  </div>

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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg"
                      size="lg"
                      isLoading={isSendingOTP}
                    >
                      {!isSendingOTP && <ArrowRight className="mr-2 h-5 w-5" />}
                      Send OTP
                    </Button>
                  </motion.div>

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

                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {otpTimer > 0 ? (
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200">
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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full cursor-pointer bg-gradient-to-r from-brand-teal to-brand-navy hover:from-brand-teal/90 hover:to-brand-navy/90 shadow-lg"
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
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
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
                    Redirecting to your dashboard...
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
