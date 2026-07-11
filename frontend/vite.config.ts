// Why this file exists:
// This is the Vite configuration file. It loads the React SWC plugin
// and sets standard dev server port defaults.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Enables exposure to Docker and other hosts
  },
});
