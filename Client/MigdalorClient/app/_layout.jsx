import { useEffect, useState, useLayoutEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { PaperProvider } from "react-native-paper";
import { TamaguiProvider, createTamagui } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToastManager from "toastify-react-native";
import * as SplashScreen from "expo-splash-screen";
import { defaultConfig } from "@tamagui/config/v4";
import { BottomSheetProvider } from "../components/BottomSheetMain";
import { MainMenuEditProvider } from "@/context/MainMenuEditProvider";
import { MarketplaceProvider } from "@/context/MarketplaceProvider";
import { toastConfig } from "@/components/CustomToasts";
import { Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthProvider";

const config = createTamagui(defaultConfig);

// Navigation stack for authenticated users
function MainNavigatorStack() {
  console.log("MainNavigatorStack rendered");
  return (
    <Stack initialRouteName="MainMenu">
      <Stack.Screen
        name="MainMenu"
        options={{
          title: "Index Page",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(settings)"
        options={{
          title: "Settings",
          headerShown: false,
          headerRight: () => (
            <Ionicons name="settings" size={24} color="#ccc" />
          ),
        }}
      />
      <Stack.Screen
        name="Marketplace"
        options={{
          title: "Marketplace",
          headerShown: false,
          headerRight: () => <Ionicons name="bag" size={24} color="#ccc" />,
        }}
      />
      <Stack.Screen
        name="MarketplaceNewItem"
        options={{
          title: "Marketplace new item",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MarketplaceItem"
        options={{
          title: "Marketplace item",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ImageViewScreen"
        options={{
          title: "Image view screen",
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Map"
        options={{
          title: "Site map",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// Navigation stack for unauthenticated users (login only)
function AuthNavigatorStack() {
  console.log("AuthNavigatorStack rendered");
  return <Stack initialRouteName="LoginScreen"></Stack>;
}

export default function Layout() {
  const [userID, setUserID] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);

  // Keep splash screen visible until auth check is finished
  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const uID = await AsyncStorage.getItem("userID");
        console.log("User ID from AsyncStorage:", uID);
        setUserID(uID);
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    checkLoginStatus();
  }, []);

  if (!appIsReady) {
    console.log("App is not ready yet");
    return null; // or a loading indicator
  }

  return (
    <AuthProvider>
      <PaperProvider>
        <TamaguiProvider config={config}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <MainMenuEditProvider>
              <BottomSheetProvider>
                <MarketplaceProvider>
                  {userID ? <MainNavigatorStack /> : <AuthNavigatorStack />}
                </MarketplaceProvider>
              </BottomSheetProvider>
            </MainMenuEditProvider>
            <ToastManager config={toastConfig} />
          </GestureHandlerRootView>
        </TamaguiProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
