import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";

import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { YStack } from "tamagui";

// --- Our new imports ---
import { useSettings } from "@/context/SettingsContext.jsx";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NOTIFICATION_SETTING_KEY = "user_notification_setting";

export default function NotificationSettingsPage() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  // Get settings and update function from our context
  const { settings, updateSetting } = useSettings();

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
          <StyledText
            style={{ fontSize: 40, fontWeight: "800" }}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("NotificationSettingsPage_header")}
          </StyledText>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={styles.button}
              bgColor={
                settings.notificationSetting === value ? "#00007a" : "#ffffff"
              }
              textColor={
                settings.notificationSetting === value ? "#ffffff" : "#0b0908"
              }
              onPress={() => updateSetting("notificationSetting", value)}
            >
              <StyledText style={styles.buttonText}>{label}</StyledText>
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
