import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router/stack";
import { createTamagui, TamaguiProvider } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { defaultConfig } from "@tamagui/config/v4";

const config = createTamagui(defaultConfig);
export default function Layout() {
  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "Index Page",
              }}
            />
            <Stack.Screen
              name="LoginScreen"
              options={{
                title: "Login Screen",
                headerShown: false,
                headerRight: () => (
                  <Ionicons name="person" size={24} color="#ccc" />
                ),
              }}
            />
            <Stack.Screen
              name="MainMenu" // VACANT
              options={{
                title: "Main Menu",
                headerRight: () => (
                  <Ionicons name="person" size={24} color="#ccc" />
                ),
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </PaperProvider>
  );
}
