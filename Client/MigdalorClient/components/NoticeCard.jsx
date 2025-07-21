import React from "react";
import { StyleSheet, View } from "react-native"; // 'Text' import removed
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";
import BouncyButton from "./BouncyButton";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/components/StyledText.jsx"; // Import StyledText

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

const createSnippet = (message, maxLength = 100) => {
  if (!message) return "";
  return message.length <= maxLength
    ? message
    : message.substring(0, maxLength) + "...";
};

export default function NoticeCard({ data, onPress, isNew }) {
  if (!data) return null;
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const displayDate = new Date(data.creationDate).toLocaleDateString("en-GB");
  const displaySnippet = createSnippet(data.noticeMessage);
  const borderColor = data.categoryColor || "#ccc";

  // Check if the current language direction is Right-to-Left
  const isRTL = i18n.dir() === "rtl";

  // Choose the sender name based on the current language
  const senderName = isRTL ? data.hebSenderName : data.engSenderName;

  const infoContainerStyle = {
    alignItems: isRTL ? "flex-end" : "flex-start",
  };

  const textStyle = {
    textAlign: isRTL ? "right" : "left",
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  const titleStyle = {
    textAlign: isRTL ? "right" : "center",
    writingDirection: isRTL ? "rtl" : "ltr",
  };

  return (
    <BouncyButton
      onPress={onPress}
      style={[styles.container, { borderColor }]}
      springConfig={{ speed: 20, bounciness: 10 }}
    >
      <View style={[styles.infoContainer, infoContainerStyle]}>
        <StyledText style={[styles.noticeTitle, titleStyle]}>
          {data.noticeTitle}
        </StyledText>

        {/* Display Sender Name */}
        {senderName && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color="#444" />
            <StyledText style={[styles.noticeSender, textStyle]}>
              {senderName}
            </StyledText>
          </View>
        )}

        {data.noticeCategory && (
          <View style={styles.metaRow}>
            <Ionicons name="pricetag-outline" size={16} color="#444" />
            <StyledText style={[styles.noticeCategory, textStyle]}>
              {data.noticeCategory}
              {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ""}
            </StyledText>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color="#444" />
          <StyledText style={[styles.noticeDate, textStyle]}>
            {displayDate}
          </StyledText>
        </View>

        {displaySnippet && (
          <StyledText style={[styles.noticeSnippet, textStyle]}>
            {displaySnippet}
          </StyledText>
        )}
      </View>
      {isNew && (
        <View
          style={[
            styles.newBadge,
            isRtl ? styles.newBadgeRtl : styles.newBadgeLtr,
          ]}
        >
          <StyledText style={styles.newBadgeText}>
            {t("Item_New", "New")}
          </StyledText>
        </View>
      )}
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 150,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
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
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12, // Increased margin
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6, // Add gap between icon and text
  },
  noticeSender: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
  },
  noticeCategory: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
  noticeDate: {
    fontSize: 16,
    color: "#444",
  },
  noticeSnippet: {
    fontSize: 18, // Slightly smaller for snippet
    color: "#333",
    lineHeight: 24, // Adjust line height
    marginTop: 10,
  },
  newBadge: {
    position: "absolute",
    top: 10,
    backgroundColor: "#ff4757",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 5,
  },
  newBadgeLtr: {
    right: 10,
  },
  newBadgeRtl: {
    left: 10,
  },
  newBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
