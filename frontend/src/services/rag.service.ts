// Why this service exists:
// This service modularizes all API interactions for RAG completions 
// and raw similarity chunk searching.

import axiosInstance from "./api";

export const ragService = {
  /**
   * Submits a question to the RAG grounding system.
   */
  ask: async (question: string, sessionId?: string) => {
    const response = await axiosInstance.post("/rag/ask", {
      question,
      session_id: sessionId,
    });
    return response.data;
  },

  /**
   * Queries similar text chunks from the vector database.
   */
  search: async (query: string, limit: number = 3) => {
    const response = await axiosInstance.post("/rag/search", {
      question: query,
      limit,
    });
    return response.data;
  },
};

export default ragService;
