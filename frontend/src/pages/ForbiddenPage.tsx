/**
 * ForbiddenPage — shown when a user tries to access a route they don't have permission for.
 */

import { useAuth } from "../context/AuthContext";

export default function ForbiddenPage() {
  const { user } = useAuth();

  const homePath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="forbidden-container">
      <div className="forbidden-card">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <a href={homePath} className="btn btn-primary">
          Go to Home
        </a>
      </div>
    </div>
  );
}
