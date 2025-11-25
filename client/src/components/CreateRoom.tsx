import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/room.service";
import type { CreateRoomData } from "@types";
import { Loader2, Copy, Check } from "lucide-react";

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
              <input
                type="text"
                value={roomCode}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-2xl font-mono tracking-wider"
              />
              <button
                onClick={copyCode}
                className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} className="text-slate-300" />
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Share this code with others to invite them to your room
          </p>

          <button
            onClick={joinRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Join Room
          </button>
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
        <div>
          <label className="block text-sm text-slate-300 mb-2">Room Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-900 border ${
              errors.name ? "border-red-500" : "border-slate-700"
            } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600`}
            placeholder="Enter room name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Password <span className="text-slate-500 text-xs">(optional)</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600"
            placeholder="Leave empty for no password"
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
