// Why this page exists:
// This is the Student Registration page. It allows new students to create profiles.
// It verifies password inputs, contacts the backend /auth/register endpoint,
// and redirects students to the login screen with a success toast message upon completion.

import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (fullName && /\d/.test(fullName)) {
      setError("Name cannot contain numeric values.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send registration payload to backend
      await axiosInstance.post("/auth/register", {
        email,
        password,
        full_name: fullName.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed. Try using another email address.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-slate-100">Create student profile</h2>
        <p className="text-xs text-slate-500 mt-1">Register to start querying the FAQ knowledge base</p>
      </div>

      {success ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Registration Complete!</h4>
          <p className="text-xs text-slate-500 mt-1">Redirecting you to the login screen...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
            />
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Create Profile"}
          </button>
        </form>
      )}

      {/* Redirect Link */}
      <div className="text-center mt-3 text-xs">
        <span className="text-slate-500">Already registered? </span>
        <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
