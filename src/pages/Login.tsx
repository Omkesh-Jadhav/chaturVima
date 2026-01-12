/**
 * Login Page
 * Email and password authentication page
 */
import { useState, useCallback } from "react";
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
  ArrowRight,
  CheckCircle2,
  Shield,
  Lock,
} from "lucide-react";
import logoImage from "../assets/chaturvima-logo.png";
import { getRoleLandingRoute } from "../utils/roleRoutes";

type LoginStep = "credentials" | "success";

const LOGIN_DELAY = 1500;
const REDIRECT_DELAY = 1500;

// Dummy credentials for validation - Multiple test users supported
const VALID_CREDENTIALS = [
  { email: "user@example.com", password: "password123", name: "Test User" },
  { email: "admin@example.com", password: "admin123", name: "Admin User" },
  { email: "hr@example.com", password: "hr123", name: "HR User" },
  { email: "manager@example.com", password: "manager123", name: "Manager User" },
  { email: "super-admin@example.com", password: "superadmin123", name: "Super Admin" },
];

const Login = () => {
  const navigate = useNavigate();
  const { loginWithOTP } = useUser();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("hr@example.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation helpers
  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return password.length >= 6;
  }, []);

  // Email/password login handler
  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!validatePassword(password)) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // Validate credentials against hardcoded values
      const normalizedEmail = email.toLowerCase().trim();
      const user = VALID_CREDENTIALS.find(
        (cred) => cred.email.toLowerCase() === normalizedEmail && cred.password === password
      );

      if (!user) {
        setError("Invalid email or password. Please check your credentials.");
        return;
      }

      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY));

        // Login user with email/password
        await loginWithOTP(email, "", user.name);
        setStep("success");

        // Redirect to appropriate page after showing success message
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
        setError("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, validateEmail, validatePassword, loginWithOTP, navigate]
  );

  // Step titles and descriptions for email/password login
  const stepConfig = {
    credentials: {
      title: "Welcome Back",
      description: "Enter your email and password to login",
    },
    success: {
      title: "Login Successful",
      description: "Redirecting to assessment...",
    },
  };

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
              {step === "success" ? stepConfig.success.title : stepConfig.credentials.title}
            </CardTitle>
            {step === "credentials" && (
              <CardDescription className="text-sm text-gray-600">
                {stepConfig.credentials.description}
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
                  onSubmit={handleLogin}
                  className="space-y-4"
                  autoComplete="off"
                >
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="off"
                        name="password"
                        id="password-input"
                        className="pl-10"
                        disabled={isLoading}
                        minLength={6}
                      />
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

                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      {!isLoading && <ArrowRight className="mr-2 h-5 w-5" />}
                      Login
                    </Button>
                  </motion.div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>Secure email & password authentication</span>
                  </div>
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