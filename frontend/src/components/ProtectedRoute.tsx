/**
 * Route guard components for role-based access control.
 *
 * - ProtectedRoute: requires authentication, redirects to /login if not
 * - RoleRoute: requires a specific role, redirects to /forbidden if wrong
 * - PublicRoute: for login page — redirects authenticated users to their home
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps routes that require the user to be logged in.
 * Shows a loading spinner while checking auth state on mount.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Wraps routes that require a specific role.
 * Must be nested inside a ProtectedRoute.
 */
export function RoleRoute({ role }: { role: "admin" | "member" }) {
  const { user } = useAuth();

  if (user && user.role !== role) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

/**
 * Wraps routes that should only be accessible to logged-out users
 * (e.g., the login page). Redirects authenticated users to their home.
 */
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
