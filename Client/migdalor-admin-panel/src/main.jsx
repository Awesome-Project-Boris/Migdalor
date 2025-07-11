
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./styles/global.css"; // Import global styles

// Get the root element from the DOM.
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

// Render the application.
// The AuthProvider wraps the entire App, making authentication state
// available to all components.
root.render(
  <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
  </React.StrictMode>
);
