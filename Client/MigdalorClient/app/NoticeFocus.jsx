import React, { useState, useEffect, useContext, useCallback } from "react"; // Added useContext
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Card, Paragraph, YStack, XStack, H2, Text } from 'tamagui';
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";
// Assume you have or will create a NoticesContext similar to MarketplaceContext
// import { NoticesContext } from '../context/NoticesProvider'; // Example context import

import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals"; // Adjust the import path as necessary


const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "N/A"; // Handle null or empty string
  try {
    const dateObj = new Date(dateTimeString);
    // Check if the date object is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date format received:", dateTimeString);
      return "Invalid Date";
    }

    // --- Get Date Parts ---
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = dateObj.getFullYear();

    // --- Get Time Parts ---
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // --- Combine Date and Time ---
    return `${day}/${month}/${year} ${hours}:${minutes}`; // Format: DD/MM/YYYY HH:MM

  } catch (e) {
    console.error("Error formatting date:", e);
    return dateTimeString; // Return original string on error
  }
};

export default function NoticeFocus() {
  const { t } = useTranslation();
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Keep error state for context/fetch issues

  // Get the noticeId from the route parameters
  const { noticeId } = useLocalSearchParams(); // Use string directly if not typed
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
          throw new Error(t("NoticeDetailsScreen_errorNotFound", { id: noticeId }));
        } else {
          throw new Error(t("NoticeDetailsScreen_errorGenericFetch", { status: status }));
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
      setNoticeData(null); // Reset data on focus to ensure loading state is clean
      setError(null); // Reset error on focus
      fetchNoticeDetails();
    }, [fetchNoticeDetails])
  );




  if (error) { // Display error message if fetch failed
    return (
      <>
      <Header/>
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title={t("Common_backButton")} onPress={() => router.back()} />
      </View>
      </>
    );
  }

  if (!noticeData) { // Display if no data could be loaded (e.g., 404 or other issues)
     return (
       <>
       <Header/>
       <View style={styles.centered}>
         <Text style={styles.errorText}>{t("NoticeDetailsScreen_noDetailsFound")}</Text>
         <Button title={t("Common_backButton")} onPress={() => router.back()} />
       </View>
       </>
     );
   }


   return (
    <>
      <Header />
      {/* Use ScrollView to ensure content scrolls if it exceeds screen height */}
      <ScrollView
        style={styles.screenContainer} // Use screenContainer for overall background/flex
        contentContainerStyle={styles.scrollContentContainer} // Use for padding inside scroll
      >
        {/* Card Component for main content */}
        <Card elevate bordered padding="$4" borderRadius="$4" backgroundColor="$background">
          <YStack gap="$4">
            {/* Title using Tamagui H2 */}
            <H2 textAlign="center" fontSize={28} color="$color11">
              {noticeData.noticeTitle ?? 'No Title'}
            </H2>

            {/* Meta Info Section */}
            <YStack gap="$2" paddingVertical="$3" borderBottomWidth={1} borderColor="$borderColor">
              {/* Category with Icon */}
              {noticeData.noticeCategory && (
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="pricetag-outline" size={24} color="$color10" />
                  <Paragraph fontSize={16} color="$color10">
                    {t("NoticeDetailsScreen_categoryLabel")}
                    {noticeData.noticeCategory}
                    {noticeData.noticeSubCategory ? ` (${noticeData.noticeSubCategory})` : ""}
                  </Paragraph>
                </XStack>
              )}
              {/* Date/Time with Icon */}
              <XStack alignItems="center" gap="$2">
                 <Ionicons name="calendar-outline" size={24} color="$color10" />
                 <Paragraph fontSize={16} color="$color10">
                    {t("NoticeDetailsScreen_dateLabel")}
                    {noticeData.creationDate ? formatDate(noticeData.creationDate) : "N/A"}
                 </Paragraph>
              </XStack>
            </YStack>

            {/* Message using Tamagui Paragraph */}
            <Paragraph fontSize={32} lineHeight={34} color="$color12">
              {noticeData.noticeMessage ?? 'No Message'}
            </Paragraph>
          </YStack>
        </Card>

        {/* Back Button outside the Card */}
        <View style={styles.backButtonContainer}>
          <FlipButton style={styles.backButton} onPress={() => router.back()}>
            {/* Use Tamagui Text for consistency inside button */}
            <Text style={styles.backButtonText} color="$color12" fontWeight="bold">
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
    backgroundColor: "#fcfcfc", // Slightly off-white can be easier on the eyes
    marginTop: 60, // Keep header spacing consistent
  },
  contentContainer: {
    padding: 25, // Increased padding
    paddingBottom: 50, // More gap at the bottom
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Lighter grey background
    marginTop: 60,
  },
  scrollContentContainer: {
    padding: 15, // Padding for the scroll view
    paddingBottom: 40,
  },
  ccentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f2f5", // Match screen background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555"
},
errorText: {
  color: "#B00020",
  fontSize: 32,
  marginBottom: 20,
  textAlign: "center",
},
  title: {
    fontSize: 32, // Significantly larger title
    fontWeight: "bold", // Keep bold
    marginBottom: 25, // More gap below title
    color: "#1C1C1E", // Darker color for strong contrast
    textAlign: "center",
  },
  metaContainer: {
    marginBottom: 25, // More gap below meta info
    paddingBottom: 15, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Lighter border
  },
  metaText: {
    fontSize: 32, // Larger meta text
    color: "#4A4A4A", // Slightly softer dark gray
    marginBottom: 8,  // Increased gap between meta lines
    lineHeight: 32, // Added line height for meta text
  },
  message: {
    fontSize: 26, // Larger message text
    lineHeight: 28, // Increased line height for readability
    color: "#2C2C2E", // Dark gray for main text
    marginBottom: 40, // More gap after message
    // textAlign logic can remain if needed based on Globals.userSelectedDirection
  },
  backButtonContainer: {
    marginTop: 30, // Increased top margin
    alignItems: "center",
  },
  backButton: { // Style the FlipButton container
    minWidth: "50%",
    maxWidth: "90%",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff", // White background for button
    borderWidth: 1,
    borderColor: "#d1d5db", // Light border
    elevation: 1, // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  backButtonText: { // Style the Text inside FlipButton
    fontSize: 16, // Consistent font size
    // Color and fontWeight are set via Tamagui props in JSX now
}
 
});
