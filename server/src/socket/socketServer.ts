import { Server as SocketIOServer, Socket } from "socket.io";
import {
  handleJoinRoom,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  handleMediaState,
  handleDisconnect,
} from "@socket/handlers";
import { getRoomBySocketId } from "@socket/roomState";
import type {
  JoinRoomData,
  OfferData,
  AnswerData,
  IceCandidateData,
  MediaStateData,
  LeaveRoomData,
} from "@socket/types";

export const initializeSocketServer = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (data: JoinRoomData) => {
      handleJoinRoom(socket, data);
    });

    socket.on("offer", (data: OfferData) => {
      handleOffer(socket, data);
    });

    socket.on("answer", (data: AnswerData) => {
      handleAnswer(socket, data);
    });

    socket.on("ice-candidate", (data: IceCandidateData) => {
      handleIceCandidate(socket, data);
    });

    socket.on("media-state", (data: MediaStateData) => {
      handleMediaState(socket, data);
    });

    socket.on("leave-room", (data: LeaveRoomData) => {
      handleDisconnect(socket, data.roomCode);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const roomCode = getRoomBySocketId(socket.id);
      if (roomCode) {
        handleDisconnect(socket, roomCode);
      }
    });
  });
};
