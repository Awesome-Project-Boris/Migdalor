import React from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import Header from "@/components/Header";
import { Divider } from "react-native-paper";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { YStack } from "tamagui";

// --- Our new imports ---
import { useSettings } from "@/context/SettingsContext.jsx"; // Note the .jsx extension
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText.jsx"; // Use StyledText

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function LanguageSettingsPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();

  // Get settings and update function from our context
  const { settings, updateSetting } = useSettings();

  const options: { label: string; value: string }[] = [
    { label: t("LanguageSettingsPage_he"), value: "he" },
    { label: t("LanguageSettingsPage_en"), value: "en" },
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
          <StyledText
            style={{ fontSize: 40, fontWeight: "800" }}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("LanguageSettingsPage_header")}
          </StyledText>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={styles.button}
              bgColor={settings.language === value ? "#00007a" : "#ffffff"}
              textColor={settings.language === value ? "#ffffff" : "#0b0908"}
              onPress={() => updateSetting("language", value)}
            >
              <StyledText style={styles.buttonText}>{label}</StyledText>
            </FlipButton>
          ))}

          <Divider style={{ width: SCREEN_WIDTH * 0.8, marginVertical: 20 }} />

          <StyledText
            style={{ fontSize: 40, fontWeight: "800" }}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("LanguageSettingsPage_LogoutHeader")}
          </StyledText>

          <FlipButton
            style={styles.button}
            bgColor="#ffffff"
            textColor="#0b0908"
            onPress={async () => {
              await logout();
              router.replace("/LoginScreen");
            }}
          >
            <StyledText style={styles.buttonText}>
              {t("LanguageSettingsPage_Logout")}
            </StyledText>
          </FlipButton>
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
