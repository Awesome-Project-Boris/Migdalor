import React, { useRef, useCallback } from "react";
import { StyleSheet, View, Text, Animated, Pressable } from "react-native";

// Depends on how date actually looks
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

// Helper function to create a snippet
const createSnippet = (message, maxLength = 100) => {
  if (!message) return "";
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
};

function NoticeCard({ data, onPress }) {
  if (!data) return null;

  const displayDate = formatDate(data.creationDate);
  const displaySnippet = createSnippet(data.noticeMessage);
  const borderColor = data.categoryColor || "#ccc";

  // Animated scale value
  const scale = useRef(new Animated.Value(1)).current;

  // Shrink on press in
  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  }, [scale]);

  // Bounce back on press out
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.container, { borderColor }, { transform: [{ scale }] }]}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.noticeTitle}>{data.noticeTitle}</Text>

          {data.noticeCategory && (
            <Text style={styles.noticeCategory}>
              Category: {data.noticeCategory}
              {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ""}
            </Text>
          )}

          <Text style={styles.noticeDate}>Date: {displayDate}</Text>

          {displaySnippet && (
            <Text style={styles.noticeSnippet}>{displaySnippet}</Text>
          )}
        </View>

        <View style={styles.moreInfoContainer}>
          <Text style={styles.moreInfoText}>יש ללחוץ לפרטים נוספים</Text>
        </View>
      </Animated.View>
    </Pressable>
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

export default NoticeCard;
