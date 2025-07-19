import React, { useState, useEffect } from "react";
import {
  Modal,
  Image as RNImage,
  StyleSheet,
  Dimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Custom components and hooks
import FlipButton from "./FlipButton";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";
import { t } from "i18next";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

function ImageViewModal({ visible, imageUri, onClose, onRemove, onAdd }) {
  const { settings } = useSettings(); // Get settings from context
  const [noImage, setNoImage] = useState(false);

  useEffect(() => {
    // Determine if an image is present when the component becomes visible
    setNoImage(!imageUri);
  }, [imageUri]);

  if (!visible) return null;

  // Determine layout based on font size multiplier
  const useColumnLayout = settings.fontSizeMultiplier >= 2.0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.contentBox}>
          <View style={styles.imageContainer}>
            {noImage ? (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={80} color="#a0a0a0" />
                <StyledText style={styles.noImageText}>
                  {t("No_Image_Available")}
                </StyledText>
              </View>
            ) : (
              <RNImage
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </View>

          <View
            style={[
              styles.buttonContainer,
              useColumnLayout && styles.buttonContainerColumn,
            ]}
          >
            <FlipButton
              onPress={noImage ? onAdd : onRemove}
              style={[
                styles.button,
                useColumnLayout && styles.buttonColumn,
                noImage ? styles.addButton : styles.removeButton,
              ]}
            >
              <Ionicons
                name={noImage ? "add-circle-outline" : "trash-outline"}
                size={24}
                color="#fff"
              />
              <StyledText style={styles.buttonText}>
                {noImage ? t("Add_Image") : t("Remove_Image")}
              </StyledText>
            </FlipButton>

            <FlipButton
              onPress={onClose}
              style={[
                styles.button,
                useColumnLayout && styles.buttonColumn,
                styles.returnButton,
              ]}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#fff" />
              <StyledText style={styles.buttonText}>{t("Return_Image")}</StyledText>
            </FlipButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  contentBox: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    width: "95%",
    maxWidth: 500,
    maxHeight: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  imageContainer: {
    width: "100%",
    flexShrink: 1, // Allow container to shrink to fit available space
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%", // Let resizeMode="contain" handle the aspect ratio
    borderRadius: 8,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noImageText: {
    marginTop: 10,
    fontSize: 18,
    color: "#a0a0a0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  buttonContainerColumn: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexGrow: 1,
    marginHorizontal: 10,
    borderWidth: 0, // Removed border for a flatter look
  },
  buttonColumn: {
    marginHorizontal: 0,
    marginBottom: 15,
  },
  removeButton: {
    backgroundColor: "#dc3545", // Solid red
  },
  addButton: {
    backgroundColor: "#28a745", // Solid green
  },
  returnButton: {
    backgroundColor: "#6c757d", // Solid gray
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#fff", // All buttons now have white text
  },
});

export default ImageViewModal;
