import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // When the loading state from the provider changes to false,
    // it means the session check is complete.
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // While the AuthProvider is checking for a token and user,
  // we show nothing, so the splash screen remains visible.
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
