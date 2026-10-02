/**
 * App — main entry point with React Router and AuthProvider.
 *
 * Route structure:
 * - /login       → PublicRoute → LoginPage (redirects if logged in)
 * - /dashboard   → ProtectedRoute → RoleRoute(member) → MemberDashboard
 * - /admin       → ProtectedRoute → RoleRoute(admin) → AdminDashboard
 * - /forbidden   → ProtectedRoute → ForbiddenPage
 * - /            → redirects to /login
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PublicRoute,
  RoleRoute,
} from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import ForbiddenPage from "./pages/ForbiddenPage";
import LoginPage from "./pages/LoginPage";
import MemberDashboard from "./pages/MemberDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route — logged-in users get redirected away */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            {/* Member-only */}
            <Route element={<RoleRoute role="member" />}>
              <Route path="/dashboard" element={<MemberDashboard />} />
            </Route>

            {/* Admin-only */}
            <Route element={<RoleRoute role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Forbidden — accessible to any authenticated user */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
