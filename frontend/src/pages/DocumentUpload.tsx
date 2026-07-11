// Why this page exists:
// This is the Document Upload manager page visible only to Administrators.
// It queries the backend GET /documents endpoint to list all knowledge source files,
// renders them using DocumentCard components, handles document deletion triggers,
// and opens the UploadModal to drag-and-drop new files.

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
    if (window.confirm("Are you sure you want to delete this document? Doing so will remove all vectorized knowledge from the Qdrant indexing.")) {
      try {
        await axiosInstance.delete(`/documents/${id}`);
        // Filter out deleted document locally
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete the document.");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header section with Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Knowledge Source Documents</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic PDFs or Word rules uploaded as RAG knowledge anchors.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/15 transition-all focus:outline-none shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
          </svg>
          Upload New Document
        </button>
      </div>

      {/* Main Grid View */}
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
          <h4 className="text-sm font-semibold text-slate-350">No documents found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Upload institutional handbooks or fee structures to ground the AI Chatbot responses.
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
            />
          ))}
        </div>
      )}

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
    return axiosInstance.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};
