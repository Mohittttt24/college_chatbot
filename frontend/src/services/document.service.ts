// Why this service exists:
// This service modularizes all API requests related to document management (upload, retrieve, delete)
// for RAG embedding knowledge indexing.

import axiosInstance from "./api";

export const documentService = {
  /**
   * Uploads a raw document (PDF, Word, image) to the backend.
   */
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Retrieves all document records from the database.
   */
  getDocuments: async () => {
    const response = await axiosInstance.get("/documents");
    return response.data;
  },

  /**
   * Deletes a document by ID.
   */
  deleteDocument: async (id: number) => {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return response.data;
  },
};

export default documentService;
