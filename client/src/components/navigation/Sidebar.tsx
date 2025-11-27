import { Video, MessageSquare, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/slices/authSlice";
import { logout as logoutApi } from "@services/auth.service";
import { Button } from "@components/ui/Button";

interface SidebarProps {
  activeTab: "video" | "chat";
  onTabChange: (tab: "video" | "chat") => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("/calls")) {
      onTabChange("chat");
    } else if (
      location.pathname.includes("/rooms") ||
      location.pathname.includes("/dashboard")
    ) {
      onTabChange("video");
    }
  }, [location.pathname, onTabChange]);

  const handleLogout = () => {
    logoutApi();
    dispatch(logoutAction());
    navigate("/login");
  };

  const handleTabChange = (tab: "video" | "chat") => {
    onTabChange(tab);
    if (tab === "video") {
      navigate("/dashboard/rooms");
    } else {
      navigate("/dashboard/calls");
    }
  };

  return (
    <div className="w-16 bg-slate-900 flex flex-col items-center pb-5 pt-[7px] border-r border-slate-800">
      <div className="mb-10">
        <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">J</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <Button
          onClick={() => handleTabChange("video")}
          variant={activeTab === "video" ? "primary" : "ghost"}
          className={`w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 p-0 ${
            activeTab === "video" ? "" : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center w-full h-full transform scale-100 md:scale-105 lg:scale-115">
            <Video size={20} />
          </span>
        </Button>

        <Button
          onClick={() => handleTabChange("chat")}
          variant={activeTab === "chat" ? "primary" : "ghost"}
          className={`w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 p-0 ${
            activeTab === "chat" ? "" : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center w-full h-full transform scale-100 md:scale-105 lg:scale-115">
            <MessageSquare size={20} />
          </span>
        </Button>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700"
        >
          {user?.firstName?.charAt(0).toUpperCase() || "U"}
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute bottom-0 left-16 ml-2 w-56 bg-slate-800 rounded-lg border border-slate-700 z-20">
              <div className="p-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white text-ellipsis overflow-hidden whitespace-nowrap  capitalize">
                      {user?.firstName}
                    </p>
                    <p className="text-xs text-slate-400">@{user?.username}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/dashboard/profile");
                  }}
                  variant="ghost"
                  className="w-full justify-start text-slate-300 px-3 py-2 text-sm"
                  leftIcon={<Settings size={16} />}
                >
                  Settings
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-400 px-3 py-2 text-sm"
                  leftIcon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
