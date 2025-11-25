export interface RoomState {
  [roomCode: string]: {
    participants: Map<
      string,
      { userId: string; username: string; socketId: string }
    >;
  };
}

export interface JoinRoomData {
  roomCode: string;
  userId: string;
  username: string;
}

export interface OfferData {
  roomCode: string;
  offer: RTCSessionDescriptionInit;
  targetSocketId: string;
}

export interface AnswerData {
  roomCode: string;
  answer: RTCSessionDescriptionInit;
  targetSocketId: string;
}

export interface IceCandidateData {
  roomCode: string;
  candidate: RTCIceCandidateInit;
  targetSocketId: string;
}

export interface MediaStateData {
  roomCode: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface LeaveRoomData {
  roomCode: string;
}
