import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Dimensions,
  TouchableOpacity, // ✅ Import TouchableOpacity
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";

import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";

import { ReadNoticeTracker } from "@/utils/ReadNoticeTracker";

const SCREEN_WIDTH = Dimensions.get("window").width;

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const parts = dateTimeString.split("T");
    if (parts.length < 2) return dateTimeString;

    const datePart = parts[0];
    const timePart = parts[1];

    const dateParts = datePart.split("-");
    if (dateParts.length < 3) return dateTimeString;
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    const timeParts = timePart.split(":");
    if (timeParts.length < 2) return dateTimeString;
    const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

    return `${formattedDate} ${formattedTime}`;
  } catch (e) {
    console.error("Error formatting date string:", e);
    return dateTimeString; // Fallback to original string on error
  }
};

export default function NoticeFocus() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;

  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  const { noticeId } = useLocalSearchParams();
  const router = useRouter();

  const params = useLocalSearchParams();
  const notice = params.notice ? JSON.parse(params.notice) : null;

  useEffect(() => {
    const noticeJSON = params.notice;
    const categoriesJSON = params.allCategories; // ✅ Get the new parameter

    if (noticeJSON) {
      try {
        const parsedNotice = JSON.parse(noticeJSON);
        setNoticeData(parsedNotice);

        // ✅ Parse and set the categories data
        if (categoriesJSON) {
          setAllCategories(JSON.parse(categoriesJSON));
        }

        if (parsedNotice.noticeId) {
          ReadNoticeTracker.markAsRead(parsedNotice.noticeId);
        }
      } catch (e) {
        console.error("Failed to parse navigation params:", e);
        setError("Failed to load notice data.");
      }
    } else {
      setError(t("NoticeDetailsScreen_errorNoId"));
    }

    setIsLoading(false);
  }, [params.notice, params.allCategories, t]);

  const getTranslatedCategoryName = useCallback(
    (hebName) => {
      if (!hebName || allCategories.length === 0) return hebName;
      const category = allCategories.find((c) => c.categoryHebName === hebName);
      if (!category) return hebName;

      return settings.language === "en"
        ? category.categoryEngName
        : category.categoryHebName;
    },
    [allCategories, settings.language]
  );

  const handleImagePress = (imageUri, altText) => {
    if (!imageUri) return;
    router.push({
      pathname: "/ImageViewScreen",
      params: { imageUri, altText },
    });
  };

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
  const senderName = isRTL
    ? noticeData.hebSenderName
    : noticeData.engSenderName;
  const textAlignStyle = { textAlign: isRTL ? "right" : "left" };

  // ✅ Construct the full image URL if a path exists
  const imageUrl = noticeData.picturePath
    ? `${Globals.API_BASE_URL}${noticeData.picturePath}`
    : null;
  const imageAltText = t("NoticeFocus_ImageAlt", "תמונה של הודעה לדיירים");

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.headerPlaque}>
          <StyledText style={styles.subTitle}>
            {t("NoticeDetailsScreen_messageTitle", "Message title")}
          </StyledText>
          <StyledText style={styles.title}>
            {noticeData.noticeTitle ?? "No Title"}
          </StyledText>
        </View>

        {/* ✅ Conditionally render the image container */}
        {imageUrl && (
          <TouchableOpacity
            onPress={() => handleImagePress(imageUrl, imageAltText)}
          >
            <View style={styles.imageContainer}>
              <ExpoImage
                source={{ uri: imageUrl }}
                style={styles.noticeImage}
                contentFit="cover"
              />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.contentPlaque}>
          <View style={styles.metadataSection}>
            {senderName && (
              <View
                style={[
                  styles.metadataRow,
                  useColumnLayout && styles.metadataColumn,
                ]}
              >
                <Ionicons name="person-circle-outline" size={24} color="#555" />
                <StyledText style={[styles.metadataText, textAlignStyle]}>
                  {t("NoticeDetailsScreen_senderLabel", "Posted by:")}{" "}
                  {senderName}
                </StyledText>
              </View>
            )}

            {noticeData.noticeCategory && (
              <View
                style={[
                  styles.metadataRow,
                  useColumnLayout && styles.metadataColumn,
                ]}
              >
                <Ionicons name="pricetag-outline" size={24} color="#555" />
                <StyledText style={[styles.metadataText, textAlignStyle]}>
                  {t("NoticeDetailsScreen_categoryLabel", "Category:")}{" "}
                  {getTranslatedCategoryName(noticeData.noticeCategory)}
                  {noticeData.noticeSubCategory
                    ? ` (${noticeData.noticeSubCategory})`
                    : ""}
                </StyledText>
              </View>
            )}

            <View
              style={[
                styles.metadataRow,
                useColumnLayout && styles.metadataColumn,
              ]}
            >
              <Ionicons name="calendar-outline" size={24} color="#555" />
              <StyledText style={[styles.metadataText, textAlignStyle]}>
                {t("NoticeDetailsScreen_dateLabel", "Date:")}{" "}
                {noticeData.creationDate
                  ? formatDate(noticeData.creationDate)
                  : "N/A"}
              </StyledText>
            </View>
          </View>

          <StyledText style={[styles.messageBody, textAlignStyle]}>
            {noticeData.noticeMessage ?? "No Message"}
          </StyledText>
        </View>

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
    backgroundColor: "#f7e7ce", // Champagne background
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 80,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7e7ce",
  },
  headerPlaque: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentPlaque: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
  },
  // ✅ New styles for the image
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noticeImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#e0e0e0", // Placeholder color
  },
  metadataSection: {
    gap: 15,
    paddingBottom: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metadataColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
  metadataText: {
    fontSize: 16,
    color: "#555555",
    flex: 1,
    lineHeight: 24,
  },
  messageBody: {
    fontSize: 20,
    lineHeight: 30,
    color: "#333333",
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
});
