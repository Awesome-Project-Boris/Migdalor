import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/components/StyledText"; // Import StyledText

// Define colors for clarity
const PRIMARY_COLOR = "#FFFFFF";
const SECONDARY_COLOR = "#000000";
const DISPLAY_BG_COLOR = "#e0e0e0";
const DISPLAY_TEXT_COLOR = "#333";
const DELETE_ICON_COLOR = "#c70000";

/**
 * A selectable or display-only "chip" for an interest.
 */
export default function InterestChip({
  label,
  mode = "toggle",
  isSelected = false,
  onPress,
  showDeleteIcon = false,
}) {
  if (mode === "display") {
    return (
      <View style={[styles.chipContainer, styles.chipContainerDisplay]}>
        {/* Replaced Text with StyledText */}
        <StyledText style={[styles.chipText, styles.chipTextDisplay]}>
          {label}
        </StyledText>
      </View>
    );
  }

  // --- Logic for Toggleable Mode ---
  const containerStyle = isSelected
    ? [styles.chipContainer, styles.chipContainerSelected]
    : styles.chipContainer;
  const textStyle = isSelected
    ? [styles.chipText, styles.chipTextSelected]
    : styles.chipText;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chipContentWrapper}>
        {/* Replaced Text with StyledText */}
        <StyledText style={textStyle}>{label}</StyledText>
        {showDeleteIcon && (
          <Ionicons
            name="close-circle"
            size={22}
            color={DELETE_ICON_COLOR}
            style={styles.deleteIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
    borderColor: SECONDARY_COLOR,
    backgroundColor: PRIMARY_COLOR,
  },
  chipContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: SECONDARY_COLOR,
  },
  deleteIcon: {
    marginLeft: 8,
  },
  chipContainerSelected: {
    backgroundColor: SECONDARY_COLOR,
  },
  chipTextSelected: {
    color: PRIMARY_COLOR,
  },
  chipContainerDisplay: {
    backgroundColor: DISPLAY_BG_COLOR,
    borderColor: "#ccc",
  },
  chipTextDisplay: {
    color: DISPLAY_TEXT_COLOR,
    fontSize: 16,
  },
});
