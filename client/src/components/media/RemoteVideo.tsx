import { useEffect, useRef, useState } from "react";
import { MicOff, VideoOff } from "lucide-react";
import type { RemoteVideoProps } from "@/types";

const RemoteVideo = ({ peer, mediaState }: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
      videoRef.current
        .play()
        .catch((err) => console.log("Remote video play error:", err));
    }
  }, [peer.stream]);

  useEffect(() => {
    if (mediaState) {
      setHasVideo(mediaState.videoEnabled);
      setHasAudio(mediaState.audioEnabled);
      console.log(
        `Updated ${peer.username} - Video: ${mediaState.videoEnabled}, Audio: ${mediaState.audioEnabled}`
      );
    }
  }, [mediaState, peer.username]);

  return (
    <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <div className="w-full h-full min-h-[200px] relative">
        {peer.stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
            {!hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-700 z-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-3xl">
                      {peer.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <VideoOff size={32} className="text-slate-400 mx-auto" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-3xl">
                  {peer.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Connecting...</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-lg z-20">
          {peer.username || "Anonymous"}
        </div>
        {!hasAudio && peer.stream && (
          <div className="absolute top-3 right-3 bg-red-600 p-2 rounded-lg shadow-lg z-20">
            <MicOff size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteVideo;
