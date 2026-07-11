// Why this component exists:
// This is the global Navbar component shown at the top of the dashboard pages.
// It displays the portal header, active page title, current user's identity details (via AuthContext),
// and provides a dropdown to logout or view their profile.

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30 shrink-0">
      
      {/* Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-100 tracking-wide">
          {pageTitle}
        </h2>
      </div>

      {/* User Information and Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-all duration-150 focus:outline-none"
        >
          {/* Avatar container */}
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
          </div>

          {/* User Email & Role */}
          <div className="hidden sm:flex flex-col items-start text-left text-xs">
            <span className="font-semibold text-slate-200 truncate max-w-[120px]">
              {user?.email || "Guest"}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {user?.is_admin ? "Administrator" : "Student"}
            </span>
          </div>

          {/* Caret Down Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.0}
            stroke="currentColor"
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop click dismiss handler */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowDropdown(false)} 
            />

            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Dropdown Header */}
              <div className="px-4 py-2 border-b border-slate-800/80 text-xs text-slate-500 font-semibold">
                Logged in as <br />
                <span className="text-slate-300 font-normal">{user?.email}</span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-slate-800 hover:text-rose-300 flex items-center gap-2 transition-colors duration-150 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.0}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sign Out
              </button>

            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
