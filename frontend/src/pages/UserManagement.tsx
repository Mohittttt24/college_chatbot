// Why this page exists:
// This is the administrative User Management dashboard. It allows portal administrators
// to review all registered user accounts and permanently delete accounts if necessary,
// while preventing self-deletion.
// NOTE: Uses inline confirmation UI instead of window.confirm() to avoid browser dialog blocking.

import React, { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

interface User {
  id: number;
  email: string;
  is_admin: boolean;
  full_name?: string | null;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Track which user row is showing the inline confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/admin/users");
      setUsers(response.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to retrieve user accounts database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    setActionLoading(userId);
    setDeleteError(null);
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.detail || "Failed to delete user. Verify your administrative privileges."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-100">User Account Manager</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, moderate, and remove student or administrator accounts from the system.
        </p>
      </div>

      {/* Error banner */}
      {deleteError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-400 text-xs">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name / Profile</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  const isConfirming = confirmDeleteId === item.id;
                  const isDeleting = actionLoading === item.id;
                  return (
                    <tr key={item.id} className={`transition-colors duration-100 ${isConfirming ? 'bg-rose-950/20' : 'hover:bg-slate-900/50'}`}>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">#{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${item.is_admin ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20' : 'bg-slate-800 text-slate-400 border-slate-700'} border flex items-center justify-center font-bold text-xs shadow-inner`}>
                            {item.full_name ? item.full_name.charAt(0).toUpperCase() : (item.email ? item.email.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <span className="text-xs font-bold text-slate-200">
                            {item.full_name || <span className="text-slate-500 italic">No Name Set</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{item.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.is_admin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {item.is_admin ? "Admin" : "Student"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-950 px-2 py-1 rounded-md cursor-not-allowed">
                            Current Session
                          </span>
                        ) : isConfirming ? (
                          // Inline confirmation row — no window.confirm needed
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-rose-400 font-semibold mr-1">Confirm delete?</span>
                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all focus:outline-none disabled:opacity-50"
                            >
                              {isDeleting ? "Deleting…" : "Yes, Delete"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-all focus:outline-none disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-all focus:outline-none disabled:opacity-50"
                          >
                            Delete User
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
