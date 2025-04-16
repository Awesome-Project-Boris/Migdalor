import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user } = useAuth();

  if (user === null) {
    return <Redirect href="/LoginScreen" />;
  }

  if (user) {
    return <Redirect href="/MainMenu" />;
  }
}
