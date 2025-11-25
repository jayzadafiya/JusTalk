import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@components/ProtectedRoute";
import { useAppDispatch } from "@store/hooks";
import { setUser } from "@store/slices/authSlice";
import { getProfile, isAuthenticated } from "./services/auth.service";
import "./App.css";

const Dashboard = lazy(() =>
  import("@page/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const Login = lazy(() =>
  import("@page/Login").then((module) => ({ default: module.Login }))
);
const Signup = lazy(() =>
  import("@page/Signup").then((module) => ({ default: module.Signup }))
);
const VideoRoom = lazy(() =>
  import("@page/VideoRoom").then((module) => ({ default: module.VideoRoom }))
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await getProfile();
          if (response.success && response.data) {
            dispatch(setUser(response.data));
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:code"
            element={
              <ProtectedRoute>
                <VideoRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
