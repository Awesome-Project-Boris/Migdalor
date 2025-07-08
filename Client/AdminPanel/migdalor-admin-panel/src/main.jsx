import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MigdalorAdminPanel from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MigdalorAdminPanel />
  </StrictMode>
);
