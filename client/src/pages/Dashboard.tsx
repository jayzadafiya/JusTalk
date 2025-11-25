import { useState } from "react";
import { Video, MessageSquare } from "lucide-react";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Header";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"video" | "chat">("video");

  return (
    <div className="h-screen flex bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Header activeTab={activeTab} />

        <div className="flex-1 overflow-auto">
          {activeTab === "video" ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-5">
                  <Video size={32} className="text-slate-600" />
                </div>
                <h3 className="text-lg text-white font-medium mb-1">
                  No active calls
                </h3>
                <p className="text-slate-500 text-sm mb-5">
                  Start a video call or join a room
                </p>
                <button className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Start Call
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-5">
                  <MessageSquare size={32} className="text-slate-600" />
                </div>
                <h3 className="text-lg text-white font-medium mb-1">
                  No messages
                </h3>
                <p className="text-slate-500 text-sm mb-5">
                  Start chatting with your contacts
                </p>
                <button className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  New Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
