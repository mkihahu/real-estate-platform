import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  const isGuestAllowed = allowedRoles?.includes(undefined);

  if (!user && !isGuestAllowed) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Public route
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === "admin")
      return <Navigate to="/admin-dashboard" replace />;

    if (user.role === "seller") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };
