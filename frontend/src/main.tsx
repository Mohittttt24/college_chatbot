// Why this file exists:
// This is the core entry point of the React-Vite frontend application.
// It loads the App component and mounts it to the root DOM node, bringing in Tailwind styles.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
