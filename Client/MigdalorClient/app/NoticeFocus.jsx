import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Card, Paragraph, YStack, XStack, H2, Text } from "tamagui";
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";

import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals";

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
  const { t } = useTranslation();
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { noticeId } = useLocalSearchParams();
  const router = useRouter();

  const fetchNoticeDetails = useCallback(async () => {
    if (!noticeId) {
      setError(t("NoticeDetailsScreen_errorNoId"));
      setIsLoading(false);
      return;
    }
    setError(null);
    try {
      const apiUrl = `${Globals.API_BASE_URL}/api/Notices/${noticeId}`;
      console.log(`Fetching notice details from: ${apiUrl}`);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const status = response.status;
        let errorPayload = `HTTP Error ${status}`;
        try {
          const errorText = await response.text();
          errorPayload += `: ${errorText}`;
        } catch (e) {}
        console.error(`API Error: ${errorPayload}`);
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
      console.log("Fetched Data:", data);
      setNoticeData(data);
    } catch (err) {
      console.error("Error fetching notice details:", err);
      setError(err.message || t("NoticeDetailsScreen_errorDefault"));
      setNoticeData(null);
    } finally {
      setIsLoading(false);
    }
  }, [noticeId, t]);

  useFocusEffect(
    useCallback(() => {
      console.log("NoticeFocusScreen focused, fetching details...");
      setIsLoading(true);
      setNoticeData(null);
      setError(null);
      fetchNoticeDetails();
    }, [fetchNoticeDetails])
  );

  // Show large loading indicator while fetching
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
          <Text style={styles.errorText}>{error}</Text>
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
          <Text style={styles.errorText}>
            {t("NoticeDetailsScreen_noDetailsFound")}
          </Text>
          <Button
            title={t("Common_backButton")}
            onPress={() => router.back()}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Use ScrollView to ensure content scrolls if it exceeds screen height */}
      <ScrollView
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Card Component for main content */}
        <Card
          elevate
          bordered
          padding="$4"
          borderRadius="$4"
          backgroundColor="$background"
        >
          <YStack gap="$4">
            {/* Title using Tamagui H2 */}
            <H2 textAlign="center" fontSize={28} color="$color11">
              {noticeData.noticeTitle ?? "No Title"}
            </H2>

            {/* Meta Info Section */}
            <YStack
              gap="$2"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderColor="$borderColor"
            >
              {/* Category with Icon */}
              {noticeData.noticeCategory && (
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name="pricetag-outline"
                    size={24}
                    color="$color10"
                  />
                  <Paragraph fontSize={16} color="$color10">
                    {t("NoticeDetailsScreen_categoryLabel")}
                    {noticeData.noticeCategory}
                    {noticeData.noticeSubCategory
                      ? ` (${noticeData.noticeSubCategory})`
                      : ""}
                  </Paragraph>
                </XStack>
              )}
              {/* Date/Time with Icon */}
              <XStack alignItems="center" gap="$2">
                <Ionicons name="calendar-outline" size={24} color="$color10" />
                <Paragraph fontSize={16} color="$color10">
                  {t("NoticeDetailsScreen_dateLabel")}
                  {noticeData.creationDate
                    ? formatDate(noticeData.creationDate)
                    : "N/A"}
                </Paragraph>
              </XStack>
            </YStack>

            {/* Message using Tamagui Paragraph */}
            <Paragraph fontSize={32} lineHeight={34} color="$color12">
              {noticeData.noticeMessage ?? "No Message"}
            </Paragraph>
          </YStack>
        </Card>

        {/* Back Button outside the Card */}
        <View style={styles.backButtonContainer}>
          <FlipButton style={styles.backButton} onPress={() => router.back()}>
            <Text
              style={styles.backButtonText}
              color="$color12"
              fontWeight="bold"
            >
              {t("Common_backButton")}
            </Text>
          </FlipButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcfc",
    marginTop: 60,
  },
  contentContainer: {
    padding: 25,
    paddingBottom: 50,
  },
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    color: "#B00020",
    fontSize: 32,
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#1C1C1E",
    textAlign: "center",
  },
  metaContainer: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  metaText: {
    fontSize: 32,
    color: "#4A4A4A",
    marginBottom: 8,
    lineHeight: 32,
  },
  message: {
    fontSize: 26,
    lineHeight: 28,
    color: "#2C2C2E",
    marginBottom: 40,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  backButtonText: {
    fontSize: 16,
  },
});
