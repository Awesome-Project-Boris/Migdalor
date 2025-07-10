import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading, refreshToken, loadUserSession } = useAuth();

  useEffect(() => {
    // This function orchestrates the app's startup sequence
    const initializeApp = async () => {
      try {
        // First, attempt to refresh the session token
        await refreshToken();
        // After attempting a refresh, load the user's session data
        await loadUserSession();
      } catch (e) {
        console.error("Error during app initialization:", e);
        // Ensure loading is false even if there's an error, to hide splash screen
        loadUserSession();
      }
    };

    initializeApp();
  }, [refreshToken, loadUserSession]);

  useEffect(() => {
    // This effect runs when the `loading` state changes.
    // Once loading is false, the initialization is complete, so we hide the splash screen.
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // While `loading` is true, we return null, allowing the native splash screen to remain visible.
  if (loading) {
    return null;
  }

  // After loading is complete, we redirect the user based on their authentication status.
  return user ? (
    <Redirect href="/MainMenu" />
  ) : (
    <Redirect href="/LoginScreen" />
  );
}
