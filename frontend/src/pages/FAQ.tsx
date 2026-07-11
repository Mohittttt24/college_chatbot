// Why this page exists:
// This is the static FAQs directory page for students.
// It displays a list of standard questions and answers fetched from the PostgreSQL database.
// It provides a real-time local search bar to instantly filter topics (e.g. library, fees).

import React, { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch FAQs list from backend
        const response = await axiosInstance.get("/admin/faqs");
        setFaqs(response.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load static FAQ registry. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter FAQs locally based on search query
  const filteredFaqs = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Header Description & Search Input */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">College Portal FAQ Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse answers to commonly asked questions about campus services, timelines, and contacts.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g. admission, fees, library)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors duration-150"
          />
          <div className="absolute left-3.5 top-3.5 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* FAQs List Accordion View */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="py-24 text-center text-rose-400 text-xs">{error}</div>
      ) : filteredFaqs.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl p-6 bg-slate-900/5">
          No matching FAQs found. Try asking the AI Chatbot instead!
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredFaqs.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden hover:border-slate-800 transition-colors"
              >
                {/* Accordion Trigger Question Bar */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left font-bold text-sm text-slate-200 hover:text-slate-100 transition-colors focus:outline-none"
                >
                  <span>{item.question}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.0}
                    stroke="currentColor"
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Accordion Expandable Answer Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-850/50 bg-slate-900/20 select-text">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FAQ;
