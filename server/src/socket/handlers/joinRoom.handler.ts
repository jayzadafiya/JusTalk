import { Socket } from "socket.io";
import { JoinRoomData } from "@socket/types";
import {
  addParticipant,
  createRoom,
  getOtherParticipants,
} from "@socket/roomState";
import Room from "@room/room.model";

export const handleJoinRoom = async (socket: Socket, data: JoinRoomData) => {
  const { roomCode, userId, username } = data;

  socket.join(roomCode);

  createRoom(roomCode);
  addParticipant(roomCode, socket.id, userId, username);

  const otherParticipants = getOtherParticipants(roomCode, socket.id);

  socket.emit("existing-participants", otherParticipants);

  socket.to(roomCode).emit("new-peer", {
    socketId: socket.id,
    userId,
    username,
  });

  console.log(`User ${username} joined room ${roomCode}`);

  await Room.findOneAndUpdate(
    { code: roomCode },
    { $addToSet: { connectedUsers: userId } }
  );

  const updatedRoom = await Room.findOne({ code: roomCode })
    .populate("createdBy", "username firstName lastName avatar")
    .populate("participants", "username firstName lastName avatar")
    .populate("connectedUsers", "username firstName lastName avatar");

  if (updatedRoom) {
    socket.server.emit("room-updated", {
      room: updatedRoom,
    });
  }
};
