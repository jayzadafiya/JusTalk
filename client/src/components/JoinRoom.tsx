import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom as joinRoomApi } from "../services/room.service";
import type { JoinRoomData } from "@types";
import { Loader2, Lock } from "lucide-react";

export const JoinRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JoinRoomData>({
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requiresPassword, setRequiresPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      setErrors({ code: "Room code is required" });
      return;
    }

    setLoading(true);
    try {
      const result = await joinRoomApi(formData);

      if (result.success && result.data) {
        navigate(`/room/${formData.code}`);
      } else {
        if (result.message === "Password required") {
          setRequiresPassword(true);
          setErrors({ password: "This room requires a password" });
        } else if (result.errors) {
          const errorMap: Record<string, string> = {};
          result.errors.forEach((err) => {
            if (err.field) {
              errorMap[err.field] = err.message;
            }
          });
          setErrors(errorMap);
        } else {
          setErrors({ general: result.message || "Failed to join room" });
        }
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Join Room</h2>
        <p className="text-slate-400">Enter room code to join a call</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Room Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            maxLength={8}
            className={`w-full px-4 py-3 bg-slate-900 border ${
              errors.code ? "border-red-500" : "border-slate-700"
            } rounded-lg text-white text-center text-2xl font-mono tracking-wider placeholder-slate-500 focus:outline-none focus:border-blue-600`}
            placeholder="XXXXXX"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code}</p>
          )}
        </div>

        {requiresPassword && (
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-slate-900 border ${
                errors.password ? "border-red-500" : "border-slate-700"
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600`}
              placeholder="Enter room password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;
