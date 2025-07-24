import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";
import BouncyButton from "./BouncyButton";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

const createSnippet = (message, maxLength = 100) => {
  if (!message) return "";
  return message.length <= maxLength
    ? message
    : message.substring(0, maxLength) + "...";
};

// ✅ Note the prop change from `isNew` to `isRead`
export default function NoticeCard({ data, onPress, isRead }) {
  if (!data) return null;
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const displayDate = new Date(data.creationDate).toLocaleDateString("en-GB");
  const displaySnippet = createSnippet(data.noticeMessage);

  // ✅ Muted border color for read items, otherwise use category color
  const borderColor = isRead ? "#d1d1d6" : data.categoryColor || "#ccc";

  const senderName = isRtl ? data.hebSenderName : data.engSenderName;

  const infoContainerStyle = { alignItems: isRtl ? "flex-end" : "flex-start" };
  const textStyle = {
    textAlign: isRtl ? "right" : "left",
    writingDirection: isRtl ? "rtl" : "ltr",
  };

  return (
    // ✅ Apply conditional styles for the container
    <BouncyButton
      onPress={onPress}
      style={[
        styles.container,
        { borderColor },
        isRead ? styles.containerRead : styles.containerUnread,
      ]}
    >
      <View style={[styles.infoContainer, infoContainerStyle]}>
        {/* ✅ Apply conditional styles for the title */}
        <StyledText
          style={[styles.noticeTitle, textStyle, isRead && styles.textRead]}
        >
          {data.noticeTitle}
        </StyledText>
        <View
          style={[
            styles.metaRow,
            { flexDirection: isRtl ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={isRead ? styles.textMetaRead.color : "#444"}
          />
          {/* ✅ Apply conditional styles for meta text */}
          <StyledText
            style={[styles.noticeSender, isRead && styles.textMetaRead]}
          >
            {senderName}
          </StyledText>
        </View>
        <View
          style={[
            styles.metaRow,
            { flexDirection: isRtl ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons
            name="folder-outline"
            size={16}
            color={isRead ? styles.textMetaRead.color : "#444"}
          />
          <StyledText
            style={[styles.noticeCategory, isRead && styles.textMetaRead]}
          >
            {data.categoryHebName}
          </StyledText>
        </View>
        <StyledText
          style={[
            styles.noticeSnippet,
            textStyle,
            isRead && styles.textMetaRead,
          ]}
        >
          {displaySnippet}
        </StyledText>
      </View>
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 150,
    borderRadius: 10,
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
  // ✅ Style for UNREAD card (your default)
  containerUnread: {
    backgroundColor: "#fff",
  },
  // ✅ Style for READ card
  containerRead: {
    backgroundColor: "#f2f2f7", // A subtle, high-contrast grey
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  metaRow: {
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  noticeSender: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
  },
  noticeCategory: {
    fontSize: 16,
    color: "#444",
  },
  noticeSnippet: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  // ✅ Style for READ text
  textRead: {
    color: "#3c3c43", // Slightly muted but still very dark and readable
  },
  // ✅ Style for READ meta text (sender, category)
  textMetaRead: {
    color: "#8e8e93", // Muted grey, still passes accessibility contrast checks
  },
});
