import { Socket } from "socket.io";
import { JoinRoomData } from "@socket/types";
import {
  addParticipant,
  createRoom,
  getOtherParticipants,
} from "@socket/roomState";
import Room from "@room/room.model";
import * as doodleService from "@doodle/doodle.service.js";
import { getBufferedStrokes } from "@socket/handlers";

export const handleJoinRoom = async (
  socket: Socket,
  data: JoinRoomData,
  io: any
) => {
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
    { $addToSet: { connectedUsers: userId }, isActive: true }
  );

  const updatedRoom = await Room.findOne({ code: roomCode })
    .populate("createdBy", "username firstName lastName avatar")
    .populate("participants", "username firstName lastName avatar")
    .populate("connectedUsers", "username firstName lastName avatar");

  if (updatedRoom) {
    io.emit("room-updated", {
      room: updatedRoom,
    });
    console.log(
      `Emitted room-updated for ${roomCode} - connectedUsers: ${updatedRoom.connectedUsers.length}, isActive: ${updatedRoom.isActive}`
    );
  }

  try {
    const strokes = await doodleService.getStrokesByRoom(roomCode, 200);
    const buffered = getBufferedStrokes(roomCode) || [];
    const allStrokes = [...strokes, ...buffered].sort(
      (a, b) => (a.startTime || 0) - (b.startTime || 0)
    );

    socket.emit("doodle:sync:response", {
      roomId: roomCode,
      strokes: allStrokes,
    });
    console.log(
      `Sent ${strokes.length} existing strokes to new participant in room ${roomCode}`
    );
  } catch (error) {
    console.error(
      "Failed to send existing doodle strokes to new participant:",
      error
    );
  }
};
