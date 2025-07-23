import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  I18nManager,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useSettings } from "@/context/SettingsContext"; // Adjust path if needed
import { useAuth } from "@/context/AuthProvider"; // Adjust path if needed
import { Globals } from "./constants/Globals";
import Header from "@/components/Header"; // Assuming a standard header component

/**
 * InfoSheetScreen Component
 * * This screen fetches and displays rich text content from the server.
 * It adapts to the user's selected language and font size settings.
 */
const InfoSheetScreen = () => {
  // --- Hooks and Context ---
  const { settings, isLoading: settingsLoading } = useSettings();
  const { token } = useAuth();
  const [infoContent, setInfoContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();

  // --- Data Fetching ---
  useEffect(() => {
    // We should only fetch data once the settings (especially language) have been loaded.
    if (settingsLoading) {
      return;
    }

    const fetchInfoSheet = async () => {
      setIsLoading(true);
      try {
        // Use the language from settings to fetch the correct content.
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/InfoSheet/${settings.language}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        setInfoContent(data);
      } catch (error) {
        console.error("Failed to fetch info sheet:", error);
        // Display a user-friendly error message in the correct language.
        setInfoContent(
          settings.language === "he"
            ? "<p>לא ניתן היה לטעון את המידע. אנא נסה שוב מאוחר יותר.</p>"
            : "<p>Could not load the information. Please try again later.</p>"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfoSheet();
  }, [settings.language, settingsLoading, token]); // Re-fetch if language, settings, or token change.

  // --- Styling ---
  // useMemo ensures that the style objects are not recalculated on every render.
  const styles = useMemo(
    () => getStyles(settings.fontSizeMultiplier),
    [settings.fontSizeMultiplier]
  );

  const baseStyle = useMemo(
    () => ({
      // Apply font size from settings to all rendered HTML elements.
      fontSize: 16 * settings.fontSizeMultiplier,
      // Set text color for better readability.
      color: "#333333",
      // Align text based on the application's language direction.
      textAlign: I18nManager.isRTL ? "right" : "left",
    }),
    [settings.fontSizeMultiplier]
  );

  // --- Render Logic ---
  if (isLoading || settingsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={settings.language === "he" ? "דף מידע" : "Information"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {infoContent ? (
          <RenderHTML
            contentWidth={width - 40} // Subtract padding from the total width
            source={{ html: infoContent }}
            baseStyle={baseStyle}
          />
        ) : (
          <Text style={[baseStyle, styles.emptyText]}>
            {settings.language === "he"
              ? "אין תוכן להצגה."
              : "No content to display."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

// --- Stylesheet ---
const getStyles = (fontSizeMultiplier) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F9FA", // A light grey background
      paddingTop: 60, // Add padding to account for the absolute header
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8F9FA",
    },
    scrollContent: {
      padding: 20,
    },
    emptyText: {
      fontSize: 16 * fontSizeMultiplier,
      color: "#6c757d",
      textAlign: "center",
      marginTop: 20,
    },
  });

export default InfoSheetScreen;
