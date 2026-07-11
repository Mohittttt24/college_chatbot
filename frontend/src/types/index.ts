// Why this file exists:
// It centralizes TypeScript type and interface declarations used across 
// layouts, contexts, and pages.

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface DocumentInfo {
  id: number;
  filename: string;
  file_url: string;
  uploaded_at: string;
  user_id: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  created_at?: string;
}

export interface Source {
  filename: string;
  text: string;
  score: number;
  document_id?: number;
}

export interface Message {
  sender: "user" | "ai";
  text: string;
  sources?: Source[];
}
