import { useRef } from 'react'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { createTamagui, TamaguiProvider } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { defaultConfig } from "@tamagui/config/v4";
import Header from "../components/Header";

const config = createTamagui(defaultConfig);
export default function Layout() {

  const bottomSheetRef = useRef<any>(null);

  const openSheet = () => {
    bottomSheetRef.current?.openSheet();
  };

 /*/ 
     To summon our header - add this within Stack.screen

       header: () => <Header onOpenSheet={openSheet} /> 
       
 /*/

  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* <Stack  screenOptions={{ headerShown: false }}> */}
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
              name="MainMenwu" // VACANT
              options={{
                title: "Main Menu",
                headerRight: () => (
                  <Ionicons name="person" size={24} color="#ccc" />
                ),
              }}
            />
            <Stack.Screen
              name="MainMenu" // VACANT
              options={{
                title: "Main Menu",
                headerShown: false,
                headerRight: () => (
                  <Ionicons name="settings" size={24} color="#ccc" />
                ),
              }}
            />
            <Stack.Screen
              name="(settings)"
              options={{
                title: "Settings",
                headerShown: true,
                headerRight: () => (
                  <Ionicons name="settings" size={24} color="#ccc" />
                ),
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </PaperProvider>
  );
}
