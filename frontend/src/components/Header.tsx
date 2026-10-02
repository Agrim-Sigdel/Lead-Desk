/**
 * Header component — shown on all authenticated pages.
 * Displays user info and a logout button.
 */

import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Lead Desk</h1>
        <span className="header-role">{user.role}</span>
      </div>
      <div className="header-right">
        <span className="header-user">{user.name}</span>
        <button className="btn btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
