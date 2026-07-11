// Why this page exists:
// This is the administrative control panel for Predefined FAQ Management.
// It allows users with admin roles to view, create, edit, and delete static FAQs
// directly from the database through the backend /admin/faqs router endpoints.

import React, { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  created_at?: string;
}

export const Admin: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch FAQ list
  const fetchFAQs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch FAQs from standard FAQ endpoint (accessible by all)
      const response = await axiosInstance.get("/admin/faqs");
      // Wait, in routers/admin.py, the GET /admin/faqs retrieves all faqs
      setFaqs(response.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to retrieve static FAQs from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setFormError("Both fields are required.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingId) {
        // Edit existing FAQ endpoint (PUT /admin/faqs/{id})
        const response = await axiosInstance.put(`/admin/faqs/${editingId}`, {
          question: question.trim(),
          answer: answer.trim(),
        });
        
        setFaqs((prev) =>
          prev.map((item) => (item.id === editingId ? response.data : item))
        );
        setEditingId(null);
      } else {
        // Create new FAQ endpoint (POST /admin/faqs)
        const response = await axiosInstance.post("/admin/faqs", {
          question: question.trim(),
          answer: answer.trim(),
        });
        
        setFaqs((prev) => [response.data, ...prev]);
      }
      
      // Clear inputs
      setQuestion("");
      setAnswer("");
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Action failed. Check authentication and permissions.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (item: FAQItem) => {
    setQuestion(item.question);
    setAnswer(item.answer);
    setEditingId(item.id);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setQuestion("");
    setAnswer("");
    setEditingId(null);
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this FAQ record?")) {
      try {
        // Delete FAQ endpoint (DELETE /admin/faqs/{id})
        await axiosInstance.delete(`/admin/faqs/${id}`);
        setFaqs((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.detail || "Delete operation failed.");
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
      
      {/* FAQ Management Form */}
      <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit shrink-0">
        <h3 className="text-base font-bold text-slate-100 mb-4">
          {editingId ? "Edit FAQ Entry" : "Create New FAQ Entry"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Question Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the library timings?"
              disabled={formLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
            />
          </div>

          {/* Answer Text Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
              Answer Description
            </label>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g., The library is open from 9:00 AM to 8:00 PM on weekdays."
              disabled={formLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150 resize-none"
            />
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={formLoading}
                className="flex-1 px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-850 transition-colors focus:outline-none"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/15 transition-all focus:outline-none"
            >
              {formLoading ? "Saving..." : editingId ? "Save Changes" : "Create FAQ"}
            </button>
          </div>

        </form>
      </div>

      {/* FAQ Database Table List */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-100 mb-4">
          Predefined FAQs list ({faqs.length})
        </h3>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-400 text-xs">{error}</div>
        ) : faqs.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No static FAQs found in the database. Use the creation form to add records.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col gap-1.5 max-w-[80%]">
                  <h4 className="text-sm font-bold text-slate-200">
                    Q: {item.question}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A: {item.answer}
                  </p>
                </div>

                {/* Operations CRUD Row */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all focus:outline-none"
                    title="Edit Record"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all focus:outline-none"
                    title="Delete Record"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Admin;
