import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
<<<<<<< HEAD
// If you're using translations, you can import it here
// import { useTranslation } from "react-i18next";

export default function EventsTabLayout() {
  const { t } = useTranslation();

=======

export default function EventsTabLayout() {
  const { t } = useTranslation();
>>>>>>> RoisMainBranch

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 70 },
        tabBarIconStyle: { marginTop: 5 },
        tabBarLabelStyle: { fontSize: 20, marginBottom: 5 },
        tabBarActiveTintColor: "#00b5d9",
        tabBarInactiveTintColor: "black",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Classes"
        options={{
<<<<<<< HEAD
          // title: t("Events_ClassesTab"), // Example with translation
          title: t("Classes"),
=======
          title: t("Events_ClassesTab"), // Added translation with a fallback
>>>>>>> RoisMainBranch
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Activities"
        options={{
<<<<<<< HEAD
          // title: t("Events_ActivitiesTab"), // Example with translation
          title: t("Activities"),
=======
          title: t("Events_ActivitiesTab"), // Added translation with a fallback
>>>>>>> RoisMainBranch
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="star" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
