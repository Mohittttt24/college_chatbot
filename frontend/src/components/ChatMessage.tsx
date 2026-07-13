// Why this component exists:
// This component displays a single message inside the chatbot conversation thread.
// It formats user messages and AI replies differently, displaying custom SVG avatars, 
// and rendering cited document sources (RAG results) under the AI answer for transparency.

import React from "react";

export interface Source {
  filename: string;
  text: string;
  score: number;
  document_id?: number;
}

export interface ChatMessageProps {
  sender: "user" | "ai";
  text: string;
  sources?: Source[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text, sources }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex w-full gap-4 p-4 ${isUser ? "justify-end" : "justify-start bg-slate-900/40 border-y border-slate-800/50"}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${
          isUser 
            ? "bg-gradient-to-tr from-indigo-600 to-violet-500 border-indigo-500 text-white" 
            : "bg-slate-800 border-slate-700 text-indigo-400"
        }`}>
          {isUser ? (
            // Student Icon (User SVG)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          ) : (
            // AI Assistant Icon (Robot SVG)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            {isUser ? "You" : "AI Assistant"}
          </span>

          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser 
              ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10" 
              : "bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none"
          }`}>
            <p className="whitespace-pre-wrap">{text}</p>
          </div>

          {/* Source attribution — shows filename only, clean and minimal */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-1 px-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>Source: <span className="text-indigo-400 font-medium">{sources[0].filename}</span></span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
