import React from "react";
import {
  StyleSheet as RNStyleSheet,
  Dimensions as RNDimensions,
  ScrollView as RNScrollView,
  View as RNView,
} from "react-native";
import Header from "@/components/Header";
import { Divider } from "react-native-paper";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { YStack as TamaguiYStack } from "tamagui";
import { useSettings } from "@/context/SettingsContext.jsx";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = RNDimensions.get("window").width;

export default function LanguageSettingsPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const options: { label: string; value: string }[] = [
    { label: t("LanguageSettingsPage_he"), value: "he" },
    { label: t("LanguageSettingsPage_en"), value: "en" },
  ];

  return (
    <RNView style={{ flex: 1 }}>
      <Header />
      <RNScrollView
        style={{ flex: 1 }}
        contentContainerStyle={languageStyles.scrollContent}
      >
        <TamaguiYStack width="100%" alignItems="center" gap="$5">
          <StyledText
            style={languageStyles.headerText}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("LanguageSettingsPage_header")}
          </StyledText>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={languageStyles.button}
              bgColor={settings.language === value ? "#00007a" : "#ffffff"}
              textColor={settings.language === value ? "#ffffff" : "#0b0908"}
              onPress={() => updateSetting("language", value)}
            >
              <StyledText style={languageStyles.buttonText}>{label}</StyledText>
            </FlipButton>
          ))}

          <Divider style={{ width: SCREEN_WIDTH * 0.8, marginVertical: 20 }} />

          <StyledText
            style={languageStyles.headerText}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("LanguageSettingsPage_LogoutHeader")}
          </StyledText>

          <FlipButton
            style={languageStyles.button}
            bgColor="#ffffff"
            textColor="#0b0908"
            onPress={async () => {
              await logout();
              router.replace("/LoginScreen");
            }}
          >
            <StyledText style={languageStyles.buttonText}>
              {t("LanguageSettingsPage_Logout")}
            </StyledText>
          </FlipButton>
        </TamaguiYStack>
      </RNScrollView>
    </RNView>
  );
}

const languageStyles = RNStyleSheet.create({
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
