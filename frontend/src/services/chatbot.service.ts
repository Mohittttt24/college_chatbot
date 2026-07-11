// Why this service exists:
// This service modularizes general conversational chatbot interactions,
// specifically sending chat inputs to the /chat endpoint and loading thread histories.

import axiosInstance from "./api";

export const chatbotService = {
  /**
   * Sends a message to the general chatbot API.
   * Inputs:
   *   message (str): User message.
   *   sessionId (str): Active conversational thread reference.
   */
  sendMessage: async (message: string, sessionId: string) => {
    const response = await axiosInstance.post("/chat", {
      message,
      session_id: sessionId,
    });
    return response.data;
  },

  /**
   * Retrieves past conversational thread logs for the current session.
   */
  getHistory: async (sessionId: string) => {
    const response = await axiosInstance.get("/chat/history", {
      params: {
        session_id: sessionId,
      },
    });
    return response.data;
  },
};

export default chatbotService;
