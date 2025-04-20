import React, { useState, useEffect, useContext } from "react"; // Added useContext
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import FlipButton from "@/components/FlipButton";
// Assume you have or will create a NoticesContext similar to MarketplaceContext
// import { NoticesContext } from '../context/NoticesProvider'; // Example context import

import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Globals } from "./constants/Globals"; // Adjust the import path as necessary

// Helper function to format date string (reuse or define here)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

export default function NoticeFocusScreen() {
  const { t } = useTranslation();
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Keep error state for context/fetch issues

  // Get the noticeId from the route parameters
  const { noticeId } = useLocalSearchParams(); // Use string directly if not typed
  const router = useRouter();

  const fetchNoticeDetails = useCallback(async () => {
    if (!noticeId) {
      setError(t("NoticeDetailsScreen_errorNoId")); // Use translation
      setIsLoading(false);
      return;
    }

    setError(null); // Clear previous errors

    try {
      // Construct the API URL using Globals and the noticeId
      const apiUrl = `${Globals.API_BASE_URL}/api/Notices/${noticeId}`; // Assumes endpoint structure
      console.log(`Workspaceing notice details from: ${apiUrl}`); // Log the URL

      const response = await fetch(apiUrl);

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 404) {
          throw new Error(t("NoticeDetailsScreen_errorNotFound", { id: noticeId }));
        } else {
          throw new Error(t("NoticeDetailsScreen_errorGenericFetch", { status: response.status }));
        }
      }

      const data = await response.json();
      setNoticeData(data); // Set the fetched data

    } catch (err) {
      console.error("Error fetching notice details:", err);
      setError(err.message || t("NoticeDetailsScreen_errorDefault")); // Use translated default error
      setNoticeData(null);
    } finally {
      setIsLoading(false); // Ensure loading is set to false after fetch completes or fails
    }
  }, [noticeId, t]);

  useFocusEffect(
    useCallback(() => {
      console.log("NoticeFocusScreen focused, fetching details...");
      setIsLoading(true); // Set loading true when screen focuses
      fetchNoticeDetails();

      // Optional cleanup function (if needed, e.g., to cancel fetch)
      // return () => { /* cleanup logic */ };
    }, [fetchNoticeDetails]) // Depend on the stable fetchNoticeDetails callback
  );


  const displayDate = formatDate(noticeData.creationDate);


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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Use fields from noticeData, matching DB structure */}
        <Text style={styles.title}>{noticeData.noticeTitle}</Text>

        <View style={styles.metaContainer}>
          {noticeData.noticeCategory && (
            <Text
              style={[
                styles.metaText,
                {
                  textAlign:
                    Globals.userSelectedDirection === "rtl" ? "right" : "left",
                },
              ]}
            >
              {t("NoticeDetailsScreen_categoryLabel")}
              {noticeData.noticeCategory}
              {noticeData.noticeSubCategory
                ? ` (${noticeData.noticeSubCategory})`
                : ""}
            </Text>
          )}
          <Text
            style={[
              styles.metaText,
              {
                textAlign:
                  Globals.userSelectedDirection === "rtl" ? "right" : "left",
              },
            ]}
          >
            {t("NoticeDetailsScreen_dateLabel")} {displayDate}
          </Text>
          {/* Optional: Display Sender Info if you fetch/join it */}
          {/* noticeData.senderName && <Text style={styles.metaText}>From: {noticeData.senderName}</Text> */}
        </View>

        <Text style={styles.message}>{noticeData.noticeMessage}</Text>

        <View style={styles.backButtonContainer}>
          <FlipButton style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ fontSize: 20 }}>{t("Common_backButton")}</Text>
          </FlipButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 60,
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  metaContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  metaText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 30,
  },
  backButtonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  backButton: {
    minWidth: "50%",
    maxWidth: "90%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});
