/**
 * Centralized API client with automatic cookie handling and silent token refresh.
 *
 * Key design decisions:
 * - `withCredentials: true` makes the browser send httpOnly cookies automatically
 * - Response interceptor catches 401 errors and triggers a single refresh
 * - If multiple requests fail with 401 at the same time, only ONE refresh call
 *   is made — the others wait on the same Promise (prevents race conditions)
 */

import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// Single-refresh guarantee
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Perform a single token refresh. If a refresh is already in flight,
 * return the existing promise so callers queue up instead of making
 * duplicate refresh calls.
 */
function doRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = apiClient
    .post("/api/auth/refresh/")
    .then(() => {
      // Refresh succeeded — new cookies are set automatically by the browser
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 with silent refresh + retry
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh the refresh endpoint itself
      if (originalRequest.url?.includes("/api/auth/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await doRefresh();
        // Retry the original request — browser sends the new cookie automatically
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — user needs to re-login
        // AuthContext will handle the redirect
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
