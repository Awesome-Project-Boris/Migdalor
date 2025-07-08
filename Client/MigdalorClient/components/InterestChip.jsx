import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure Ionicons is imported

// Define colors for clarity
const PRIMARY_COLOR = "#FFFFFF";
const SECONDARY_COLOR = "#000000";
const DISPLAY_BG_COLOR = "#e0e0e0";
const DISPLAY_TEXT_COLOR = "#333";
const DELETE_ICON_COLOR = "#c70000"; // A distinct red for the 'X'

/**
 * A selectable or display-only "chip" for an interest.
 *
 * @param {object} props
 * @param {string} props.label - The text to display.
 * @param {'toggle' | 'display'} [props.mode='toggle'] - The chip's behavior.
 * @param {boolean} [props.isSelected=false] - In 'toggle' mode, whether the chip is selected.
 * @param {function} [props.onPress] - In 'toggle' mode, the function to call on press.
 * @param {boolean} [props.showDeleteIcon=false] - If true, shows a deletion 'X' icon.
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
        <Text style={[styles.chipText, styles.chipTextDisplay]}>{label}</Text>
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
      {/* ✅ Wrapper View to hold text and icon */}
      <View style={styles.chipContentWrapper}>
        <Text style={textStyle}>{label}</Text>
        {/* ✅ Conditionally render the delete icon */}
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
  // Base container style for both modes
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
  // ✅ New style for the content wrapper
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
  // ✅ New style for the delete icon
  deleteIcon: {
    marginLeft: 8, // Space between text and icon
  },
  // Styles for 'toggle' mode when selected
  chipContainerSelected: {
    backgroundColor: SECONDARY_COLOR,
  },
  chipTextSelected: {
    color: PRIMARY_COLOR,
  },
  // Styles for 'display' mode
  chipContainerDisplay: {
    backgroundColor: DISPLAY_BG_COLOR,
    borderColor: "#ccc",
  },
  chipTextDisplay: {
    color: DISPLAY_TEXT_COLOR,
    fontSize: 16, // Making display chips a bit smaller for lists
  },
});
