import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals"; // Adjust the import path as necessary
import BouncyButton from "./BouncyButton";

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "N/A";

  try {
    const dateObj = new Date(dateTimeString);

    // Check if the date object is valid
    if (isNaN(dateObj.getTime())) {
      console.error("Error parsing date:", dateTimeString);
      return dateTimeString; // Return original string if parsing failed
    }

    // Get date parts
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = dateObj.getFullYear();

    // Get time parts
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    // Construct the desired format
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date-time:", dateTimeString, e);
    return dateTimeString; // Return original string on error
  }
};

// Creates snippet for message if we need it
const createSnippet = (message, maxLength = 100) => {
  if (!message) return "";
  return message.length <= maxLength
    ? message
    : message.substring(0, maxLength) + "...";
};

export default function NoticeCard({ data, onPress }) {
  if (!data) return null;
  const { t } = useTranslation();
  const displayDate = new Date(data.creationDate).toLocaleDateString("en-GB");
  const displaySnippet = createSnippet(data.noticeMessage);
  const borderColor = data.categoryColor || "#ccc";

  // Check if the current language direction is Right-to-Left
  const isRTL = Globals.userSelectedDirection === "rtl";

  // Define a dynamic style for the container to align its children
  const infoContainerStyle = {
    alignItems: isRTL ? "flex-end" : "flex-start",
  };

  // Define dynamic text styles based on language direction
  const textStyle = {
    textAlign: isRTL ? "right" : "left",
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  // Special style for the title. In LTR it's centered, in RTL it aligns right.
  const titleStyle = {
    textAlign: isRTL ? "right" : "center",
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  return (
    <BouncyButton
      onPress={onPress}
      style={[styles.container, { borderColor }]} // Apply border color
      springConfig={{ speed: 20, bounciness: 10 }}
    >
      <View style={[styles.infoContainer, infoContainerStyle]}>
        <Text style={[styles.noticeTitle, titleStyle]}>{data.noticeTitle}</Text>

        {data.noticeCategory && (
          <Text style={[styles.noticeCategory, textStyle]}>
            {t("NoticeCard_categoryLabel")} {data.noticeCategory}
            {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ""}
          </Text>
        )}

        <Text style={[styles.noticeDate, textStyle]}>
          {t("NoticeCard_dateLabel")} {displayDate}
        </Text>

        {displaySnippet && (
          <Text style={[styles.noticeSnippet, textStyle]}>
            {displaySnippet}
          </Text>
        )}
      </View>
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 150, // Adjusted minHeight slightly if needed
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row", // Keep as row
    alignItems: "center", // Vertically center content in the row
    paddingVertical: 15, // Vertical padding
    paddingHorizontal: 15, // Horizontal padding
    marginVertical: 8,
    borderWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
    // alignItems is now handled dynamically by infoContainerStyle
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
    // Default textAlign is now handled by the dynamic `titleStyle`
  },
  noticeCategory: {
    fontSize: 16,
    color: "#444",
    marginBottom: 5,
    fontWeight: "bold",
  },
  noticeDate: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  noticeSnippet: {
    fontSize: 20,
    color: "#333",
    lineHeight: 20,
    marginTop: 10,
  },
  moreInfoContainer: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  moreInfoText: {
    fontSize: 12,
    color: "#aaa",
  },
});
