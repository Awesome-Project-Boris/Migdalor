import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user } = useAuth();

  // Hide splash once auth state is known
  useEffect(() => {
    if (user !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [user]);

  // While auth state is unresolved, keep splash visible
  if (user === undefined) {
    return null;
  }

  // Redirect based on auth status
  return user === null ? (
    <Redirect href="/LoginScreen" />
  ) : (
    <Redirect href="/MainMenu" />
  );
}
