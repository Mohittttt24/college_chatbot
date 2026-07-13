// Why this component exists:
// This is the global Sidebar navigation component. It renders the primary portal navigation links.
// It uses AuthContext to dynamically expose administrative links (e.g. Document Upload and FAQ Management)
// only to users with the 'is_admin' privilege.

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Helper to check if a navigation item is currently active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItemClass = (path: string) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150";
    if (isActive(path)) {
      return `${baseClass} bg-indigo-600 text-white shadow-md shadow-indigo-600/10`;
    }
    return `${baseClass} text-slate-400 hover:text-slate-200 hover:bg-slate-800/60`;
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 select-none">
      
      {/* Sidebar Header Brand Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-600/20">
          C
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-100 leading-none">College Portal</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5 tracking-wider uppercase">AI Assistant</span>
        </div>
      </div>

      {/* Primary Navigation links */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 block">
          Menu
        </span>

        {/* Dashboard Link */}
        <Link to="/dashboard" className={navItemClass("/dashboard")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home Dashboard
        </Link>

        {/* AI Chatbot Link */}
        <Link to="/chat" className={navItemClass("/chat")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          Ask AI Chatbot
        </Link>

        {/* Static FAQs Link */}
        <Link to="/faq" className={navItemClass("/faq")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          College FAQs
        </Link>

        {/* Profile Link */}
        <Link to="/profile" className={navItemClass("/profile")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          My Profile
        </Link>

        {/* Administrative Navigation Links */}
        {user?.is_admin && (
          <>
            <div className="border-t border-slate-800/80 my-4" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 block">
              Administration
            </span>

            {/* Document Upload Link */}
            <Link to="/admin/documents" className={navItemClass("/admin/documents")}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              Upload RAG Docs
            </Link>

            {/* Predefined FAQ Management Link */}
            <Link to="/admin/faqs" className={navItemClass("/admin/faqs")}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              Manage FAQ DB
            </Link>

            {/* User Management Link */}
            <Link to="/admin/users" className={navItemClass("/admin/users")}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              Manage Users
            </Link>
          </>
        )}
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <span className="text-[10px] font-semibold text-slate-600 tracking-wide uppercase">
          Portal Version 1.0
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
