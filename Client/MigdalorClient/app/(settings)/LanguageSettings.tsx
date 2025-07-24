import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View, // ✅ Using standard View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/Header";
import { Divider } from "react-native-paper";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText";
import CategorySettingsModal from "@/components/CategorySettingsModal";

const SCREEN_WIDTH = Dimensions.get("window").width;

type LanguageOption = {
  label: string;
  value: string;
};

export default function LanguageSettingsPage(): JSX.Element {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const [isCategoryModalVisible, setCategoryModalVisible] =
    useState<boolean>(false);
  const [residentId, setResidentId] = useState<string | null>(null);

  useEffect(() => {
    const loadResidentId = async () => {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        setResidentId(userData?.residentID);
      }
    };
    loadResidentId();
  }, []);

  const languageOptions: LanguageOption[] = [
    { label: t("LanguageSettingsPage_he"), value: "he" },
    { label: t("LanguageSettingsPage_en"), value: "en" },
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace("/LoginScreen");
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ✅ Replaced TamaguiYStack with a standard View and style */}
        <View style={styles.contentContainer}>
          <StyledText style={styles.headerText}>
            {t("LanguageSettingsPage_LanguageHeader", "שפת האפליקציה")}
          </StyledText>

          {languageOptions.map(({ label, value }) => {
            const isActive = settings.language === value;
            return (
              <FlipButton
                key={value}
                style={styles.button}
                onPress={() => updateSetting("language", value)}
                bgColor={isActive ? "#007AFF" : "#FFFFFF"}
                textColor={isActive ? "#FFFFFF" : "#0b0908"}
              >
                {/* We apply the color style directly here to ensure it overrides */}
                <StyledText
                  style={[
                    styles.buttonText,
                    { color: isActive ? "#FFFFFF" : "#0b0908" },
                  ]}
                >
                  {label}
                </StyledText>
              </FlipButton>
            );
          })}

          <Divider style={styles.divider} />

          <StyledText style={styles.headerText}>
            {t("SettingsPage_NoticePreferences", "העדפות הודעות")}
          </StyledText>
          <FlipButton
            style={styles.button}
            onPress={() => setCategoryModalVisible(true)}
          >
            <StyledText style={styles.buttonText}>
              {t("SettingsPage_ManageCategories", "ניהול קטגוריות")}
            </StyledText>
          </FlipButton>

          <Divider style={styles.divider} />

          <StyledText style={styles.headerText}>
            {t("LanguageSettingsPage_LogoutHeader")}
          </StyledText>

          <FlipButton
            style={styles.button}
            bgColor="#ffffff"
            textColor="#0b0908"
            onPress={handleLogout}
          >
            <StyledText style={styles.buttonText}>
              {t("LanguageSettingsPage_Logout")}
            </StyledText>
          </FlipButton>
        </View>
      </ScrollView>

      {residentId && (
        <CategorySettingsModal
          visible={isCategoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
          residentId={residentId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  // ✅ New container style to replace YStack
  contentContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 60,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 50,
    marginBottom: 10, // Spacing between header and buttons
  },
  button: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
    marginTop: 10, // Spacing between buttons in a list
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 18,
  },
  divider: {
    width: SCREEN_WIDTH * 0.8,
    marginVertical: 30, // Spacing around dividers
  },
});
