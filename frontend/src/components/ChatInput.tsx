// Why this component exists:
// This component provides the text input and submission field for the chatbot page.
// It handles input binding, disabled states (e.g. while waiting for AI replies), 
// and triggers submit events on button clicks or 'Enter' keypresses (while Shift+Enter allows newlines).

import React, { useState, KeyboardEvent, ChangeEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: str) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.strip && text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If the user presses "Enter" without the "Shift" key, submit the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 shadow-lg shadow-black/10 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
      <div className="flex items-end gap-3">
        {/* Text Area Input */}
        <textarea
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "AI is typing..." : "Type your question here (e.g., What are the hostel fees?)..."}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent border-0 outline-none text-slate-100 text-sm max-h-32 py-2 px-3 placeholder-slate-500 disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
            isLoading || !text.trim()
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95"
          }`}
        >
          {isLoading ? (
            // Spinner SVG
            <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            // Send Arrow SVG
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
