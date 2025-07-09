// /src/App.jsx

import React, { useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import LoginScreen from "./pages/LoginScreen";
import LoadingScreen from "./components/common/LoadingScreen";

/**
 * The main application component.
 * It acts as a router, displaying the appropriate screen based on
 * the user's authentication status.
 */
function App() {
  const { isAdmin, isLoading } = useAuth();

  // Set document language and direction for RTL support.
  // This effect runs once when the component mounts.
  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.classList.add("font-he");
  }, []);

  // Display a loading screen while authentication status is being checked.
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render the AdminLayout if the user is an admin, otherwise show the LoginScreen.
  return isAdmin ? <AdminLayout /> : <LoginScreen />;
}

export default App;
