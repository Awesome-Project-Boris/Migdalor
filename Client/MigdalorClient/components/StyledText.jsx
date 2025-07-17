// migdalor/src/components/common/StyledText.jsx

import React from "react";
import { Text, StyleSheet } from "react-native";
import { useSettings } from "@/context/SettingsContext"; // Adjust path if needed

const StyledText = (props) => {
  const { settings } = useSettings();

  // Destructure the new props for truncation alongside the existing ones.
  const { style, numberOfLines, ellipsizeMode, ...rest } = props;

  const flattenedStyle = StyleSheet.flatten(style);

  // Separate fontSize and lineHeight from the rest of the styles
  const { fontSize, lineHeight, ...restOfStyles } = flattenedStyle || {};

  const finalStyle = { ...restOfStyles };

  // Check if a base fontSize was provided
  if (fontSize) {
    // Calculate the new font size
    const newFontSize = fontSize * settings.fontSizeMultiplier;
    finalStyle.fontSize = newFontSize;

    // If a lineHeight was provided, scale it proportionally.
    if (lineHeight) {
      finalStyle.lineHeight = lineHeight * settings.fontSizeMultiplier;
    }
  }

  // Render the built-in Text component, passing down the new props.
  return (
    <Text
      style={finalStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode || "tail"} // Default to 'tail' if not provided
      {...rest}
    />
  );
};

export default StyledText;
