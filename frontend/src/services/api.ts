// Why this file exists:
// This is the global Axios client configuration.
// It sets up the API base URL and registers a request interceptor 
// to automatically inject the active JWT bearer token from localStorage.

import axios from "axios";

// Access backend API url. In development it points to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor injecting Bearer JWT token before sending requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired sessions
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized responses
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
