// Why this service exists:
// This service modularizes all API interactions for user authentication
// and profile retrieval, making them reusable across components.

import axiosInstance from "./api";

export const authService = {
  /**
   * Registers a new student.
   */
  register: async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/register", {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logs in a student or administrator, returning a token and user details.
   */
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await axiosInstance.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  /**
   * Fetches the current logged in user details.
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
};

export default authService;
