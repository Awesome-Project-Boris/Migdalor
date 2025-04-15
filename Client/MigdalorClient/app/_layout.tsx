import { useRef, useEffect, useState } from 'react'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { usePathname, useRouter } from 'expo-router';
import { TamaguiProvider, createTamagui, YStack } from 'tamagui';
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { defaultConfig } from "@tamagui/config/v4";
import ToastManager from 'toastify-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomSheetProvider } from "../components/BottomSheetMain";
import { MainMenuEditProvider } from '@/context/MainMenuEditProvider';
import 'i18next';
import { MarketplaceProvider } from '@/context/MarketplaceProvider';
import { toastConfig } from '@/components/CustomToasts';
import * as SplashScreen from 'expo-splash-screen';

const config = createTamagui(defaultConfig);

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    const checkLoginStatus = async () => {
      try {
        const userID = await AsyncStorage.getItem('userID');
        if (!userID && pathname !== '/LoginScreen') {
          router.replace('/LoginScreen');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        router.replace('/LoginScreen');
      } finally {
        setAppIsReady(true);
      }
    };
    checkLoginStatus();
  }, [router]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MainMenuEditProvider>
            <BottomSheetProvider>
              <MarketplaceProvider>
                <Stack>
                  <Stack.Screen
                    name="index"
                    options={{
                    title: "Index Page", headerShown: false 
              }}
            />
            <Stack.Screen
              name="LoginScreen"
              options={{
                title: "Login Screen",
                headerBackTitleStyle: { fontSize: 30 },
                headerShown: false
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
                headerRight: () => (
                  <Ionicons name="bag" size={24} color="#ccc" />
                ),
              }}
            />
            <Stack.Screen
              name="MarketplaceNewItem"
              options={{
                title: "Marketplace New Item",
                headerShown: false
              }}
            />
            <Stack.Screen
              name="MarketplaceItem"
              options={{
                title: "Marketplace Item",
                headerShown: false
              }}
            />
            <Stack.Screen
              name="ImageViewScreen"
              options={{
                title: "Image View Screen",
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="Map"
              options={{
                title: "Site Map",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Notices"
              options={{
                title: "Notice Board",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="NoticeFocus"
              options={{
                title: "Single Notice",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ResidentList"
              options={{
                title: "List Of Residents",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CommittieePage"
              options={{
                title: "Committiee Members",
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
            </MarketplaceProvider>
          </BottomSheetProvider>
        </MainMenuEditProvider>
        <ToastManager config={toastConfig}/>
      </GestureHandlerRootView>
      </TamaguiProvider>
    </PaperProvider>
  );
}
// ResidentList