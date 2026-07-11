// Why this layout exists:
// This is the primary layout wrapper for all authenticated pages in the portal.
// It integrates the Sidebar on the left and the Navbar on top.
// It redirects unauthenticated users to the Login page (/login) to enforce access control.

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show full-page loader while checking token validity
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Helper function to return a clean title depending on active sub-path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/chat")) return "AI Chatbot Assistant";
    if (path.startsWith("/faq")) return "Predefined FAQ database";
    if (path.startsWith("/admin/documents")) return "Knowledge Document Manager";
    if (path.startsWith("/admin/faqs")) return "FAQ Database Configuration";
    if (path.startsWith("/profile")) return "Student Profile Settings";
    return "College Student Portal";
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar Header */}
        <Navbar pageTitle={getPageTitle()} />

        {/* Dynamic Page Views Scrollable Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8 flex flex-col relative">
          
          {/* Subpages (pages/Chat, pages/Documents, etc.) will render here */}
          <Outlet />
          
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
