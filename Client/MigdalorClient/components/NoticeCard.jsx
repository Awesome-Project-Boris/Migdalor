import React from "react";
import { View, StyleSheet } from "react-native";
import BouncyButton from "./BouncyButton";
import StyledText from "@/components/StyledText.jsx";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

const createSnippet = (message, maxLength = 100) => {
  if (!message) {
    return "";
  }
  const singleLineMessage = message.replace(/\n/g, " ");
  return singleLineMessage.length <= maxLength
    ? singleLineMessage
    : `${singleLineMessage.substring(0, maxLength)}...`;
};

// ✅ Accepting your original 'isNew' prop and adding the new 'isRead' prop.
export default function NoticeCard({ data, isNew, isRead, onPress }) {
  if (!data) {
    return null;
  }
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const displayDate = new Date(data.creationDate).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const displaySnippet = createSnippet(data.noticeMessage);
  const senderName = isRtl ? data.hebSenderName : data.engSenderName;

  // ✅ Your original styling logic is fully preserved.
  const infoContainerStyle = { alignItems: isRtl ? "flex-end" : "flex-start" };
  const textStyle = {
    textAlign: isRtl ? "right" : "left",
    writingDirection: isRtl ? "rtl" : "ltr",
  };
  const titleStyle = [styles.noticeTitle, textStyle];
  const metaRowStyle = [
    styles.metaRow,
    { flexDirection: isRtl ? "row-reverse" : "row" },
  ];

  return (
    // ✅ The ONLY style change is adding the conditional 'containerRead'.
    <BouncyButton
      onPress={onPress}
      style={[
        styles.container,
        { borderColor: data.categoryColor || "#ccc" },
        isRead && styles.containerRead,
      ]}
    >
      {/* ✅ This is YOUR original JSX structure. I have not changed it. */}
      <View style={[styles.infoContainer, infoContainerStyle]}>
        <StyledText style={titleStyle}>{data.noticeTitle}</StyledText>

        {senderName && (
          <View style={metaRowStyle}>
            <Ionicons name="person-outline" size={18} color="#444" />
            <StyledText style={[styles.noticeSender, textStyle]}>
              {senderName}
            </StyledText>
          </View>
        )}

        {data.noticeCategory && (
          <View style={metaRowStyle}>
            <Ionicons name="pricetag-outline" size={18} color="#444" />
            <StyledText style={[styles.noticeCategory, textStyle]}>
              {data.noticeCategory}
              {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ""}
            </StyledText>
          </View>
        )}

        <View style={metaRowStyle}>
          <Ionicons name="calendar-outline" size={18} color="#444" />
          <StyledText style={[styles.noticeDate, textStyle]}>
            {displayDate}
          </StyledText>
        </View>

        {/* The snippet was missing from your "old" code block, but was in your component. I've preserved it. */}
        <StyledText style={[styles.noticeSnippet, textStyle]}>
          {displaySnippet}
        </StyledText>
      </View>
      {isNew && <View style={styles.newIndicator} />}
    </BouncyButton>
  );
}

// ✅ Your original styles, plus the one new style for the read container.
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
  // This is the only new style added.
  containerRead: {
    backgroundColor: "#e0e0e0",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
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
  noticeDate: {
    fontSize: 16,
    color: "#444",
  },
  noticeSnippet: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  newIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
});
