// frontend/components/MainMenuFinishEditButton.jsx

import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import FlipButton from "./FlipButton";
import { StyleSheet } from "react-native"; // 'Text' import removed
import React from 'react';
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText.jsx"; // Import StyledText

// Accept onSave prop
export function EditToggleButton({ onSave }) {
  const { t } = useTranslation();
  const { editing, setEditing } = useMainMenuEdit();

  // Don't render the button if not in editing mode
  if (!editing) {
    return null;
  }

  const handlePress = () => {
    // console.log("Finish editing pressed (just toggles state now)");
    setEditing(false);
 };

  return (
    <FlipButton
      bgColor="#f0f0f0"
      textColor="#000000"
      onPress={handlePress} // Use the combined handler
      style={styles.toggleButton}
      flipborderwidth={3}
    >
      {/* Replaced Text with StyledText */}
      <StyledText style={styles.toggleButtonText}>{t('MainMenuScreen_DoneButton')}</StyledText>
    </FlipButton>
  );
}

// --- Styles remain the same ---
const styles = StyleSheet.create({
  toggleButton: {
    width: 300,
    height: 70,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    // boxShadow is not standard RN, use elevation/shadow props if needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#000000",
    fontSize: 24, // Base font size is defined, so StyledText can scale it
    fontWeight: 'bold',
    textAlign: 'center',
  },
});