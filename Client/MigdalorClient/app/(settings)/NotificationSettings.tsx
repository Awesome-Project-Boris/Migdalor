import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { YStack } from "tamagui";

// --- Custom Component and Context Imports ---
import { useSettings } from "@/context/SettingsContext.jsx";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();

  // --- This is the two-button configuration from your teammate ---
  const options: { label: string; value: string }[] = [
    { label: t("NotificationSettingsPage_normal"), value: "both" },
    { label: t("NotificationSettingsPage_silent"), value: "none" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <YStack width="100%" alignItems="center" gap="$5">
          <StyledText
            style={styles.headerText}
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 160,
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 50,
  },
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
