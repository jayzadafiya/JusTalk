import { useState, useEffect } from "react";
import { MessageSquare, Users, Clock } from "lucide-react";
import type { Call } from "@/types";

export const CallList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setLoadingCalls(true);
      const mockCalls: Call[] = [
        {
          _id: "1",
          participants: ["John Doe", "Jane Smith"],
          type: "outgoing",
          duration: 1245,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          roomName: "Project Meeting",
        },
        {
          _id: "2",
          participants: ["Alice Johnson"],
          type: "incoming",
          duration: 892,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          roomName: "Quick Chat",
        },
        {
          _id: "3",
          participants: ["Bob Wilson", "Carol Davis"],
          type: "missed",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          roomName: "Team Standup",
        },
      ];

      setTimeout(() => {
        setCalls(mockCalls);
        setLoadingCalls(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading call history:", error);
      setLoadingCalls(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
  };

  const getCallIcon = (type: Call["type"]) => {
    switch (type) {
      case "incoming":
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case "outgoing":
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case "missed":
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-800 text-white">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Call History</h3>
        </div>

        {loadingCalls && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-400">Loading call history...</p>
          </div>
        )}

        {!loadingCalls && calls.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No call history</h3>
            <p className="text-slate-400 mb-6">
              Your recent calls will appear here
            </p>
          </div>
        )}

        {!loadingCalls && calls.length > 0 && (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call._id}
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCallIcon(call.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {call.roomName || "Video Call"}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize ${
                            call.type === "incoming"
                              ? "bg-green-600"
                              : call.type === "outgoing"
                              ? "bg-blue-600"
                              : "bg-red-600"
                          }`}
                        >
                          {call.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>
                            {call.participants.length + 1} participants
                          </span>
                        </div>
                        {call.duration && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDuration(call.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      {formatTimestamp(call.timestamp)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {call.participants.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
