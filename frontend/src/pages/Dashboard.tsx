// Why this page exists:
// This is the landing home page for authenticated student and admin portal sessions.
// It welcomes the active user, details their user metadata status, 
// and displays beautifully styled card links to navigate to the chatbot, FAQ database, or admin directories.

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-indigo-950/5">
        <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full w-fit">
            Academic Assistant Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
            Welcome Back, {user?.full_name || (user?.email ? user.email.split("@")[0] : "Student")}!
          </h1>
          <p className="text-sm text-slate-400 max-w-lg leading-relaxed mt-1">
            Access institutional information, query college rules using grounding RAG, and update predefined FAQ items.
          </p>
        </div>
      </div>

      {/* Grid of Navigation Quick Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        
        {/* Chatbot Navigation Card */}
        <Link 
          to="/chat" 
          className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex gap-4 transition-all duration-200"
        >
          <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors duration-150">
              Query AI Chatbot
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Ask questions regarding fees, hostels, syllabus, and college regulations. Powered by RAG.
            </p>
          </div>
        </Link>

        {/* FAQs Navigation Card */}
        <Link 
          to="/faq" 
          className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex gap-4 transition-all duration-200"
        >
          <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-200 group-hover:text-violet-400 transition-colors duration-150">
              Predefined FAQs
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Browse structured, static FAQs regarding operating hours, admissions contact, and address directories.
            </p>
          </div>
        </Link>

        {/* Admin Section (Displayed only if user has administrative rights) */}
        {user?.is_admin && (
          <>
            {/* RAG Documents Card */}
            <Link 
              to="/admin/documents" 
              className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex gap-4 transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-600/10 border border-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors duration-150">
                  Manage Knowledge Bases
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Upload PDF and Word syllabus documents. Text is automatically parsed, vectorized, and stored in Qdrant.
                </p>
              </div>
            </Link>

            {/* Manage Static FAQ Database Card */}
            <Link 
              to="/admin/faqs" 
              className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex gap-4 transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors duration-150">
                  Configure Predefined FAQs
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Perform CRUD operations to insert, edit, or delete static FAQ database records directly.
                </p>
              </div>
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
