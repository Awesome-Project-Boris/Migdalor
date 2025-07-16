import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { PaperProvider } from "react-native-paper";
import { TamaguiProvider, createTamagui } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import ToastManager from "toastify-react-native";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { defaultConfig } from "@tamagui/config/v4";
<<<<<<< Updated upstream
import { BottomSheetProvider } from "../components/BottomSheetMain";
=======

import { AuthProvider } from "@/context/AuthProvider";
import { SettingsProvider, useSettings } from "@/context/SettingsContext"; // Import our new Provider and Hook
import { BottomSheetProvider } from "@/components/BottomSheetMain";
>>>>>>> Stashed changes
import { MainMenuEditProvider } from "@/context/MainMenuEditProvider";
import { MarketplaceProvider } from "@/context/MarketplaceProvider";
import { toastConfig } from "@/components/CustomToasts";

const config = createTamagui(defaultConfig);

SplashScreen.preventAutoHideAsync();

<<<<<<< Updated upstream
export default function Layout() {
  const router = useRouter();
=======
/**
 * This is the new inner layout component.
 */
function RootLayout() {
  // Get the loading state from our new SettingsContext.
  const { isLoading } = useSettings();

>>>>>>> Stashed changes
  useEffect(() => {
    // When isLoading becomes false, it means our settings have been loaded from storage.
    // Now it's safe to hide the splash screen.
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]); // This effect runs whenever the `isLoading` value changes.

  // While the settings are loading, we render nothing. This prevents any part of the UI
  // from appearing before the correct theme (font size, language) is ready.
  if (isLoading) {
    return null;
  }

<<<<<<< Updated upstream
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data && data.noticeId) {
          router.push({
            pathname: "/NoticeFocus",
            params: {
              noticeId: data.noticeId,
              hebSenderName: data.hebSenderName,
              engSenderName: data.engSenderName,
            },
          });
        }
      }
    );

    return () => subscription.remove();
  }, [router]);

=======
  // Once loading is complete, render the entire application.
  // All the providers and screens below are exactly as you had them.
>>>>>>> Stashed changes
  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MainMenuEditProvider>
            <BottomSheetProvider>
              <MarketplaceProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  {/* --- Your Navigation Stack --- */}
                  <Stack.Screen
                    name="index"
                    options={{ title: "Index Page", headerShown: false }}
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
                    options={{ title: "Marketplace item", headerShown: false }}
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
                    options={{ title: "Site map", headerShown: false }}
                  />
                  <Stack.Screen
                    name="Profile"
                    options={{ title: "Profile", headerShown: false }}
                  />
                  <Stack.Screen
                    name="EditProfile"
                    options={{ title: "Edit Profile", headerShown: false }}
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
                    options={{ title: "Main Menu", headerShown: false }}
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
                    options={{ title: "Events", headerShown: false }}
                  />
                  <Stack.Screen
                    name="Notices"
                    options={{ title: "Notices", headerShown: false }}
                  />
                  <Stack.Screen
                    name="ResidentList"
                    options={{ title: "Resident List", headerShown: false }}
                  />
                  <Stack.Screen
                    name="CommittieePage"
                    options={{ title: "Committiee Page", headerShown: false }}
                  />
                  <Stack.Screen
                    name="NoticeFocus"
                    options={{ title: "Notice Page", headerShown: false }}
                  />
                  <Stack.Screen
                    name="TimeTable"
                    options={{ title: "Time table Page", headerShown: false }}
                  />
                  <Stack.Screen
                    name="EventFocus"
                    options={{ title: "Event Page", headerShown: false }}
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
                    options={{ title: "Public services", headerShown: false }}
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
  );
}

/**
 * This is the main export component. Its only job is to set up the top-level providers.
 */
export default function Layout() {
  // The old useEffect for loading the language has been removed from here.

  return (
    <AuthProvider>
      <SettingsProvider>
        <RootLayout />
      </SettingsProvider>
    </AuthProvider>
  );
}
