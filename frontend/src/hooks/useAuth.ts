// Why this hook exists:
// This is a custom React hook that provides a clean interface to access AuthContext.
// It includes safety checks to ensure components do not attempt to read auth state
// if they are not correctly wrapped inside the AuthProvider tree.

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider. Wrap your root component in <AuthProvider>.");
  }
  
  return context;
};

export default useAuth;
