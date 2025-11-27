import { Video, Menu, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/Button";

interface MobileBottomBarProps {
  activeTab: "video" | "chat";
  onTabChange: (tab: "video" | "chat") => void;
  onMenuClick: () => void;
}

export const MobileBottomBar = ({
  activeTab,
  onTabChange,
  onMenuClick,
}: MobileBottomBarProps) => {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);

  const handleTabChange = (tab: "video" | "chat") => {
    onTabChange(tab);
    if (tab === "video") {
      navigate("/dashboard/rooms");
    } else {
      navigate("/dashboard/calls");
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around py-2 px-4 z-50 md:hidden">
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50">
        <div className="flex items-center justify-around px-4 py-2">
          <Button
            onClick={() => handleTabChange("video")}
            variant={activeTab === "video" ? "primary" : "ghost"}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 ${
              activeTab === "video"
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Video size={20} />
            <span className="text-xs">Video</span>
          </Button>

          {/* <Button
            onClick={() => handleTabChange("chat")}
            variant={activeTab === "chat" ? "primary" : "ghost"}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 ${
              activeTab === "chat"
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-xs">Chat</span>
          </Button> */}

          <Button
            onClick={onMenuClick}
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 py-3 px-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
            <span className="text-xs">Menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
