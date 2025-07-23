import React, { useCallback } from "react";
import { Tabs, useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

export default function EventsTabLayout() {
  const { t } = useTranslation();

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
          title: t("Events_ClassesTab"), // Added translation with a fallback
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Activities"
        options={{
          title: t("Events_ActivitiesTab"), // Added translation with a fallback
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="star" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
