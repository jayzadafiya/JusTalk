import { Socket } from "socket.io";
import { OfferData, AnswerData, IceCandidateData } from "@socket/types";

export const handleOffer = (socket: Socket, data: OfferData) => {
  const { offer, targetSocketId } = data;

  socket.to(targetSocketId).emit("offer", {
    offer,
    senderSocketId: socket.id,
  });
};

export const handleAnswer = (socket: Socket, data: AnswerData) => {
  const { answer, targetSocketId } = data;

  socket.to(targetSocketId).emit("answer", {
    answer,
    senderSocketId: socket.id,
  });
};

export const handleIceCandidate = (socket: Socket, data: IceCandidateData) => {
  const { candidate, targetSocketId } = data;

  socket.to(targetSocketId).emit("ice-candidate", {
    candidate,
    senderSocketId: socket.id,
  });
};
