import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { TamaguiProvider, createTamagui } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import ToastManager from "toastify-react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { defaultConfig } from "@tamagui/config/v4";
import { useTranslation, I18nextProvider } from "react-i18next"; // Import the provider

// --- All Provider Imports ---
import { AuthProvider } from "@/context/AuthProvider";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { BottomSheetProvider } from "@/components/BottomSheetMain";
import { MainMenuEditProvider } from "@/context/MainMenuEditProvider";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { toastConfig } from "@/components/CustomToasts";

// --- i18n Initialization ---
// Import both the instance and the initialization function
import i18next, { initializeI18n } from "@/app/utils/i18n";
import { Globals } from "@/app/constants/Globals";

const config = createTamagui(defaultConfig);

SplashScreen.preventAutoHideAsync();

/**
 * A component to apply language settings once they are loaded.
 */
function LanguageManager() {
  const { settings } = useSettings();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
      Globals.userSelectedLanguage = settings.language;
      Globals.userSelectedDirection =
        settings.language === "he" ? "rtl" : "ltr";
    }
  }, [settings.language, i18n]);

  return null;
}

/**
 * This component contains the app's navigation and logic.
 */
function AppContent() {
  const router = useRouter();
  const { isLoading: areSettingsLoading } = useSettings();

  useEffect(() => {
    if (!areSettingsLoading) {
      SplashScreen.hideAsync();
    }
  }, [areSettingsLoading]);

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

  if (areSettingsLoading) {
    return null;
  }

  return (
    <MainMenuEditProvider>
      <BottomSheetProvider>
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
          <Stack.Screen
            name="MyActivities"
            options={{
              title: "User created activities",
              headerShown: false,
            }}
          />
        </Stack>
      </BottomSheetProvider>
    </MainMenuEditProvider>
  );
}

/**
 * This is the main export component. It handles initialization and provider setup.
 */
export default function Layout() {
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeI18n();
      } catch (e) {
        console.warn("Error initializing i18n:", e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  if (!isAppReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18next}>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <LanguageManager />
                <AppContent />
              </NotificationsProvider>
              <ToastManager config={toastConfig} zIndex={9999} />
            </SettingsProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </I18nextProvider>
  );
}
