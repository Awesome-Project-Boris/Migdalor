import React, { useState, useEffect, useContext } from "react"; // Added useContext
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import FlipButton from "@/components/FlipButton";
import { Stack } from "expo-router";
// Assume you have or will create a NoticesContext similar to MarketplaceContext
// import { NoticesContext } from '../context/NoticesProvider'; // Example context import

import Header from "@/components/Header";

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
  const [noticeData, setNoticeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Keep error state for context/fetch issues

  // Get the noticeId from the route parameters
  const { noticeId } = useLocalSearchParams(); // Use string directly if not typed
  const router = useRouter();

  // --- Data Fetching using Context (Similar to MarketplaceItem.jsx) ---
  // IMPORTANT: Replace with your actual context logic
  // const { getNoticeById } = useContext(NoticesContext); // Assuming this context exists

  useEffect(() => {
    const loadNoticeDetails = () => {
      if (!noticeId) {
        setError("Notice ID not provided");
        setIsLoading(false);
        return;
      }
      // if (!getNoticeById) { // Check if context function is available
      //    setError("Notice context not available");
      //    setIsLoading(false);
      //    console.error("Error: getNoticeById function is missing from NoticesContext.");
      //    return;
      // }

      setIsLoading(true);
      setError(null);
      try {
        // --- Mock call ---
        console.log(
          `Attempting to get notice by ID from context (mock): ${noticeId}`
        );
        // const foundNotice = getNoticeById(noticeId); // Replace with actual context call

        // --- Mock logic START ---
        const allMockNotices = Array.from({ length: 35 }, (_, i) => ({
          /* ... same mock data as before ... */ noticeId: i + 1,
          senderId: `guid_${i}`,
          creationDate: `2025-04-${String(14 + (i % 5)).padStart(2, "0")}`,
          noticeTitle: `Important Notice #${i + 1}`,
          noticeMessage: `This is the FULL notice message...`,
          noticeCategory:
            i % 3 === 0 ? "Urgent" : i % 3 === 1 ? "General" : "Events",
          noticeSubCategory: i % 5 === 0 ? "Sub Cat A" : null,
        }));
        const foundNotice = allMockNotices.find(
          (n) => n.noticeId.toString() === noticeId.toString()
        );
        // --- Mock logic END ---

        if (foundNotice) {
          setNoticeData(foundNotice);
        } else {
          setError("Notice not found");
          setNoticeData(null);
        }
      } catch (err) {
        console.error("Error loading notice from context:", err);
        setError("An error occurred while loading the notice.");
        setNoticeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadNoticeDetails();
    // Add getNoticeById to dependencies if using real context
  }, [noticeId /*, getNoticeById */]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading notice details...</Text>
      </View>
    );
  }

  if (error || !noticeData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Notice not found."}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const displayDate = formatDate(noticeData.creationDate);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{noticeData.noticeTitle}</Text>

        <View style={styles.metaContainer}>
          {noticeData.noticeCategory && (
            <Text style={styles.metaText}>
              Category: {noticeData.noticeCategory}
              {noticeData.noticeSubCategory
                ? ` (${noticeData.noticeSubCategory})`
                : ""}
            </Text>
          )}
          <Text style={styles.metaText}>Date: {displayDate}</Text>
          {/* Optional: Display Sender Info if available in noticeData */}
          {/* noticeData.senderName && <Text style={styles.metaText}>From: {noticeData.senderName}</Text> */}
        </View>

        <Text style={styles.message}>{noticeData.noticeMessage}</Text>

        {/* Contact buttons if we want to direct to an activity/whatever
          <YStack width="90%" space="$3" marginTop="$4" alignItems="center">
             <Text> ... </Text>
             <FlipButton ... />
          </YStack>
       */}

        <View style={styles.backButtonContainer}>
          <FlipButton style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ fontSize: 20 }}>חזרה לאחור</Text>
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
