// migdalor/src/components/common/StyledText.jsx

import React from "react";
import { Text, StyleSheet } from "react-native";
import { useSettings } from "@/context/SettingsContext"; // Adjust path if needed

const StyledText = (props) => {
  const { settings } = useSettings();
  const { style, ...rest } = props;

  const flattenedStyle = StyleSheet.flatten(style);

  // Separate fontSize and lineHeight from the rest of the styles
  const { fontSize, lineHeight, ...restOfStyles } = flattenedStyle || {};

  const finalStyle = { ...restOfStyles };

  // Check if a base fontSize was provided
  if (fontSize) {
    // Calculate the new font size
    const newFontSize = fontSize * settings.fontSizeMultiplier;
    finalStyle.fontSize = newFontSize;

    // IMPORTANT: If a lineHeight was provided, scale it proportionally.
    // If not, let React Native use the default.
    if (lineHeight) {
      finalStyle.lineHeight = lineHeight * settings.fontSizeMultiplier;
    }
  }

  return <Text style={finalStyle} {...rest} />;
};

export default StyledText;
