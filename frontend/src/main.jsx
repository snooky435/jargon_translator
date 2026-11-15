// Entry point: this file starts the React app.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter lets us have pages like /dictionary and /about */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
