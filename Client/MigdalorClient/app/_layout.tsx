import { useRef } from 'react'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { TamaguiProvider, createTamagui, YStack } from 'tamagui';
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { defaultConfig } from "@tamagui/config/v4";
import  ToastManager  from 'toastify-react-native'
import { BottomSheetProvider } from "../components/BottomSheetMain";
import { MainMenuEditProvider } from '@/context/MainMenuEditProvider';
import 'i18next';
import { MarketplaceProvider } from '@/context/MarketplaceProvider';
import { CustomSuccessToast, CustomErrorToast, toastConfig } from '@/components/CustomToasts';

const config = createTamagui(defaultConfig);



export default function Layout() {

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
                title: "Marketplace new item",
                headerShown: false
              }}
            />
            <Stack.Screen
              name="MarketplaceItem"
              options={{
                title: "Marketplace item",
                headerShown: false
              }}
            />
            <Stack.Screen
              name="ImageViewScreen"
              options={{
                title: "Image view screen",
                headerShown: false,
                presentation: 'modal'
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
