import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 80 },
        tabBarIconStyle: { height: 40, width: 40 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: "goldenrod",
        tabBarInactiveTintColor: "black",
      }}
    >
      <Tabs.Screen
        name="FontSettings"
        options={{
          title: t("SettingsLayoutTabs_FontSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={40} name="font" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="NotificationSettings"
        options={{
          title: t("SettingsLayoutTabs_notificationSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={40} name="bell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="LanguageSettings"
        options={{
          title: t("SettingsLayoutTabs_languageSettings"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={40} name="language" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
