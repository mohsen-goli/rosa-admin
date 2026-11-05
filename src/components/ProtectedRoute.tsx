import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

        <p className="max-w-md text-gray-600">
          Your account does not have administrator permissions.
        </p>

        <button
          type="button"
          onClick={() => {
            void logout().catch((error) => {
              console.error("Logout failed:", error);
            });
          }}
          className="rounded-lg bg-pink-600 px-5 py-2.5 font-medium text-white transition hover:bg-pink-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
