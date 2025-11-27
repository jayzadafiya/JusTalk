import { Server as SocketIOServer, Socket } from "socket.io";
import {
  handleJoinRoom,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  handleMediaState,
  handleDisconnect,
  registerDoodleHandlers,
  handleDoodleDisconnect,
} from "@socket/handlers";
import { bindAndWrap } from "@utils/wrapSocketHandler";
import { getRoomBySocketId } from "@socket/roomState";

export const initializeSocketServer = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on(
      "join-room",
      bindAndWrap(socket, handleJoinRoom, { errorEvent: "server:error" })
    );

    socket.on("offer", bindAndWrap(socket, handleOffer));

    socket.on("answer", bindAndWrap(socket, handleAnswer));

    socket.on("ice-candidate", bindAndWrap(socket, handleIceCandidate));

    socket.on("media-state", bindAndWrap(socket, handleMediaState));

    socket.on("leave-room", bindAndWrap(socket, handleDisconnect));

    registerDoodleHandlers(socket, io);

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const roomCode = getRoomBySocketId(socket.id);
      if (roomCode) {
        try {
          await handleDisconnect(socket, roomCode);
        } catch (err) {
          console.error("Error during disconnect handler:", err);
        }
        try {
          handleDoodleDisconnect(socket.id);
        } catch (err) {
          console.error("Error during doodle disconnect cleanup:", err);
        }
      }
    });
  });
};
