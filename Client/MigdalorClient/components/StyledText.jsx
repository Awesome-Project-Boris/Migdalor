// migdalor/src/components/common/StyledText.jsx

import React from "react";
import { Text, StyleSheet } from "react-native";
import { useSettings } from "@/context/SettingsContext"; // Adjust path if needed

const StyledText = (props) => {
  const { settings } = useSettings();
  const isRTL = settings.language === "he";

  const { style, ...rest } = props;

  const flattenedStyle = StyleSheet.flatten(style);

  // Separate text-alignment from other styles to avoid conflicts
  const { fontSize, lineHeight, textAlign, ...restOfStyles } =
    flattenedStyle || {};

  const finalStyle = { ...restOfStyles };

  // Apply font-size scaling from settings
  if (fontSize) {
    const newFontSize = fontSize * settings.fontSizeMultiplier;
    finalStyle.fontSize = newFontSize;
    if (lineHeight) {
      finalStyle.lineHeight = lineHeight * settings.fontSizeMultiplier;
    }
  }

  // **THIS IS THE CRITICAL FIX**
  // Set default text alignment based on language.
  // A specific style like `textAlign: 'center'` will override this default.
  finalStyle.textAlign = textAlign || (isRTL ? "right" : "left");

  // Ensure the writing direction is set correctly for proper text rendering
  finalStyle.writingDirection = isRTL ? "rtl" : "ltr";

  return <Text style={finalStyle} {...rest} />;
};

export default StyledText;
