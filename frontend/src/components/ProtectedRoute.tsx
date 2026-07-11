// Why this component exists:
// This is a Route Guard component that protects private student and administrator pages.
// It checks authentication states. If a student is not logged in, it redirects them to the login screen.
// If a user tries to access admin-only pages but is not an admin, it redirects them to the general dashboard.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Display a full-page loading screen while validating auth credentials
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to general dashboard if page is admin-only but user is a standard student
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if all security checks pass
  return children;
};

export default ProtectedRoute;
