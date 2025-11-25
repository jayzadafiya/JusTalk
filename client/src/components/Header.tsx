import { useAppSelector } from "@store/hooks";

interface HeaderProps {
  activeTab: "video" | "chat";
}

export const Header = ({ activeTab }: HeaderProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
      <h2 className="text-white font-medium">
        {activeTab === "video" ? "Video Calls" : "Messages"}
      </h2>

      <span className="text-sm text-slate-400 capitalize">
        {user?.firstName}
      </span>
    </div>
  );
};
