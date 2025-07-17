import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router"; // useRouter is now needed here
import { PaperProvider } from "react-native-paper";
import { TamaguiProvider, createTamagui } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import ToastManager from "toastify-react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications"; // This import from your teammate is preserved
import { defaultConfig } from "@tamagui/config/v4";

// --- All Provider Imports ---
import { AuthProvider } from "@/context/AuthProvider";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { BottomSheetProvider } from "@/components/BottomSheetMain";
import { MainMenuEditProvider } from "@/context/MainMenuEditProvider";
import { MarketplaceProvider } from "@/context/MarketplaceProvider";
import { toastConfig } from "@/components/CustomToasts";

const config = createTamagui(defaultConfig);

// Keep the splash screen visible. Our RootLayout will hide it.
SplashScreen.preventAutoHideAsync();

/**
 * This is the inner layout component. It's wrapped by all the necessary providers,
 * so it can safely use hooks like useRouter and useSettings.
 */
function RootLayout() {
  const router = useRouter(); // Initialize the router here to use for notifications
  const { isLoading } = useSettings(); // Get loading state from our context

  // This hook correctly manages the splash screen, hiding it only when
  // our settings have been loaded from storage.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // --- THIS IS YOUR TEAMMATE'S MERGED NOTIFICATION LOGIC ---
  // This hook sets up a listener for when a user taps on a notification.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        // For debugging: console.log("Notification tapped, data:", data);

        // If the notification data contains a noticeId, navigate the user
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

    // This function cleans up the listener when the app closes or the component unmounts.
    return () => subscription.remove();
  }, [router]); // The hook depends on the router to perform navigation.

  // While settings are loading from storage, we render nothing to prevent a flicker of unstyled content.
  if (isLoading) {
    return null;
  }

  // Once loading is complete, render the entire application with all your screens.
  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MainMenuEditProvider>
            <BottomSheetProvider>
              <MarketplaceProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  {/* --- YOUR ENTIRE NAVIGATION STACK IS PRESERVED --- */}
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
 * This is the main export component. Its only job is to set up the top-level providers,
 * ensuring that all components within RootLayout have access to them.
 */
export default function Layout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RootLayout />
      </SettingsProvider>
    </AuthProvider>
  );
}
