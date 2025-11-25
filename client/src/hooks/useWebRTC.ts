import { useRef, useState, useCallback } from "react";
import { socketService } from "../services/socket.service";

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface Peer {
  socketId: string;
  userId: string;
  username: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export const useWebRTC = (
  roomCode: string,
  userId: string,
  username: string
) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const peersRef = useRef<Map<string, Peer>>(new Map());

  const createPeerConnection = useCallback(
    (socketId: string, userId: string, username: string): RTCPeerConnection => {
      const peerConnection = new RTCPeerConnection(STUN_SERVERS);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.emit("ice-candidate", {
            roomCode,
            candidate: event.candidate,
            targetSocketId: socketId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setPeers((prev) => {
          const newPeers = new Map(prev);
          const peer = newPeers.get(socketId);
          if (peer) {
            peer.stream = remoteStream;
            newPeers.set(socketId, peer);
          }
          return newPeers;
        });
      };

      peerConnection.onconnectionstatechange = () => {
        console.log(`Peer ${socketId} state:`, peerConnection.connectionState);
        if (
          peerConnection.connectionState === "disconnected" ||
          peerConnection.connectionState === "failed" ||
          peerConnection.connectionState === "closed"
        ) {
          removePeer(socketId);
        }
      };

      return peerConnection;
    },
    [roomCode]
  );

  const addPeer = useCallback(
    (socketId: string, userId: string, username: string) => {
      const peerConnection = createPeerConnection(socketId, userId, username);
      const peer: Peer = {
        socketId,
        userId,
        username,
        connection: peerConnection,
      };

      peersRef.current.set(socketId, peer);
      setPeers(new Map(peersRef.current));

      return peer;
    },
    [createPeerConnection]
  );

  const removePeer = useCallback((socketId: string) => {
    const peer = peersRef.current.get(socketId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(socketId);
      setPeers(new Map(peersRef.current));
    }
  }, []);

  const startLocalStream = useCallback(async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error("Error accessing media devices:", error);

      let errorMessage = "Failed to access camera/microphone. ";

      if (error.name === "NotReadableError") {
        errorMessage +=
          "Your camera or microphone is already in use by another application. Please close other apps using your camera/microphone and try again.";
      } else if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage +=
          "Permission denied. Please allow camera and microphone access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage +=
          "No camera or microphone found. Please connect a device and try again.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }

      throw new Error(errorMessage);
    }
  }, [localStream]);

  const addStreamToPeer = useCallback((peer: Peer, stream: MediaStream) => {
    const senders = peer.connection.getSenders();
    const existingTracks = senders.map((sender) => sender.track);

    stream.getTracks().forEach((track) => {
      if (!existingTracks.includes(track)) {
        peer.connection.addTrack(track, stream);
      }
    });
  }, []);

  const createOffer = useCallback(
    async (peer: Peer, stream: MediaStream) => {
      if (peer.connection.signalingState !== "stable") {
        console.log(
          `Cannot create offer, peer in state: ${peer.connection.signalingState}`
        );
        return;
      }

      addStreamToPeer(peer, stream);

      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);

      socketService.emit("offer", {
        roomCode,
        offer,
        targetSocketId: peer.socketId,
      });
    },
    [roomCode, addStreamToPeer]
  );

  const handleOffer = useCallback(
    async (
      offer: RTCSessionDescriptionInit,
      senderSocketId: string,
      stream: MediaStream
    ) => {
      let peer = peersRef.current.get(senderSocketId);

      if (!peer) {
        peer = addPeer(senderSocketId, "", "");
      }

      if (
        peer.connection.signalingState !== "stable" &&
        peer.connection.signalingState !== "have-local-offer"
      ) {
        console.log(
          `Ignoring offer, peer in state: ${peer.connection.signalingState}`
        );
        return;
      }

      addStreamToPeer(peer, stream);

      await peer.connection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      socketService.emit("answer", {
        roomCode,
        answer,
        targetSocketId: senderSocketId,
      });
    },
    [roomCode, addPeer, addStreamToPeer]
  );

  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit, senderSocketId: string) => {
      const peer = peersRef.current.get(senderSocketId);
      if (peer) {
        await peer.connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    },
    []
  );

  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit, senderSocketId: string) => {
      const peer = peersRef.current.get(senderSocketId);
      if (peer) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    },
    []
  );

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const newState = !isAudioEnabled;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = newState;
      });
      setIsAudioEnabled(newState);

      socketService.emit("media-state", {
        roomCode,
        audioEnabled: newState,
        videoEnabled: isVideoEnabled,
      });
    }
  }, [localStream, isAudioEnabled, isVideoEnabled, roomCode]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const newState = !isVideoEnabled;
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
      setIsVideoEnabled(newState);

      socketService.emit("media-state", {
        roomCode,
        audioEnabled: isAudioEnabled,
        videoEnabled: newState,
      });
    }
  }, [localStream, isAudioEnabled, isVideoEnabled, roomCode]);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  const cleanup = useCallback(() => {
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();
    setPeers(new Map());
    stopLocalStream();
  }, [stopLocalStream]);

  return {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    startLocalStream,
    addPeer,
    removePeer,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
};
