// Why this layout exists:
// This layout frames the public authentication pages (Login & Register).
// If a user is already logged in, it redirects them to the authenticated Dashboard (/dashboard)
// to prevent accessing login pages during an active session. It renders a beautiful, modern gradient background.

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  // Show a loading screen while validating cached credentials
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Redirect to Dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background visual elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-600/25 mb-3">
            C
          </div>
          <h1 className="text-xl font-bold text-slate-100">Welcome to College Portal</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">FAQ & RAG Knowledge Assistant</p>
        </div>

        {/* Subpages (Login/Register Forms) will render here */}
        <Outlet />

      </div>
    </div>
  );
};

export default AuthLayout;
