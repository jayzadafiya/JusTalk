import Room from "@room/room.model";
import bcrypt from "bcryptjs";
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";

export class RoomService {
  private generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createRoom(roomData: {
    name: string;
    password?: string;
    createdBy: string;
    maxParticipants?: number;
  }) {
    let code = this.generateRoomCode();
    let attempts = 0;

    while (await Room.isCodeTaken(code)) {
      if (attempts++ > 10) {
        throw new Error("Unable to generate unique room code");
      }
      code = this.generateRoomCode();
    }

    const roomPayload: any = {
      code,
      name: roomData.name,
      createdBy: roomData.createdBy,
      participants: [roomData.createdBy],
      maxParticipants: roomData.maxParticipants || 8,
    };

    if (roomData.password) {
      const hashedPassword = await bcrypt.hash(roomData.password, 10);
      roomPayload.password = hashedPassword;
    }

    const room = await Room.create(roomPayload);
    return room;
  }

  async joinRoom(roomCode: string, userId: string, password?: string) {
    const room = await Room.findOne({ code: roomCode.toUpperCase() }).select(
      "+password"
    );

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    if (!room.isActive) {
      throw new ValidationError("Room is no longer active");
    }

    if (room.participants.length >= room.maxParticipants) {
      throw new ValidationError("Room is full");
    }

    if (room.participants.includes(userId as any)) {
      return room;
    }

    if (room.password) {
      if (!password) {
        throw new UnauthorizedError("Password required");
      }
      const isPasswordValid = await bcrypt.compare(password, room.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid password");
      }
    }

    room.participants.push(userId as any);
    await room.save();

    const roomData = await Room.findById(room._id)
      .populate("participants", "username firstName avatar")
      .populate("connectedUsers", "username firstName avatar");
    return roomData;
  }

  async leaveRoom(roomCode: string, userId: string) {
    const room = await Room.findOne({ code: roomCode.toUpperCase() });

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    room.connectedUsers = room.connectedUsers.filter(
      (p) => p.toString() !== userId
    );

    if (room.connectedUsers.length === 0) {
      room.isActive = false;
    }

    await room.save();
    return room;
  }

  async getRoomByCode(code: string) {
    const room = await Room.findOne({ code: code.toUpperCase() })
      .populate("createdBy", "username firstName avatar")
      .populate("participants", "username firstName avatar")
      .populate("connectedUsers", "username firstName avatar");

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    return room;
  }

  async getUserRooms(userId: string) {
    console.log("getUserRooms - userId:", userId);

    const rooms = await Room.find({
      participants: userId,
    })
      .populate("createdBy", "username firstName lastName avatar")
      .populate("participants", "username firstName lastName avatar")
      .populate("connectedUsers", "username firstName lastName avatar")
      .sort({ updatedAt: -1 })
      .limit(50);

    console.log("getUserRooms - found rooms:", rooms.length);
    return rooms;
  }
}

export default new RoomService();
