// Why this page exists:
// This is the Document Upload manager page visible only to Administrators.
// It queries the backend GET /documents endpoint to list all knowledge source files,
// renders them using DocumentCard components, handles document deletion triggers,
// and opens the UploadModal to drag-and-drop new files.
// It also provides an "Index AIET Website" button to crawl https://new.aiet.org.in/
// and embed all web page content into Qdrant for the AIET Chatbox.

import React, { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import DocumentCard, { DocumentInfo } from "../components/DocumentCard";
import UploadModal from "../components/UploadModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export const DocumentUpload: React.FC = () => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Website indexing state
  const [indexing, setIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState<{ status: "success" | "error"; message: string } | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/documents");
      setDocuments(response.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load uploaded documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (id: number) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await axiosInstance.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || "Failed to delete the document. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleIndexWebsite = async () => {
    setIndexing(true);
    setIndexResult(null);
    try {
      const response = await axiosInstance.post("/rag/embed-website");
      setIndexResult({
        status: "success",
        message: `✅ Successfully indexed ${response.data.embedded_chunks_count} chunks from the AIET website into the AI knowledge base.`,
      });
    } catch (err: any) {
      setIndexResult({
        status: "error",
        message: err.response?.data?.detail || "Failed to index the AIET website. Please try again.",
      });
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full">

      {/* Error banners */}
      {deleteError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {indexResult && (
        <div className={`border text-xs p-3 rounded-xl flex items-start gap-2 ${
          indexResult.status === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          <span className="mt-0.5 shrink-0">{indexResult.status === "success" ? "✅" : "❌"}</span>
          <span>{indexResult.message}</span>
          <button onClick={() => setIndexResult(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header section with Action Buttons */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Knowledge Source Manager</h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload documents or index the AIET website to power the AI chatbox.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/15 transition-all focus:outline-none shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
            </svg>
            Upload Document
          </button>
        </div>

        {/* AIET Website Indexer Card */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Globe icon */}
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Index AIET Website</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Crawl <span className="text-emerald-400 font-medium">https://new.aiet.org.in/</span> and embed all pages into the AI knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={handleIndexWebsite}
            disabled={indexing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/40 disabled:text-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/15 transition-all focus:outline-none shrink-0"
          >
            {indexing ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Crawling & Indexing…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Index Website Now
              </>
            )}
          </button>
        </div>

        {indexing && (
          <div className="text-xs text-slate-500 flex items-center gap-2 px-1">
            <svg className="w-3.5 h-3.5 animate-spin text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Crawling up to 80 pages from the AIET website — this may take 1–2 minutes…
          </div>
        )}
      </div>

      {/* Document List */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Uploaded Documents</h2>
        {loading ? (
          <div className="py-32 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="py-32 text-center text-rose-400 text-xs">{error}</div>
        ) : documents.length === 0 ? (
          <div className="py-24 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-slate-900/10">
            <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-350">No documents uploaded yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Upload institutional handbooks or fee structures to ground the AI chatbox responses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={handleDeleteDocument}
                isAdmin={!!user?.is_admin}
                isDeleting={deletingId === doc.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Drag & Drop Dialog Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={fetchDocuments}
      />
    </div>
  );
};

export default DocumentUpload;

// Note: We stub direct documentService dependency by importing axiosInstance directly in components to ensure zero lint failures.
export const documentService = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};
