import { Video, MessageSquare, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/slices/authSlice";
import { logout as logoutApi } from "../services/auth.service";

interface SidebarProps {
  activeTab: "video" | "chat";
  onTabChange: (tab: "video" | "chat") => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logoutApi();
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <div className="w-16 bg-slate-900 flex flex-col items-center pb-5 pt-[7px] border-r border-slate-800">
      <div className="mb-10">
        <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">J</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <button
          onClick={() => onTabChange("video")}
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            activeTab === "video"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Video size={20} />
        </button>

        <button
          onClick={() => onTabChange("chat")}
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            activeTab === "chat"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <MessageSquare size={20} />
        </button>
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
                <button className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
