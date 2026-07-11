// Why this page exists:
// This is the Profile settings view for logged-in students or administrators.
// It loads active session credentials directly from AuthContext and shows their access clearance.

import React from "react";
import { useAuth } from "../hooks/useAuth";

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-100">My Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your account registration settings and active portal privileges.
        </p>
      </div>

      {/* Profile Details Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-md shadow-black/5">
        
        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-800/80 pb-5">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-2xl shadow-inner">
            {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-bold text-slate-200">{user?.email}</h3>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md w-fit uppercase tracking-widest mt-1">
              {user?.is_admin ? "Administrator Account" : "Student Account"}
            </span>
          </div>
        </div>

        {/* Detailed Metadata fields */}
        <div className="flex flex-col gap-4">
          
          {/* User ID Field */}
          <div className="grid grid-cols-3 items-center py-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Reference ID</span>
            <span className="text-sm font-semibold text-slate-300 col-span-2">{user?.id}</span>
          </div>

          {/* Email Address Field */}
          <div className="grid grid-cols-3 items-center py-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Email</span>
            <span className="text-sm font-semibold text-slate-350 col-span-2">{user?.email}</span>
          </div>

          {/* Role Field */}
          <div className="grid grid-cols-3 items-center py-2 border-b border-slate-850">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Access Clearance</span>
            <span className="text-sm font-semibold text-slate-300 col-span-2">
              {user?.is_admin ? "Full Administrator Permissions" : "Standard Student View Only"}
            </span>
          </div>

        </div>

        {/* Informational Callout Bubble */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
          {user?.is_admin ? (
            <p>
              💡 **Administrator Privilege Notice:** Your profile has full write authorization. 
              You can upload handbooks to vector databases, configure embeddings models, and perform CRUD edits on predefined FAQ structures.
            </p>
          ) : (
            <p>
              💡 **Student Account Notice:** Your profile has standard view clearance. You can chat with the AI assistant, retrieve document grounding context, and read predefined FAQs. To perform admin file uploads, ask the portal manager.
            </p>
          )}
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={logout}
          className="w-full sm:w-fit px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 font-bold text-sm rounded-xl transition-all self-end focus:outline-none"
        >
          Sign Out of Profile
        </button>

      </div>
    </div>
  );
};

export default Profile;
