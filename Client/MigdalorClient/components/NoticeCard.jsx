import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals"; // Adjust the import path as necessary
import BouncyButton from "./BouncyButton";

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString;
  }
};

// Create snippet helper
const createSnippet = (message, maxLength = 100) => {
  if (!message) return "";
  return message.length <= maxLength
    ? message
    : message.substring(0, maxLength) + "...";
};

/**
 * NoticeCard displays a notice with a bouncy press animation.
 * Expects data with noticeTitle, noticeCategory, noticeSubCategory,
 * creationDate, noticeMessage, and categoryColor fields.
 */
export default function NoticeCard({ data, onPress }) {
  if (!data) return null;

  const displayDate = formatDate(data.creationDate);
  const displaySnippet = createSnippet(data.noticeMessage);
  const borderColor = data.categoryColor || "#ccc";

  return (
    <BouncyButton
      onPress={onPress}
      style={[styles.container, { borderColor }]}
      springConfig={{ speed: 20, bounciness: 10 }}
    >
      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.noticeCategory,
            {
              /* flip alignment based on the app’s direction setting */
              // textAlign:
              //   Globals.userSelectedDirection === "rtl" ? "right" : "left",
              textAlign: "center",
            },
          ]}
        >
          {data.noticeTitle}
        </Text>

        {data.noticeCategory && (
          <Text
            style={[
              styles.noticeCategory,
              {
                /* flip alignment based on the app’s direction setting */
                textAlign:
                  Globals.userSelectedDirection === "rtl" ? "right" : "left",
              },
            ]}
          >
            {t("NoticeDetailsScreen_categoryLabel")} {data.noticeCategory}
            {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ""}
          </Text>
        )}

        <Text
          style={[
            styles.noticeDate,
            {
              /* flip alignment based on the app’s direction setting */
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("NoticeDetailsScreen_dateLabel")} {displayDate}
        </Text>

        {displaySnippet && (
          <Text style={styles.noticeSnippet}>{displaySnippet}</Text>
        )}
      </View>

      <View style={styles.moreInfoContainer}>
        <Text style={styles.moreInfoText}>
          {t("MarketplaceScreen_MoreDetailsButton")}
        </Text>
      </View>
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 120,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderWidth: 5,
    position: "relative",
    paddingBottom: 30,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  noticeCategory: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
    fontStyle: "italic",
  },
  noticeDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  noticeSnippet: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
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
