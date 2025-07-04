import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

// Define the colors for clarity and easy modification
const PRIMARY_COLOR = '#FFFFFF'; // White background
const SECONDARY_COLOR = '#000000'; // Black text/border

/**
 * A selectable "chip" for displaying a single interest.
 * It is designed to be scalable and supports a toggled state.
 *
 * @param {object} props
 * @param {string} props.label - The text to display (e.g., "Photography").
 * @param {boolean} props.isSelected - Whether the chip is currently selected.
 * @param {function} props.onPress - The function to call when the chip is pressed.
 */

export default function InterestChip({ label, isSelected, onPress }) {
  // Conditionally choose styles based on the selection state
  const containerStyle = isSelected
    ? [styles.chipContainer, styles.chipContainerSelected]
    : styles.chipContainer;
  const textStyle = isSelected
    ? [styles.chipText, styles.chipTextSelected]
    : styles.chipText;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: SECONDARY_COLOR,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainerSelected: {
    backgroundColor: SECONDARY_COLOR, // Inverted background
  },
  chipText: {
    color: SECONDARY_COLOR,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    // The component will automatically wrap text if it's too long
  },
  chipTextSelected: {
    color: PRIMARY_COLOR, // Inverted text color
  },
});