<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import FlipButton from "../../components/FlipButton";
import { YStack, Text } from "tamagui";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
=======
import React from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { YStack } from "tamagui";

// --- Our new imports ---
import { useSettings } from "@/context/SettingsContext.jsx";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText.jsx";
>>>>>>> Stashed changes

const SCREEN_WIDTH = Dimensions.get("window").width;
const NOTIFICATION_SETTING_KEY = "user_notification_setting";

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
<<<<<<< Updated upstream
  const [notificationsSetting, setNotificationsSetting] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load setting from AsyncStorage on component mount
  useEffect(() => {
    const loadSetting = async () => {
      try {
        const storedSetting = await AsyncStorage.getItem(
          NOTIFICATION_SETTING_KEY
        );
        // Default to 'both' (Normal) if no setting is stored
        const setting = storedSetting || "both";
        setNotificationsSetting(setting);
        Globals.userNotificationsSetting = setting;
      } catch (error) {
        console.error(
          "Failed to load notification setting from storage",
          error
        );
        // Fallback to default in case of error
        setNotificationsSetting("both");
        Globals.userNotificationsSetting = "both";
      } finally {
        setIsLoading(false);
      }
    };

    loadSetting();
  }, []);

  // Handle setting change and save to AsyncStorage
  const handleSettingChange = async (newValue: string) => {
    setNotificationsSetting(newValue);
    Globals.userNotificationsSetting = newValue;
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTING_KEY, newValue);
    } catch (error) {
      console.error("Failed to save notification setting to storage", error);
    }
  };
=======

  // Get settings and update function from our context
  const { settings, updateSetting } = useSettings();
>>>>>>> Stashed changes

  const options: { label: string; value: string }[] = [
    { label: t("NotificationSettingsPage_normal"), value: "both" },
    { label: t("NotificationSettingsPage_silent"), value: "none" },
  ];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 60,
          paddingBottom: 160,
          alignItems: "center",
        }}
      >
        <YStack width="100%" alignItems="center" gap="$5">
<<<<<<< Updated upstream
          <Text
            fontSize={40}
            fontWeight="800"
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
=======
          <StyledText
            style={{ fontSize: 40, fontWeight: "800" }}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
>>>>>>> Stashed changes
          >
            {t("NotificationSettingsPage_header")}
          </StyledText>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={styles.button}
<<<<<<< Updated upstream
              bgColor={notificationsSetting === value ? "#00b5d9" : "#ffffff"}
              onPress={() => handleSettingChange(value)}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      notificationsSetting === value ? "#ffffff" : "#0b0908",
                  },
                ]}
              >
                {label}
              </Text>
=======
              bgColor={
                settings.notificationSetting === value ? "#00007a" : "#ffffff"
              }
              textColor={
                settings.notificationSetting === value ? "#ffffff" : "#0b0908"
              }
              onPress={() => updateSetting("notificationSetting", value)}
            >
              <StyledText style={styles.buttonText}>{label}</StyledText>
>>>>>>> Stashed changes
            </FlipButton>
          ))}
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SCREEN_WIDTH * 0.7,
    minHeight: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});
