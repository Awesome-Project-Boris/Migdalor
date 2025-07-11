// app/settings/_layout.jsx

import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import FlipButton from "@/components/FlipButton";

export default function SettingsLayout() {
  const { t } = useTranslation();

  // const handleSave = () => {
  //   // TODO: persist your Globals (or dispatch a context/action) here
  //   console.log("Saving settings…");
  // };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: { height: 70 },
          tabBarIconStyle: { height: 40, width: 40 },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: "#00007a",
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
              <FontAwesome size={40} name="user" color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Save button container, sitting above the tab bar */}

      {/* <View style={styles.saveContainer}>
        <FlipButton
          bgColor={styles.saveButton.backgroundColor}
          textColor={styles.saveText.color}
          style={styles.saveButton}
          flipborderwidth={3}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>
            {t("SettingsLayoutTabs_SaveChanges")}
          </Text>
        </FlipButton>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  saveContainer: {
    position: "absolute",
    bottom: 70, // match your tabBarStyle height
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  saveButton: {
    backgroundColor: "#00007a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
