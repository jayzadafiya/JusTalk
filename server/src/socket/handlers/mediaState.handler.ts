import { Socket } from "socket.io";
import { MediaStateData } from "@socket/types";

export const handleMediaState = (socket: Socket, data: MediaStateData) => {
  const { roomCode, audioEnabled, videoEnabled } = data;

  socket.to(roomCode).emit("peer-media-state", {
    socketId: socket.id,
    audioEnabled,
    videoEnabled,
  });

  console.log(
    `User ${socket.id} media state - Audio: ${audioEnabled}, Video: ${videoEnabled}`
  );
};
