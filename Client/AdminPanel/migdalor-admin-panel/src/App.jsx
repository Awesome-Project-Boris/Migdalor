import React, { useContext, useEffect } from "react";
import { useState } from "react";
import AuthProvider from "./components/Auth/AuthProvider";
import AuthContext from "./components/Auth/AuthContext";
import LoadingScreen from "./components/Screens/LoadingScreen";
import LoginScreen from "./components/Screens/LoginScreen";
import AdminLayout from "./components/Layout/AdminLayout";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const { isAdmin, isLoading } = useContext(AuthContext);
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.classList.add("font-he");
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <LoginScreen />;
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <AdminLayout />
    </>
  );
}

export default function MigdalorAdminPanel() {
  return (
    <>
      <style>{`
        body.font-he {
          font-family: Calibri, sans-serif;
        }
      `}</style>
      <AuthProvider>
        <App />
      </AuthProvider>
    </>
  );
}
