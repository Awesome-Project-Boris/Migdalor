import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
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
          <Drawer>
            <Drawer.Screen
              name="index" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: "Home",
                // headerShown: false,
                title: "overview",
              }}
            />
            <Drawer.Screen
              name="user/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: "User",
                title: "overview",
              }}
            />
            <Drawer.Screen
              name="LoginScreen"
              options={{
                drawerLabel: "Profile",
                drawerIcon: ({ focused, size }) => (
                  <Ionicons
                    name="person"
                    size={64}
                    color={focused ? "#7cc" : "#ccc"}
                  />
                ),
              }}
            />
            <Drawer.Screen
              name="MainMenu"
              options={{
                drawerLabel: "Main Menu",
                drawerIcon: ({ focused, size }) => (
                  <Ionicons
                    name="person"
                    size={64}
                    color={focused ? "#7cc" : "#ccc"}
                  />
                ),
              }}
            />
          </Drawer>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </PaperProvider>
  );
}
