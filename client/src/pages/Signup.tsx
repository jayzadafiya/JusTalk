import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "@store/hooks";
import { login as loginAction } from "@store/slices/authSlice";
import { signup, checkUsername } from "@services/auth.service";
import { FormValidator } from "@lib/validation";
import type { SignupData } from "@types";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

export const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<SignupData>({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    birthdate: "",
    email: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username.length >= 3) {
        checkUsernameAvailability();
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const checkUsernameAvailability = async () => {
    setUsernameChecking(true);
    try {
      const result = await checkUsername(formData.username);
      setUsernameAvailable(result.available);
      if (!result.available) {
        setErrors((prev) => ({ ...prev, username: result.message }));
      } else {
        setErrors((prev) => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error("Username check failed:", error);
    } finally {
      setUsernameChecking(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameValidation = FormValidator.validateUsername(
      formData.username
    );
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.error!;
    } else if (usernameAvailable === false) {
      newErrors.username = "Username is already taken";
    }

    const passwordValidation = FormValidator.validatePassword(
      formData.password
    );
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }

    const confirmPasswordValidation = FormValidator.validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.error!;
    }

    const firstNameValidation = FormValidator.validateFirstName(
      formData.firstName
    );
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error!;
    }

    const birthdateValidation = FormValidator.validateBirthdate(
      formData.birthdate
    );
    if (!birthdateValidation.isValid) {
      newErrors.birthdate = birthdateValidation.error!;
    }

    const emailValidation = FormValidator.validateEmail(formData.email);
    if (!emailValidation.isValid && formData?.email?.trim() !== "") {
      newErrors.email = emailValidation.error!;
    }

    const phoneValidation = FormValidator.validatePhone(formData.phone);
    if (!phoneValidation.isValid && formData?.phone?.trim() !== "") {
      newErrors.phone = phoneValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const result = await signup(formData);

      if (result.success && result.data) {
        setSuccessMessage("Account created successfully! Redirecting...");
        dispatch(
          loginAction({
            user: result.data.user,
            token: result.data.token,
          })
        );

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        if (result.errors) {
          const errorMap: Record<string, string> = {};
          result.errors.forEach((err) => {
            if (err.field) {
              errorMap[err.field] = err.message;
            }
          });
          setErrors(errorMap);
        } else if (result.field && result.message) {
          setErrors({ [result.field]: result.message });
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-white font-bold text-lg sm:text-xl">J</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
              Create account
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Get started with JusTalk
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm text-green-500">{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              <span className="text-sm text-red-500">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choose username"
              className={
                usernameAvailable === true
                  ? "border-green-500"
                  : usernameAvailable === false
                  ? "border-red-500"
                  : ""
              }
              iconButton={
                usernameChecking ? (
                  <Loader2 size={18} className="text-slate-400 animate-spin" />
                ) : usernameAvailable === true ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : usernameAvailable === false ? (
                  <XCircle size={18} className="text-red-500" />
                ) : null
              }
            />

            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Enter first name"
            />

            <Input
              label="Birthdate"
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              error={errors.birthdate}
              max={FormValidator.getMaxBirthdate(13)}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              iconButton={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-300 py-3.5"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-enter password"
              iconButton={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-300 py-3.5"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            <Input
              label={
                <>
                  Email <span className="text-xs">(optional)</span>
                </>
              }
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              containerClassName="text-slate-400"
            />

            <Input
              label={
                <>
                  Phone <span className="text-xs">(optional)</span>
                </>
              }
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+1234567890"
              containerClassName="text-slate-400"
            />

            <Button
              type="submit"
              loading={loading}
              disabled={usernameChecking || usernameAvailable === false}
              fullWidth
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-400 text-xs sm:text-sm">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
