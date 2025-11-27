import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { socketService } from "@services/socket.service";
import { useIsMobile } from "@hooks/useIsMobile";
import RemoteVideo from "@components/media/RemoteVideo";
import DoodleCanvas from "@components/media/DoodleCanvas";
import DoodleToolbar from "@components/media/DoodleToolbar";
import { Button } from "@components/ui/Button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  AlertCircle,
  Pen,
  Camera,
} from "lucide-react";
import type { Participant, DoodleCanvasRef } from "@/types";
import { useWebRTC } from "@/hooks/useWebRTC";

export const VideoRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const doodleCanvasRef = useRef<DoodleCanvasRef>(null);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [peerMediaStates, setPeerMediaStates] = useState<
    Map<string, { audioEnabled: boolean; videoEnabled: boolean }>
  >(new Map());
  const [authChecked, setAuthChecked] = useState(false);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  const isMobile = useIsMobile();

  const {
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
  } = useWebRTC(code || "", user?._id || "", user?.username || "");

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Setting local video stream:", localStream);
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.error("Error playing local video:", err);
      });
    }
  }, [localStream]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!user || !code) {
      navigate("/");
      return;
    }

    let mounted = true;

    const initializeRoom = async () => {
      try {
        setIsInitializing(true);
        setError("");

        const stream = await startLocalStream();

        if (!mounted) return;

        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current
            .play()
            .catch((err) => console.log("Local video play error:", err));
        }

        const socket = socketService.connect();

        const handleExistingParticipants = (participants: Participant[]) => {
          participants.forEach((participant) => {
            const peer = addPeer(
              participant.socketId,
              participant.userId,
              participant.username
            );
            createOffer(peer, stream);
          });
        };

        const handleNewPeer = ({ socketId, userId, username }: Participant) => {
          console.log("New peer joined:", username);
          addPeer(socketId, userId, username);
        };

        const handleOfferReceived = ({
          offer,
          senderSocketId,
        }: {
          offer: RTCSessionDescriptionInit;
          senderSocketId: string;
        }) => {
          handleOffer(offer, senderSocketId, stream);
        };

        const handleAnswerReceived = ({
          answer,
          senderSocketId,
        }: {
          answer: RTCSessionDescriptionInit;
          senderSocketId: string;
        }) => {
          handleAnswer(answer, senderSocketId);
        };

        const handleIceCandidateReceived = ({
          candidate,
          senderSocketId,
        }: {
          candidate: RTCIceCandidateInit;
          senderSocketId: string;
        }) => {
          handleIceCandidate(candidate, senderSocketId);
        };

        const handlePeerDisconnect = ({ socketId }: { socketId: string }) => {
          console.log("Peer disconnected:", socketId);
          removePeer(socketId);
          setPeerMediaStates((prev) => {
            const updated = new Map(prev);
            updated.delete(socketId);
            return updated;
          });
        };

        const handlePeerMediaState = ({
          socketId,
          audioEnabled,
          videoEnabled,
        }: {
          socketId: string;
          audioEnabled: boolean;
          videoEnabled: boolean;
        }) => {
          console.log(
            `Peer ${socketId} media state - Audio: ${audioEnabled}, Video: ${videoEnabled}`
          );
          setPeerMediaStates((prev) => {
            const updated = new Map(prev);
            updated.set(socketId, { audioEnabled, videoEnabled });
            return updated;
          });
        };

        const handleRoomEnded = () => {
          console.log("Room ended - all participants left");
          if (mounted) {
            setCallEnded(true);
          }
        };

        socket.on("existing-participants", handleExistingParticipants);
        socket.on("new-peer", handleNewPeer);
        socket.on("offer", handleOfferReceived);
        socket.on("answer", handleAnswerReceived);
        socket.on("ice-candidate", handleIceCandidateReceived);
        socket.on("peer-disconnect", handlePeerDisconnect);
        socket.on("peer-media-state", handlePeerMediaState);
        socket.on("room-ended", handleRoomEnded);

        socket.emit("join-room", {
          roomCode: code,
          userId: user._id,
          username: user.username,
        });

        socket.emit("media-state", {
          roomCode: code,
          audioEnabled: isAudioEnabled,
          videoEnabled: isVideoEnabled,
        });

        if (mounted) {
          setIsInitializing(false);
        }

        return () => {
          socket.off("existing-participants", handleExistingParticipants);
          socket.off("new-peer", handleNewPeer);
          socket.off("offer", handleOfferReceived);
          socket.off("answer", handleAnswerReceived);
          socket.off("ice-candidate", handleIceCandidateReceived);
          socket.off("peer-disconnect", handlePeerDisconnect);
          socket.off("peer-media-state", handlePeerMediaState);
          socket.off("room-ended", handleRoomEnded);
        };
      } catch (error: any) {
        console.error("Error initializing room:", error);
        if (mounted) {
          setError(error.message || "Failed to initialize video call");
          setIsInitializing(false);
        }
      }
    };

    const cleanupPromise = initializeRoom();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });
      socketService.emit("leave-room", { roomCode: code });
      cleanup();
      socketService.disconnect();
    };
  }, [code, user, navigate, authChecked]);

  const handleLeaveRoom = () => {
    socketService.emit("leave-room", { roomCode: code });
    cleanup();
    navigate("/");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleToggleDrawing = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleColorChange = (color: string) => {
    setStrokeColor(color);
  };

  const handleWidthChange = (width: number) => {
    setStrokeWidth(width);
  };

  const handleUndo = () => {
    doodleCanvasRef.current?.undo();
  };

  const handleClearCanvas = () => {
    doodleCanvasRef.current?.clear(false);
  };

  const handleScreenshot = async () => {
    try {
      setIsCapturingScreenshot(true);

      const videoContainer = document.querySelector(".flex-1.p-4");
      if (!videoContainer) {
        throw new Error("Video container not found");
      }

      const flashDiv = document.createElement("div");
      flashDiv.style.position = "fixed";
      flashDiv.style.top = "0";
      flashDiv.style.left = "0";
      flashDiv.style.width = "100%";
      flashDiv.style.height = "100%";
      flashDiv.style.backgroundColor = "white";
      flashDiv.style.opacity = "0.7";
      flashDiv.style.zIndex = "9999";
      flashDiv.style.pointerEvents = "none";
      document.body.appendChild(flashDiv);

      setTimeout(() => {
        document.body.removeChild(flashDiv);
      }, 150);

      const videoElements = videoContainer.querySelectorAll("video");
      const containerRect = videoContainer.getBoundingClientRect();

      const screenshotCanvas = document.createElement("canvas");
      screenshotCanvas.width = containerRect.width;
      screenshotCanvas.height = containerRect.height;
      const ctx = screenshotCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);

      videoElements.forEach((video) => {
        const videoRect = video.getBoundingClientRect();
        const x = videoRect.left - containerRect.left;
        const y = videoRect.top - containerRect.top;

        try {
          ctx.drawImage(video, x, y, videoRect.width, videoRect.height);
        } catch (err) {
          console.warn("Could not draw video element:", err);
        }
      });

      const doodleCanvas = videoContainer.querySelector("canvas");
      if (doodleCanvas) {
        const doodleRect = doodleCanvas.getBoundingClientRect();
        const x = doodleRect.left - containerRect.left;
        const y = doodleRect.top - containerRect.top;

        try {
          ctx.drawImage(
            doodleCanvas,
            x,
            y,
            doodleRect.width,
            doodleRect.height
          );
        } catch (err) {
          console.warn("Could not draw doodle canvas:", err);
        }
      }

      screenshotCanvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          link.download = `JusTalk-Screenshot-${timestamp}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
        setIsCapturingScreenshot(false);
      }, "image/png");
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      setIsCapturingScreenshot(false);
      alert("Failed to capture screenshot. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="max-w-md p-6 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle
              size={24}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Unable to Join Room
              </h3>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
              <div className="text-xs text-slate-400 mb-4">
                <p className="mb-2">Common solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Close other apps using your camera/microphone (Zoom, Teams,
                    Skype, etc.)
                  </li>
                  <li>
                    Close other browser tabs that might be using your camera
                  </li>
                  <li>Check browser permissions for camera and microphone</li>
                  <li>Restart your browser if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRetry} className="flex-1">
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              className="flex-1"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Initializing video call...</p>
          <p className="text-slate-400 text-sm mt-2">
            Please allow camera and microphone access
          </p>
        </div>
      </div>
    );
  }

  if (callEnded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff size={40} className="text-slate-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Call Ended</h2>
          <p className="text-slate-400 mb-6">
            All participants have left the room
          </p>
          <Button onClick={() => navigate("/")} size="lg">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-medium">Room: {code}</h2>
          <p className="text-sm text-slate-400">
            {peers.size + 1} participant{peers.size !== 0 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto bg-slate-900">
        <div className="relative h-full">
          <div
            className={`grid gap-3 h-full auto-rows-fr ${
              peers.size === 0
                ? "grid-cols-1"
                : peers.size === 1
                ? "grid-cols-1 md:grid-cols-2"
                : peers.size === 2
                ? "grid-cols-1 md:grid-cols-2"
                : peers.size === 3
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                : peers.size <= 5
                ? "grid-cols-2 md:grid-cols-3"
                : peers.size <= 8
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border-2 border-blue-600">
              <div className="w-full h-full min-h-[200px] relative">
                {localStream && (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1] bg-black"
                    onLoadedMetadata={() => {
                      console.log("Local video metadata loaded");
                      if (localVideoRef.current) {
                        console.log(
                          "Video dimensions:",
                          localVideoRef.current.videoWidth,
                          "x",
                          localVideoRef.current.videoHeight
                        );
                      }
                    }}
                    onPlay={() => console.log("Local video is playing")}
                    onError={(e) => console.error("Video element error:", e)}
                  />
                )}
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-3xl">
                          {user?.firstName?.charAt(0).toUpperCase() || "Y"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Initializing camera...
                      </p>
                    </div>
                  </div>
                )}
                {!isVideoEnabled && localStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700 z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-3xl">
                          {user?.firstName?.charAt(0).toUpperCase() || "Y"}
                        </span>
                      </div>
                      <VideoOff size={32} className="text-slate-400 mx-auto" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-lg z-20">
                  You {!isVideoEnabled && "(Camera off)"}
                </div>
                {!isAudioEnabled && (
                  <div className="absolute top-3 right-3 bg-red-600 p-2 rounded-lg shadow-lg z-20">
                    <MicOff size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {[...peers.values()].map((peer) => (
              <RemoteVideo
                key={peer.socketId}
                peer={peer}
                mediaState={peerMediaStates.get(peer.socketId)}
              />
            ))}
          </div>

          {code && user && socketService.getSocket() && (
            <DoodleCanvas
              ref={doodleCanvasRef}
              roomId={code}
              userId={user._id}
              socket={socketService.getSocket()!}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              enabled={isDrawingMode}
              onUndoStackChange={setCanUndo}
              maxStrokes={500}
              className="z-10"
            />
          )}
        </div>
      </div>

      {isDrawingMode && (
        <div
          className={`fixed z-30 ${
            isMobile
              ? "bottom-24 right-4"
              : "bottom-24 left-1/2 transform -translate-x-1/2"
          }`}
        >
          <DoodleToolbar
            isDrawingMode={isDrawingMode}
            currentColor={strokeColor}
            currentWidth={strokeWidth}
            onToggleDrawing={handleToggleDrawing}
            onColorChange={handleColorChange}
            onWidthChange={handleWidthChange}
            onUndo={handleUndo}
            onClear={handleClearCanvas}
            canUndo={canUndo}
          />
        </div>
      )}

      <div className="h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-3 px-4">
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "secondary" : "danger"}
          className="w-14 h-14 p-0 rounded-full"
          title={isAudioEnabled ? "Mute" : "Unmute"}
        >
          {isAudioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "secondary" : "danger"}
          className="w-14 h-14 p-0 rounded-full"
          title={isVideoEnabled ? "Stop Video" : "Start Video"}
        >
          {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </Button>

        <Button
          onClick={handleToggleDrawing}
          variant={isDrawingMode ? "primary" : "secondary"}
          className="w-14 h-14 p-0 rounded-full"
          title={isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
        >
          <Pen size={22} />
        </Button>

        <Button
          onClick={handleScreenshot}
          variant="secondary"
          className="w-14 h-14 p-0 rounded-full"
          title="Take Screenshot"
          disabled={isCapturingScreenshot}
        >
          {isCapturingScreenshot ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Camera size={22} />
          )}
        </Button>

        <Button
          onClick={handleLeaveRoom}
          variant="danger"
          className="w-14 h-14 p-0 rounded-full"
          title="Leave Call"
        >
          <PhoneOff size={22} />
        </Button>
      </div>
    </div>
  );
};
