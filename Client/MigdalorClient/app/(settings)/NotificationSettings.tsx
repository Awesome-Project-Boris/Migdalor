import React, { useState, useEffect } from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import { Globals } from "@/app/constants/Globals";
import FlipButton from "../../components/FlipButton";
import { Slider, XStack, YStack, Text, styled } from "tamagui";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { Divider } from "react-native-paper";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
  const [notificationsSetting, setNotificationsSetting] = useState(
    Globals.userNotificationsSetting
  );

  useEffect(() => {
    Globals.userNotificationsSetting = notificationsSetting;
  }, [notificationsSetting]);

  const options: { label: string; value: string }[] = [
    { label: t("NotificationSettingsPage_both"), value: "both" },
    { label: t("NotificationSettingsPage_sound"), value: "sound" },
    { label: t("NotificationSettingsPage_vibrate"), value: "vibration" },
    { label: t("NotificationSettingsPage_silent"), value: "none" },
  ];

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
          <Text
            fontSize={40}
            fontWeight={800}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
          >
            {t("NotificationSettingsPage_header")}
          </Text>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={styles.button}
              bgColor={notificationsSetting === value ? "#00007a" : "#ffffff"}
              textColor={notificationsSetting === value ? "#ffffff" : "#0b0908"}
              onPress={() => setNotificationsSetting(value)}
            >
              <Text style={styles.buttonText}>{label}</Text>
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
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});
