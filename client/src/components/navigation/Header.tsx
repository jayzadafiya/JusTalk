import { useAppSelector } from "@store/hooks";

interface HeaderProps {
  activeTab: "video" | "chat";
}

export const Header = ({ activeTab }: HeaderProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center md:hidden">
          <span className="text-white font-bold text-sm">J</span>
        </div>
        <h2 className="text-white font-medium">
          {activeTab === "video" ? "Video Calls" : "Messages"}
        </h2>
      </div>

      <span className="text-sm text-slate-400 capitalize">
        {user?.firstName}
      </span>
    </div>
  );
};
