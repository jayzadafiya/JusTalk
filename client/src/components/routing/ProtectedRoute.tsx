import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { isAuthenticated as checkAuth } from "@services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const hasAuth = isAuthenticated || checkAuth();

  if (!hasAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
