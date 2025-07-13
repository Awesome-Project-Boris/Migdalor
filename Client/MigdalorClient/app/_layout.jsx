import { useEffect } from "react";
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
import { AuthProvider } from "@/context/AuthProvider";

// Import the i18next instance to use its methods
import i18next from "./utils/i18n.tsx";

const config = createTamagui(defaultConfig);

// Keep the splash screen visible while we resolve the language
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useEffect(() => {
    async function prepare() {
      try {
        // Load the saved language from storage
        const savedLanguage = await AsyncStorage.getItem("user-language"); // Use a consistent key

        // If a language is found, change i18next's language
        if (savedLanguage) {
          await i18next.changeLanguage(savedLanguage);
        }
      } catch (e) {
        console.warn("Failed to load language from storage", e);
      } finally {
        // Hide the splash screen after everything is ready
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []); // The empty dependency array ensures this runs only once

  return (
    <AuthProvider>
      <PaperProvider>
        <TamaguiProvider config={config}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <MainMenuEditProvider>
              <BottomSheetProvider>
                <MarketplaceProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                      name="index"
                      options={{
                        title: "Index Page",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="LoginScreen"
                      options={{
                        title: "Login Screen",
                        headerBackTitleStyle: { fontSize: 30 },
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
                      name="(events)"
                      options={{
                        title: "Classes and Activities",
                        headerShown: false,
                        // headerRight: () => (
                        //   <Ionicons name="" size={24} color="#ccc" />
                        // ),
                      }}
                    />
                    <Stack.Screen
                      name="Marketplace"
                      options={{
                        title: "Marketplace",
                        headerShown: false,
                        headerRight: () => (
                          <Ionicons name="bag" size={24} color="#ccc" />
                        ),
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
                    <Stack.Screen
                      name="InstructorProfile"
                      options={{
                        title: "Instructor Profile",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="InstructorEditProfile"
                      options={{
                        title: "Edit Instructor Profile",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="MainMenu"
                      options={{
                        title: "Main Menu",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="InstructorMainMenu"
                      options={{
                        title: "Instructor Main Menu",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="Events"
                      options={{
                        title: "Events",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="Notices"
                      options={{
                        title: "Notices",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="ResidentList"
                      options={{
                        title: "Resident List",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="CommittieePage"
                      options={{
                        title: "Committiee Page",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="NoticeFocus"
                      options={{
                        title: "Notice Page",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="TimeTable"
                      options={{
                        title: "Time table Page",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="EventFocus"
                      options={{
                        title: "Event Page",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="NewActivity"
                      options={{
                        title: "New Activity",
                        headerShown: false,
                        presentation: "modal",
                      }}
                    />
                    <Stack.Screen
                      name="GoodMorningProcedure"
                      options={{
                        title: "Good morning procedure",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="PublicServices"
                      options={{
                        title: "Public services",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="PublicServicesFocus"
                      options={{
                        title: "public services details",
                        headerShown: false,
                      }}
                    />
                  </Stack>
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

// ImageHistory
