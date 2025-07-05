import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";

// Define colors for clarity
const PRIMARY_COLOR = "#FFFFFF";
const SECONDARY_COLOR = "#000000";
const DISPLAY_BG_COLOR = "#e0e0e0"; // Background for display-only chips
const DISPLAY_TEXT_COLOR = "#333"; // Text color for display-only chips

/**
 * A selectable or display-only "chip" for an interest.
 *
 * @param {object} props
 * @param {string} props.label - The text to display.
 * @param {'toggle' | 'display'} [props.mode='toggle'] - The chip's behavior.
 * @param {boolean} [props.isSelected=false] - In 'toggle' mode, whether the chip is selected.
 * @param {function} [props.onPress] - In 'toggle' mode, the function to call on press.
 */
export default function InterestChip({
  label,
  mode = "toggle",
  isSelected = false,
  onPress,
}) {
  // If the mode is for display, return a non-interactive View
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
      <Text style={textStyle}>{label}</Text>
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
  chipText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: SECONDARY_COLOR,
  },
  // Styles for 'toggle' mode when selected
  chipContainerSelected: {
    backgroundColor: SECONDARY_COLOR, // Inverted background
  },
  chipTextSelected: {
    color: PRIMARY_COLOR, // Inverted text color
  },
  // Styles for 'display' mode
  chipContainerDisplay: {
    backgroundColor: DISPLAY_BG_COLOR,
    borderColor: "#ccc",
  },
  chipTextDisplay: {
    color: DISPLAY_TEXT_COLOR,
  },
});
