/**
 * AuthContext — single source of truth for authentication state.
 *
 * Provides:
 * - user: current user object (null if not logged in)
 * - loading: true while checking session on mount
 * - login(): authenticate and redirect based on role
 * - logout(): clear session and redirect to /login
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * On mount, try to restore the session by calling /api/auth/me.
   * If the access token is expired, the Axios interceptor will
   * automatically refresh it before retrying.
   */
  useEffect(() => {
    apiClient
      .get("/api/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login — sends credentials, receives user info (tokens are set as
   * httpOnly cookies by the backend, invisible to JS).
   */
  const login = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      const res = await apiClient.post("/api/auth/login/", { email, password });
      const userData: User = res.data;
      setUser(userData);

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      // Role-based redirect
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    [navigate]
  );

  /**
   * Logout — revokes the refresh token on the server,
   * clears cookies, resets state, redirects to /login.
   */
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout/");
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
