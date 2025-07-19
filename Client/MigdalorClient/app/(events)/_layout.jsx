import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
// If you're using translations, you can import it here
// import { useTranslation } from "react-i18next";

export default function EventsTabLayout() {
  const { t } = useTranslation();


  return (
    <Tabs
      screenOptions={{
        // You can customize these styles to match your app's theme
        tabBarStyle: { height: 70 },
        tabBarIconStyle: { marginTop: 5 }, // Adjust as needed
        tabBarLabelStyle: { fontSize: 12, marginBottom: 5 }, // Adjust as needed
        tabBarActiveTintColor: "#00b5d9", // Example color
        tabBarInactiveTintColor: "black",
        headerShown: false, // Hides the header for the tab screens
      }}
    >
      <Tabs.Screen
        name="Classes"
        options={{
          // title: t("Events_ClassesTab"), // Example with translation
          title: t("Classes"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Activities"
        options={{
          // title: t("Events_ActivitiesTab"), // Example with translation
          title: t("Activities"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="star" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
