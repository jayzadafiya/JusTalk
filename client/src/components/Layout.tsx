import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Header } from "@components/Header";
import { Sidebar } from "@components/Sidebar";
import { MobileBottomBar } from "@components/MobileBottomBar";
import { MobileMenuDrawer } from "@components/MobileMenuDrawer";
import { useIsMobile } from "@hooks/useIsMobile";

interface LayoutProps {
  activeTab: "video" | "chat";
  onTabChange: (tab: "video" | "chat") => void;
}

const Layout = ({ activeTab, onTabChange }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-900">
      {!isMobile && <Sidebar activeTab={activeTab} onTabChange={onTabChange} />}
      <div
        className={`flex-1 flex flex-col min-h-0 ${isMobile ? "pb-16" : ""}`}
      >
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      {isMobile && (
        <MobileBottomBar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onMenuClick={() => setIsMenuOpen(true)}
        />
      )}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  );
};

export default Layout;
