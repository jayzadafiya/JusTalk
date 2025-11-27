import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setUser } from "@store/slices/authSlice";
import { updateProfile } from "@/services/user.service";

export const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthdate: user?.birthdate
      ? new Date(user.birthdate).toISOString().split("T")[0]
      : "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await updateProfile({
        firstName: formData.firstName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        birthdate: formData.birthdate || undefined,
      });

      if (response.success && response.data) {
        dispatch(setUser(response.data));
        setIsEditing(false);
      } else if (response.errors) {
        setError(response.errors[0]?.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      birthdate: user?.birthdate
        ? new Date(user.birthdate).toISOString().split("T")[0]
        : "",
    });
    setError(null);
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Profile Settings
            </h1>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="primary"
                leftIcon={<Edit2 size={18} />}
                className="gap-2 w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex flex-row gap-2">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  leftIcon={<X size={18} />}
                  className="gap-2 text-slate-400 hover:text-white flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  leftIcon={<Save size={18} />}
                  className="gap-2 flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl border-4 border-white shadow-lg">
                {user?.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">
                  {user?.firstName}
                </h2>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">
                  @{user?.username}
                </p>
                <p className="text-sm text-blue-200 mt-2">
                  Member since {formatDate(user?.createdAt.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400">
                  <User size={18} />
                  <span>@{user?.username}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    Cannot be changed
                  </span>
                </div>
              </div>

              <div>
                {isEditing ? (
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="bg-slate-900"
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white capitalize">
                      <User size={18} className="text-slate-400" />
                      <span>{user?.firstName}</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                {isEditing ? (
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    helperText="Optional - Used for account recovery"
                    className="bg-slate-900"
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                      <Mail size={18} className="text-slate-400" />
                      <span>{user?.email || "Not provided"}</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                {isEditing ? (
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    helperText="Optional - Include country code"
                    className="bg-slate-900"
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                      <Phone size={18} className="text-slate-400" />
                      <span>{user?.phone || "Not provided"}</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                {isEditing ? (
                  <Input
                    label="Date of Birth"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    className="bg-slate-900"
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                      <Calendar size={18} className="text-slate-400" />
                      <span>{formatDate(user?.birthdate)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Account Status
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-slate-300 text-sm sm:text-base">
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {user?.lastLogin && (
              <p className="text-sm text-slate-400">
                Last login: {formatDate(user.lastLogin.toString())}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
