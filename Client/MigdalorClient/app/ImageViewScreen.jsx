import React from "react";
import { View, StyleSheet, SafeAreaView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import FlipButton from "../components/FlipButton";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../components/StyledText";

export default function ImageViewScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const params = useLocalSearchParams();
  const { imageUri, altText = "" } = params;

  const insets = useSafeAreaInsets();

  const handleReturn = () => {
    router.back();
  };

  if (!imageUri || typeof imageUri !== "string") {
    // Error handling remains the same
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StyledText style={styles.errorText}>
          {t("ImageViewScreen_ErrorNoImage")}
        </StyledText>
        <FlipButton onPress={handleReturn} style={styles.backButtonError}>
          <StyledText>{t("Common_backButton")}</StyledText>
        </FlipButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReactNativeZoomableView
        maxZoom={3.0}
        minZoom={1}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </ReactNativeZoomableView>

      <View style={[styles.topButtonContainer, { top: insets.top }]}>
        <FlipButton
          onPress={handleReturn}
          style={styles.topButton}
          bgColor="white"
          textColor="black"
        >
          <StyledText style={styles.buttonText}>
            {t("Common_backButton")}
          </StyledText>
          <Ionicons name="arrow-back" size={28} color="black" />
        </FlipButton>
      </View>

      <View style={styles.altTextContainer}>
        <StyledText style={styles.altTextStyle}>{altText}</StyledText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  // ✅ The wrapper container is no longer needed
  // container: { ... },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10,
  },
  topButton: {
    padding: 8,
    borderRadius: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "black",
  },
  errorText: {
    fontSize: 18,
    color: "#ff8a8a",
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonError: {
    backgroundColor: "#555",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  altTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  altTextStyle: {
    fontSize: 26,
    color: "#e0e0e0",
    textAlign: "center",
    lineHeight: 26,
  },
});
