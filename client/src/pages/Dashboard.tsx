import { useState, useEffect } from "react";
import { Video, MessageSquare, Users, Plus, Hash } from "lucide-react";
import CreateRoom from "@components/forms/CreateRoom";
import JoinRoom from "@components/forms/JoinRoom";
import { Button } from "@components/ui/Button";
import { getUserRooms } from "@services/room.service";
import type { Room, User } from "@types";
import { useNavigate } from "react-router-dom";
import { socketService } from "@services/socket.service";

interface DashboardProps {
  activeTab: "video" | "chat";
}

export const Dashboard = ({ activeTab }: DashboardProps) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "video" && !showCreateRoom && !showJoinRoom) {
      loadActiveRooms();
    }
  }, [activeTab, showCreateRoom, showJoinRoom]);

  useEffect(() => {
    const socket = socketService.connect();

    const handleRoomUpdated = ({ room }: { room: Room }) => {
      setRooms((prevRooms) => {
        const existingRoomIndex = prevRooms.findIndex(
          (r) => r._id === room._id
        );
        if (existingRoomIndex !== -1) {
          const updatedRooms = [...prevRooms];
          updatedRooms[existingRoomIndex] = room;
          return updatedRooms;
        } else {
          const currentUserId = localStorage.getItem("user");
          if (currentUserId) {
            const user = JSON.parse(currentUserId);
            const isParticipant =
              Array.isArray(room.participants) &&
              room.participants.some((p) => {
                if (typeof p === "string") return p === user._id;
                return p._id === user._id;
              });
            if (isParticipant) {
              return [room, ...prevRooms];
            }
          }
          return prevRooms;
        }
      });
    };

    socket.on("room-updated", handleRoomUpdated);

    return () => {
      socket.off("room-updated", handleRoomUpdated);
    };
  }, []);

  const loadActiveRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await getUserRooms();
      if (response.success && response.data) {
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          {activeTab === "video" ? (
            <div className="h-full">
              {showCreateRoom ? (
                <div className="h-full flex items-center justify-center">
                  <CreateRoom />
                </div>
              ) : showJoinRoom ? (
                <div className="h-full flex items-center justify-center">
                  <JoinRoom />
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        My Rooms
                      </h2>

                      {rooms.length > 0 && (
                        <p className="text-slate-400 text-sm">
                          {rooms.length} room
                          {rooms.length !== 1 ? "s" : ""} total
                        </p>
                      )}
                    </div>
                    {rooms.length > 0 && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowCreateRoom(true)}
                          size="md"
                          leftIcon={<Plus size={16} />}
                        >
                          Create Room
                        </Button>
                        <Button
                          onClick={() => setShowJoinRoom(true)}
                          variant="secondary"
                          size="md"
                          leftIcon={<Hash size={16} />}
                        >
                          Join with Code
                        </Button>
                      </div>
                    )}
                  </div>

                  {loadingRooms ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms.map((room) => {
                        const allParticipants = Array.isArray(room.participants)
                          ? (room.participants.filter(
                              (p) => typeof p === "object"
                            ) as User[])
                          : [];
                        const connectedUsers = Array.isArray(
                          room.connectedUsers
                        )
                          ? (room.connectedUsers.filter(
                              (p) => typeof p === "object"
                            ) as User[])
                          : [];
                        const connectedUserIds = connectedUsers.map(
                          (p) => p._id
                        );
                        const createdBy =
                          typeof room.createdBy === "object"
                            ? (room.createdBy as any)
                            : null;

                        return (
                          <div
                            key={room._id}
                            className={`bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border transition-all cursor-pointer group ${
                              room.isActive
                                ? "border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                                : "border-slate-700/50 opacity-75 hover:border-slate-600"
                            }`}
                            onClick={() =>
                              room.isActive && navigate(`/room/${room.code}`)
                            }
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg mb-1 truncate group-hover:text-blue-400 transition-colors">
                                  {room.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-slate-400 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700/50">
                                    {room.code}
                                  </p>
                                  {room.hasPassword && (
                                    <div className="bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded text-xs font-medium border border-yellow-600/30">
                                      🔒
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {createdBy && (
                              <div className="mb-3 pb-3 border-b border-slate-700/50">
                                <p className="text-xs text-slate-500 mb-1.5 font-medium">
                                  Host
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                                    {(
                                      createdBy.firstName?.[0] ||
                                      createdBy.username?.[0] ||
                                      "?"
                                    ).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-sm text-slate-200 font-medium">
                                      {createdBy.firstName ||
                                        createdBy.username}
                                    </span>
                                    {createdBy.username &&
                                      createdBy.firstName && (
                                        <span className="text-xs text-slate-500 ml-1">
                                          @{createdBy.username}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-slate-500 font-medium">
                                  {room.isActive ? "In Call" : "Participants"}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Users size={13} className="text-slate-400" />
                                  <span
                                    className={`font-semibold ${
                                      connectedUsers.length >=
                                      room.maxParticipants
                                        ? "text-red-400"
                                        : connectedUsers.length >
                                          room.maxParticipants * 0.7
                                        ? "text-yellow-400"
                                        : room.isActive
                                        ? "text-green-400"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {room.isActive
                                      ? connectedUsers.length
                                      : allParticipants.length}
                                    /{room.maxParticipants}
                                  </span>
                                </div>
                              </div>

                              {allParticipants.length > 0 ? (
                                <div className="space-y-1.5">
                                  {allParticipants
                                    .slice(0, 5)
                                    .map((participant, idx) => {
                                      const isInCall =
                                        connectedUserIds.includes(
                                          participant._id
                                        );
                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-2 bg-slate-900/50 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                                          title={`${
                                            participant.firstName ||
                                            participant.username
                                          } (@${participant.username}) - ${
                                            isInCall ? "In call" : "Left"
                                          }`}
                                        >
                                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shadow-md">
                                            {(
                                              participant.firstName?.[0] ||
                                              participant.username?.[0] ||
                                              "?"
                                            ).toUpperCase()}
                                          </div>
                                          <span className="text-xs text-slate-300 truncate flex-1">
                                            {participant.firstName ||
                                              participant.username}
                                          </span>
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              isInCall
                                                ? "bg-green-400"
                                                : "bg-red-400"
                                            }`}
                                          ></div>
                                        </div>
                                      );
                                    })}
                                  {allParticipants.length > 5 && (
                                    <div className="flex items-center justify-center bg-slate-900/30 px-2.5 py-1.5 rounded-lg">
                                      <span className="text-xs text-slate-400 font-medium">
                                        +{allParticipants.length - 5} more
                                        participant
                                        {allParticipants.length - 5 !== 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic py-2 text-center">
                                  No participants yet
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                              <div className="flex items-center gap-1.5">
                                {room.isActive ? (
                                  <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-500 font-semibold">
                                      Live
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                    <span className="text-xs text-slate-500 font-semibold">
                                      Ended
                                    </span>
                                  </>
                                )}
                              </div>
                              {room.isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/room/${room.code}`);
                                  }}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/30"
                                >
                                  Join Call →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-5">
                        <Video size={32} className="text-slate-600" />
                      </div>
                      <h3 className="text-lg text-white font-medium mb-1">
                        No active rooms
                      </h3>
                      <p className="text-slate-500 text-sm mb-5">
                        Create a new room or join with a code
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowCreateRoom(true)}
                          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Create Room
                        </button>
                        <button
                          onClick={() => setShowJoinRoom(true)}
                          className="px-5 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600"
                        >
                          Join Room
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-5">
                  <MessageSquare size={32} className="text-slate-600" />
                </div>
                <h3 className="text-lg text-white font-medium mb-1">
                  No messages
                </h3>
                <p className="text-slate-500 text-sm mb-5">
                  Start chatting with your contacts
                </p>
                <button className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  New Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
