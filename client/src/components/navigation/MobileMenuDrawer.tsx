import { LogOut, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { logout as logoutAction } from "@store/slices/authSlice";
import { logout as logoutApi } from "@services/auth.service";
import { Button } from "@components/ui/Button";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer = ({
  isOpen,
  onClose,
}: MobileMenuDrawerProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    logoutApi();
    dispatch(logoutAction());
    navigate("/login");
    onClose();
  };

  return (
    <>
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-800 rounded-t-lg border-t border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-white text-ellipsis overflow-hidden whitespace-nowrap capitalize">
                {user?.firstName}
              </p>
              <p className="text-xs text-slate-400">@{user?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <Button
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
      </div>
    </>
  );
};
