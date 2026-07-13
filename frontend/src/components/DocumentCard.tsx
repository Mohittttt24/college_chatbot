// Why this component exists:
// This component displays a single document's metadata inside the Document Upload interface.
// It renders an icon representing the document type (PDF/Word), showcases upload dates,
// provides download links, and displays a delete button for administrative users.
// NOTE: Uses inline confirmation UI instead of window.confirm() to avoid browser dialog blocking.

import React, { useState } from "react";

export interface DocumentInfo {
  id: number;
  filename: string;
  file_url: string;
  uploaded_at: string;
  user_id: number;
}

interface DocumentCardProps {
  doc: DocumentInfo;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  isDeleting?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onDelete, isAdmin, isDeleting }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Format the date into a friendly local string
  const formattedDate = new Date(doc.uploaded_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Extract file extension
  const ext = doc.filename.split(".").pop()?.toLowerCase() || "";

  return (
    <div className={`border rounded-2xl p-4 transition-all duration-200 shadow-sm shadow-black/5 ${
      confirmDelete
        ? "bg-rose-950/20 border-rose-500/30"
        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Document Type Icon */}
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
            ext === "pdf"
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/10"
              : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
          }`}>
            {ext === "pdf" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            )}
          </div>

          {/* Document Meta Text */}
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-200 truncate pr-2" title={doc.filename}>
              {doc.filename}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Uploaded: {formattedDate}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!confirmDelete && (
            /* Download File Button */
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all duration-150"
              title="Download Document"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          )}

          {/* Delete — shows inline confirm instead of window.confirm */}
          {isAdmin && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-rose-400 font-semibold">Confirm?</span>
                <button
                  onClick={() => { onDelete(doc.id); setConfirmDelete(false); }}
                  disabled={isDeleting}
                  className="h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all focus:outline-none disabled:opacity-50"
                >
                  {isDeleting ? "…" : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all focus:outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isDeleting}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all duration-150 focus:outline-none disabled:opacity-50"
                title="Delete Document"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
