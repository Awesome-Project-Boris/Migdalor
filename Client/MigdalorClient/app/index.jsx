import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    if (user !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [user]);

  if (user === undefined) {
    return null;
  }

  return user === null ? (
    <Redirect href="/LoginScreen" />
  ) : (
    <Redirect href="/MainMenu" />
  );
}
