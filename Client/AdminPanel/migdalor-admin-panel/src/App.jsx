import React, { useContext, useEffect } from "react";
import AuthProvider from "./components/Auth/AuthProvider";
import AuthContext from "./components/Auth/AuthContext";
import LoadingScreen from "./components/Screens/LoadingScreen";
import LoginScreen from "./components/Screens/LoginScreen";
import AdminLayout from "./components/Layout/AdminLayout";

function App() {
  const { isAdmin, isLoading } = useContext(AuthContext);

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
