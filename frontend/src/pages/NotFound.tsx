// Why this page exists:
// This is the custom 404 NotFound page. It catches all unmatched route paths
// and redirects students and administrators safely back to the home dashboard (/dashboard).

import React from "react";
import { Link } from "react-router-dom";

export const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 max-w-md mx-auto">
      {/* 404 Graphic SVG */}
      <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-lg shadow-indigo-950/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      {/* Message Description */}
      <h1 className="text-3xl font-extrabold text-slate-100 leading-none">404</h1>
      <h2 className="text-base font-bold text-slate-300 mt-3">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        The page you are trying to access does not exist, or you do not have administrative clearance to access it.
      </p>

      {/* Action Redirect Button */}
      <Link
        to="/dashboard"
        className="mt-8 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/15 transition-all focus:outline-none"
      >
        Return to Portal Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
