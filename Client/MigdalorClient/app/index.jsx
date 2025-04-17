import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthProvider";

export default function Index() {
  const { user } = useAuth();

  if (user === null) {
    return <Redirect href="/LoginScreen" />;
  }

  if (user) {
    return <Redirect href="/MainMenu" />;
  }
}