import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@store/hooks";
import { login as loginAction } from "@store/slices/authSlice";
import { login as loginApi } from "../services/auth.service";
import { FormValidator } from "@lib/validation";
import type { LoginData } from "@types";
import { Eye, EyeOff, Loader2, XCircle, AlertCircle } from "lucide-react";

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
  const [rememberMe, setRememberMe] = useState(false);
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

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("savedUsername", formData.username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("savedUsername");
        }

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
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-slate-400">Sign in to your account</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-800 border ${
                  errors.username ? "border-red-500" : "border-slate-700"
                } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600`}
                placeholder="Enter username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800 border ${
                    errors.password ? "border-red-500" : "border-slate-700"
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600`}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-slate-800 border-slate-700 rounded"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-400">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-blue-500 hover:text-blue-400 text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
