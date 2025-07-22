import React from "react";
import { Text, StyleSheet } from "react-native";
import { useSettings } from "@/context/SettingsContext"; // Adjust path if needed

const StyledText = (props) => {
  const { settings } = useSettings();
  const isRTL = settings.language === "he";

  // Destructure maxFontSize from the component's props
  const { style, maxFontSize, ...rest } = props;

  const flattenedStyle = StyleSheet.flatten(style);

  const { fontSize, lineHeight, textAlign, ...restOfStyles } =
    flattenedStyle || {};

  const finalStyle = { ...restOfStyles };

  // Apply font-size scaling from settings
  if (fontSize) {
    let newFontSize = fontSize * settings.fontSizeMultiplier;

    // If maxFontSize is provided and the calculated size exceeds it, cap the font size.
    if (maxFontSize && newFontSize > maxFontSize) {
      newFontSize = maxFontSize;
    }

    finalStyle.fontSize = newFontSize;

    // Adjust lineHeight proportionally if it exists to maintain spacing
    if (lineHeight) {
      const originalRatio = lineHeight / fontSize;
      finalStyle.lineHeight = newFontSize * originalRatio;
    }
  }

  finalStyle.textAlign = textAlign || (isRTL ? "right" : "left");
  finalStyle.writingDirection = isRTL ? "rtl" : "ltr";

  return <Text style={finalStyle} {...rest} />;
};

export default StyledText;