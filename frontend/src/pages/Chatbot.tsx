// Why this page exists:
// This is the main conversational AI interface of the portal.
// It allows users to toggle between General Chat (which uses PostgreSQL memory)
// and RAG Search (which strictly queries the uploaded college knowledge documents).
// It fetches conversation histories from the database, maintains scrolling offsets,
// and presents a beautiful chat log UI.

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../services/api";
import ChatMessage, { Source } from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import LoadingSpinner from "../components/LoadingSpinner";

interface Message {
  sender: "user" | "ai";
  text: string;
  sources?: Source[];
}

export const Chatbot: React.FC = () => {

  const [mode, setMode] = useState<"general" | "rag">("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve or generate a persistent session ID for the user
  const getSessionId = (): string => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = `session_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

  const sessionId = getSessionId();

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history logs from backend database on boot
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/chat/history`, {
          params: { session_id: sessionId },
        });

        // Convert backend ChatHistory logs schema to UI Message structure
        const formattedLogs: Message[] = [];
        response.data.forEach((log: any) => {
          formattedLogs.push({ sender: "user", text: log.user_message });
          formattedLogs.push({ sender: "ai", text: log.ai_response });
        });

        if (formattedLogs.length === 0) {
          // Push initial welcome greeting
          formattedLogs.push({
            sender: "ai",
            text: "Hello! I am your College Assistant. Feel free to ask me questions regarding admissions, fees, hostel rules, or course syllabus.",
          });
        }

        setMessages(formattedLogs);
      } catch (err: any) {
        console.error("Failed to load conversation history.", err);
        setError("Could not load past chat history logs.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleSendMessage = async (text: string) => {
    // 1. Add user query message locally
    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      if (mode === "general") {
        // General chatbot with memory endpoint
        const response = await axiosInstance.post("/chat", {
          session_id: sessionId,
          message: text,
        });
        
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: response.data.response },
        ]);
      } else {
        // Grounded RAG Search Ask endpoint
        const response = await axiosInstance.post("/rag/ask", {
          question: text,
          session_id: sessionId,
        });

        // Extract sources if returned from backend
        const sources: Source[] = response.data.sources || [];

        setMessages((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: response.data.answer,
            sources: sources 
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I apologize, but I encountered an error communicating with the API. Please check your credentials and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear this conversation history?")) {
      setMessages([
        {
          sender: "ai",
          text: "Chat cleared. Ask me another question!",
        },
      ]);
      // Remove session key to initiate a new thread
      const newSid = `session_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("chat_session_id", newSid);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
      
      {/* Top Banner Control Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
        
        {/* Toggle Mode Buttons */}
        <div className="flex p-1 bg-slate-950 border border-slate-800/80 rounded-xl w-fit">
          <button
            onClick={() => setMode("general")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 focus:outline-none ${
              mode === "general"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            General Chat
          </button>
          <button
            onClick={() => setMode("rag")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 focus:outline-none ${
              mode === "rag"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            RAG Document Ask
          </button>
        </div>

        {/* Clear Conversation Option */}
        <button
          onClick={handleClearHistory}
          disabled={loading || historyLoading}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-3 py-1.5 rounded-xl transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Clear History
        </button>

      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-slate-950/20">
        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-6 text-center text-rose-400 text-xs">
            {error}
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                text={msg.text}
                sources={msg.sources}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-3 p-4 justify-start bg-slate-900/20 rounded-xl border border-slate-800/40 w-fit">
                <div className="flex space-x-1 items-center">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI is searching and writing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Submit Box Panel */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40 shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
      </div>

    </div>
  );
};

export default Chatbot;
