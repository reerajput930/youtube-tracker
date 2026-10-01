import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/theme.css";
import "./styles/layout.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
