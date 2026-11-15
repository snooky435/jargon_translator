import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Alex's Flask backend runs on port 5001 (see app.py).
const BACKEND_URL = "http://localhost:5001";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The "proxy" fixes CORS without touching Alex's code:
    // when the browser asks OUR dev server for one of these addresses,
    // Vite quietly forwards the request to the backend. The browser only
    // ever talks to one address, so it never blocks anything.
    proxy: {
      "/api": BACKEND_URL, // translate + Gmail data
      "/login": BACKEND_URL, // Google sign-in (start)
      "/oauth2callback": BACKEND_URL, // Google sign-in (Google sends the user back here)
      "/logout": BACKEND_URL, // Google sign-out
    },
    // Let the front end read files from the repo folder above it,
    // so we can use Alex's phrases.json directly instead of a copy.
    fs: {
      allow: [".."],
    },
  },
});
