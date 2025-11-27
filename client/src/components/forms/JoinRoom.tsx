import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom as joinRoomApi } from "@services/room.service";
import type { JoinRoomData } from "@types";
import { Lock } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";

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
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <p className="text-slate-400">Enter room code to join a call</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Room Code"
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          maxLength={8}
          placeholder="XXXXXX"
          className="text-center text-2xl font-mono tracking-wider"
        />

        {requiresPassword && (
          <Input
            label={
              <span className="flex items-center gap-2">
                <Lock size={16} />
                Password
              </span>
            }
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter room password"
          />
        )}

        <Button type="submit" loading={loading} fullWidth size="md">
          {loading ? "Joining..." : "Join Room"}
        </Button>
      </form>
    </div>
  );
};

export default JoinRoom;
