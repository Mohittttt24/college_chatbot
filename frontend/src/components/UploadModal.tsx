// Why this component exists:
// This component displays a modal dialog with a drag-and-drop file upload zone.
// It performs client-side size (10MB limit) and extension validations (PDF, DOCX, PNG, JPG)
// matching the backend rules, and manages upload progress and server response handling.

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { documentService } from "../services/document.service";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Maximum file size of 10MB (aligned with backend validation)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ["pdf", "docx", "png", "jpg", "jpeg"];

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ").toUpperCase()} files are allowed.`);
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return false;
    }

    return true;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await documentService.uploadDocument(file);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-100">
            Upload Document for RAG
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-500 hover:text-slate-400 p-1 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Container Body */}
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Upload Successful!</h4>
            <p className="text-xs text-slate-500 mt-1">Grounded knowledge index is being updated...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/5"
                  : file
                  ? "border-slate-700 bg-slate-850/40"
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-850/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                className="hidden"
              />

              <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-400 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-semibold text-slate-200 truncate max-w-[250px] mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-300">
                    Drag and drop file here, or <span className="text-indigo-400 hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Supports PDF, DOCX, PNG, JPG (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/15 transition-all focus:outline-none disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? "Uploading..." : "Upload Document"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
