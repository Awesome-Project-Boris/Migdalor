import React, { useState, useEffect } from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import { Globals } from "@/app/constants/Globals";
import FlipButton from "../../components/FlipButton";
import Header from "@/components/Header";
import { Divider } from "react-native-paper";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, YStack } from "tamagui";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function LanguageSettingsPage() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const [languageSetting, setLanguageSetting] = useState(Globals.userSelectedLanguage);

  useEffect(() => {
    Globals.userSelectedLanguage = languageSetting;
    Globals.userSelectedDirection = languageSetting === "he" ? "rtl" : "ltr";
    i18n.changeLanguage(languageSetting);
  }, [languageSetting]);

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
          <Text
            fontSize={40}
            fontWeight={800}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
          >
            {t("LanguageSettingsPage_header")}
          </Text>

          {options.map(({ label, value }) => (
            <FlipButton
              key={value}
              style={styles.button}
              bgColor={languageSetting === value ? "#00007a" : "#ffffff"}
              textColor={languageSetting === value ? "#ffffff" : "#0b0908"}
              onPress={() => setLanguageSetting(value)}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </FlipButton>
          ))}

          <Divider style={{ width: SCREEN_WIDTH * 0.8, marginVertical: 20 }} />

          <Text
            fontSize={40}
            fontWeight={800}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
          >
            {t("LanguageSettingsPage_LogoutHeader")}
          </Text>

          <FlipButton
            style={styles.button}
            bgColor="#ffffff"
            textColor="#0b0908"
            onPress={async () => {
              await logout();
              router.replace("/LoginScreen");
            }}
          >
            <Text style={styles.buttonText}>{t("LanguageSettingsPage_Logout")}</Text>
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
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});
