import type { RoomState } from "@socket/types";

export const rooms: RoomState = {};

export const getRoomState = (roomCode: string) => {
  return rooms[roomCode];
};

export const createRoom = (roomCode: string) => {
  if (!rooms[roomCode]) {
    rooms[roomCode] = { participants: new Map() };
  }
  return rooms[roomCode];
};

export const addParticipant = (
  roomCode: string,
  socketId: string,
  userId: string,
  username: string
) => {
  if (!rooms[roomCode]) {
    createRoom(roomCode);
  }
  rooms[roomCode].participants.set(socketId, {
    userId,
    username,
    socketId,
  });
};

export const removeParticipant = (roomCode: string, socketId: string) => {
  if (rooms[roomCode]) {
    rooms[roomCode].participants.delete(socketId);
  }
};

export const getOtherParticipants = (roomCode: string, socketId: string) => {
  if (!rooms[roomCode]) {
    return [];
  }
  return Array.from(rooms[roomCode].participants.values()).filter(
    (p) => p.socketId !== socketId
  );
};

export const getRoomBySocketId = (socketId: string): string | null => {
  for (const roomCode in rooms) {
    if (rooms[roomCode].participants.has(socketId)) {
      return roomCode;
    }
  }
  return null;
};

export const deleteRoom = (roomCode: string) => {
  delete rooms[roomCode];
};

export const isRoomEmpty = (roomCode: string): boolean => {
  return rooms[roomCode]?.participants.size === 0;
};

export const getParticipantBySocketId = (
  roomCode: string,
  socketId: string
) => {
  if (!rooms[roomCode]) {
    return null;
  }
  return rooms[roomCode].participants.get(socketId);
};

export const getAllParticipants = (roomCode: string) => {
  if (!rooms[roomCode]) {
    return [];
  }
  return Array.from(rooms[roomCode].participants.values());
};
