// Why this context file exists:
// This is the global React Context for Authentication.
// It manages the logged-in student/admin state, coordinates JWT persistence (via localStorage),
// validates tokens on initial app boot via the /auth/me endpoint, and exposes login/logout/register actions.

import React, { createContext, useState, useEffect, ReactNode } from "react";
import axiosInstance from "../services/api";

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and validate session on boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Configure request headers
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          
          // Verify JWT validation via backend me endpoint
          const response = await axiosInstance.get("/auth/me");
          
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          // Token expired or invalid
          console.error("Authentication check failed. Clearing token.", error);
          localStorage.removeItem("token");
          delete axiosInstance.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem("token", jwtToken);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
