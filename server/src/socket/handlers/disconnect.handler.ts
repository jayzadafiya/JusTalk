import { Socket } from "socket.io";
import Room from "@room/room.model";
import {
  removeParticipant,
  deleteRoom,
  isRoomEmpty,
  getRoomState,
  getParticipantBySocketId,
} from "@socket/roomState";

export const handleDisconnect = async (
  socket: Socket,
  roomCode: string,
  io: any
) => {
  if (!getRoomState(roomCode)) {
    return;
  }

  const participant = getParticipantBySocketId(roomCode, socket.id);
  const userId = participant?.userId;

  removeParticipant(roomCode, socket.id);

  if (userId) {
    await Room.findOneAndUpdate(
      { code: roomCode },
      { $pull: { connectedUsers: userId } }
    );
    console.log(`Removed user ${userId} from room ${roomCode} connectedUsers`);
  }

  socket.to(roomCode).emit("peer-disconnect", {
    socketId: socket.id,
  });

  const updatedRoom = await Room.findOne({ code: roomCode })
    .populate("createdBy", "username firstName lastName avatar")
    .populate("participants", "username firstName lastName avatar")
    .populate("connectedUsers", "username firstName lastName avatar");

  if (updatedRoom) {
    io.emit("room-updated", {
      room: updatedRoom,
    });
    console.log(
      `Emitted room-updated for ${roomCode} - connectedUsers: ${updatedRoom.connectedUsers.length}`
    );
  }

  if (isRoomEmpty(roomCode)) {
    deleteRoom(roomCode);

    socket.to(roomCode).emit("room-ended");

    await Room.findOneAndUpdate({ code: roomCode }, { isActive: false });
    console.log(`Room ${roomCode} marked as inactive`);

    const endedRoom = await Room.findOne({ code: roomCode })
      .populate("createdBy", "username firstName lastName avatar")
      .populate("participants", "username firstName lastName avatar")
      .populate("connectedUsers", "username firstName lastName avatar");

    if (endedRoom) {
      io.emit("room-updated", {
        room: endedRoom,
      });
      console.log(
        `Emitted room-updated for ended room ${roomCode} - isActive: ${endedRoom.isActive}`
      );
    }
  }

  socket.leave(roomCode);
};
