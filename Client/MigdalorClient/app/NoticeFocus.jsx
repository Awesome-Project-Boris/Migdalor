import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
<<<<<<< Updated upstream
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, Paragraph, YStack, XStack, H2, Text } from "tamagui";
=======
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Card, YStack } from "tamagui"; // We only need YStack from Tamagui now
>>>>>>> Stashed changes
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";

// --- Custom Component and Utility Imports ---
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals";
import StyledText from "@/components/StyledText";

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const dateObj = new Date(dateTimeString);

    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date format received:", dateTimeString);
      return "Invalid Date";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateTimeString;
  }
};

export default function NoticeFocus() {
  const { t, i18n } = useTranslation();
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { noticeId, hebSenderName, engSenderName } = useLocalSearchParams();
  const router = useRouter();

  // All hooks and logic (fetchNoticeDetails, useFocusEffect) remain the same...

  const fetchNoticeDetails = useCallback(async () => {
    if (!noticeId) {
      setError(t("NoticeDetailsScreen_errorNoId"));
      setIsLoading(false);
      return;
    }
    setError(null);
    try {
      const apiUrl = `${Globals.API_BASE_URL}/api/Notices/${noticeId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const status = response.status;
        let errorPayload = `HTTP Error ${status}`;
        try {
          const errorText = await response.text();
          errorPayload += `: ${errorText}`;
        } catch (e) {}
        if (status === 404) {
          throw new Error(
            t("NoticeDetailsScreen_errorNotFound", { id: noticeId })
          );
        } else {
          throw new Error(
            t("NoticeDetailsScreen_errorGenericFetch", { status: status })
          );
        }
      }
      const data = await response.json();
      setNoticeData(data);
    } catch (err) {
      setError(err.message || t("NoticeDetailsScreen_errorDefault"));
      setNoticeData(null);
    } finally {
      setIsLoading(false);
    }
  }, [noticeId, t]);

  useEffect(() => {
    if (noticeId) {
      setIsLoading(true);
      setNoticeData(null);
      setError(null);
      fetchNoticeDetails();
    }
  }, [noticeId, fetchNoticeDetails]);

  if (isLoading) {
    return (
      <>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <View style={styles.centered}>
          <StyledText style={styles.errorText}>{error}</StyledText>
          <Button
            title={t("Common_backButton")}
            onPress={() => router.back()}
          />
        </View>
      </>
    );
  }

  if (!noticeData) {
    return (
      <>
        <Header />
        <View style={styles.centered}>
          <StyledText style={styles.errorText}>
            {t("NoticeDetailsScreen_noDetailsFound")}
          </StyledText>
          <Button
            title={t("Common_backButton")}
            onPress={() => router.back()}
          />
        </View>
      </>
    );
  }

  const isRTL = i18n.dir() === "rtl";
  const senderName = isRTL ? hebSenderName : engSenderName;

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Card
          elevate
          bordered
          padding="$4"
          borderRadius="$4"
          backgroundColor="$background"
        >
          <YStack gap="$4">
            <StyledText style={styles.h2Style}>
              {noticeData.noticeTitle ?? "No Title"}
            </StyledText>

            <YStack
              gap="$3"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderColor="$borderColor"
            >
              {/* --- REFACTORED LAYOUT FOR METADATA --- */}
              {senderName && (
                <View style={styles.metadataRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#555"
                  />
                  <StyledText style={styles.paragraphStyle}>
                    {t("NoticeDetailsScreen_senderLabel", "Posted by:")}{" "}
                    {senderName}
                  </StyledText>
                </View>
              )}

              {noticeData.noticeCategory && (
                <View style={styles.metadataRow}>
                  <Ionicons name="pricetag-outline" size={24} color="#555" />
                  <StyledText style={styles.paragraphStyle}>
                    {t("NoticeDetailsScreen_categoryLabel", "Category:")}{" "}
                    {noticeData.noticeCategory}
                    {noticeData.noticeSubCategory
                      ? ` (${noticeData.noticeSubCategory})`
                      : ""}
                  </StyledText>
                </View>
              )}

              <View style={styles.metadataRow}>
                <Ionicons name="calendar-outline" size={24} color="#555" />
                <StyledText style={styles.paragraphStyle}>
                  {t("NoticeDetailsScreen_dateLabel", "Date:")}{" "}
                  {noticeData.creationDate
                    ? formatDate(noticeData.creationDate)
                    : "N/A"}
                </StyledText>
              </View>
            </YStack>

            <StyledText style={styles.messageBodyStyle}>
              {noticeData.noticeMessage ?? "No Message"}
            </StyledText>
          </YStack>
        </Card>

        <View style={styles.backButtonContainer}>
          <FlipButton style={styles.backButton} onPress={() => router.back()}>
            <StyledText style={styles.backButtonText}>
              {t("Common_backButton")}
            </StyledText>
          </FlipButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    marginTop: 60,
  },
  scrollContentContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  errorText: {
    color: "#B00020",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  backButton: {
    minWidth: "50%",
    maxWidth: "90%",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  h2Style: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
    marginBottom: 10,
  },
  // --- CORRECTED LAYOUT STYLES ---
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paragraphStyle: {
    fontSize: 16,
    color: "#555555",
    flex: 1,
    lineHeight: 24, // <-- Explicit lineHeight added
  },
  messageBodyStyle: {
    fontSize: 20,
    lineHeight: 30, // <-- Explicit lineHeight added
    color: "#333333",
  },
});
