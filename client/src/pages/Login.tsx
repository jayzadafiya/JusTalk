import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@store/hooks";
import { login as loginAction } from "@store/slices/authSlice";
import { login as loginApi } from "@services/auth.service";
import { FormValidator } from "@lib/validation";
import type { LoginData } from "@types";
import { Eye, EyeOff, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const sessionExpired = searchParams.get("session") === "expired";

  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameValidation = FormValidator.validateUsername(
      formData.username
    );
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.error!;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    try {
      const result = await loginApi(formData);

      if (result.success && result.data) {
        dispatch(
          loginAction({
            user: result.data.user,
            token: result.data.token,
          })
        );

        navigate("/");
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
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <span className="text-white font-bold text-lg sm:text-xl">J</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Sign in to your account
            </p>
          </div>

          {sessionExpired && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-500" />
              <span className="text-sm text-yellow-500">
                Session expired. Please log in again.
              </span>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              <span className="text-sm text-red-500">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Enter username"
              autoComplete="username"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter password"
              autoComplete="current-password"
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

            <Button type="submit" loading={loading} fullWidth>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-3 text-center">
            <span className="text-slate-400 text-xs sm:text-sm">
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
