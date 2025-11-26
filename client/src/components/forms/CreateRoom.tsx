import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "@services/room.service";
import type { CreateRoomData } from "@types";
import { Copy, Check } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";

export const CreateRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateRoomData>({
    name: "",
    password: "",
    maxParticipants: 8,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (!formData.name.trim()) {
      setErrors({ name: "Room name is required" });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        password: formData.password || undefined,
      };

      const result = await createRoom(submitData);

      if (result.success && result.data) {
        setRoomCode(result.data.room.code);
      } else {
        if (result.errors) {
          const errorMap: Record<string, string> = {};
          result.errors.forEach((err) => {
            if (err.field) {
              errorMap[err.field] = err.message;
            }
          });
          setErrors(errorMap);
        } else {
          setErrors({ general: result.message || "Failed to create room" });
        }
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinRoom = () => {
    navigate(`/room/${roomCode}`);
  };

  if (roomCode) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Room Created!
          </h3>

          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">
              Room Code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={roomCode}
                readOnly
                className="flex-1 text-center text-2xl font-mono tracking-wider bg-slate-900 border-slate-600"
                containerClassName="flex-1"
              />
              <Button
                onClick={copyCode}
                variant="secondary"
                size="md"
                className="px-4"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} className="text-slate-300" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Share this code with others to invite them to your room
          </p>

          <Button onClick={joinRoom} fullWidth size="lg">
            Join Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Create Room</h2>
        <p className="text-slate-400">Start a new video call</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Room Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter room name"
        />

        <Input
          label={
            <>
              Password{" "}
              <span className="text-slate-500 text-xs">(optional)</span>
            </>
          }
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Leave empty for no password"
        />

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Max Participants
          </label>
          <select
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} people
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </form>
    </div>
  );
};

export default CreateRoom;
