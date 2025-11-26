import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@components/Layout";

const RoomList = lazy(() =>
  import("@page/RoomList").then((module) => ({ default: module.RoomList }))
);
const CallList = lazy(() =>
  import("@page/CallList").then((module) => ({ default: module.CallList }))
);

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-slate-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-slate-400">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const [activeTab, setActiveTab] = useState<"video" | "chat">("video");

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/dashboard"
          element={<Layout activeTab={activeTab} onTabChange={setActiveTab} />}
        >
          <Route index element={<RoomList />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="calls" element={<CallList />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard/rooms" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
